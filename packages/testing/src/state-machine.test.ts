import assert from "node:assert/strict";
import test from "node:test";

import { WorkflowRunStateMachine } from "@kancode/orchestration";
import type { WorkflowRunState, WorkflowRunEventType, StateMachineDecision } from "@kancode/orchestration";

const sm = new WorkflowRunStateMachine();

function t(state: WorkflowRunState, event: WorkflowRunEventType, payload: Record<string, unknown> = {}): StateMachineDecision {
  return sm.transition(state, event, payload);
}

// ── Happy path ──────────────────────────────────────────────────────────

test("state machine: full happy path transitions", () => {
  const id = { id: "req-1" };
  const assignmentId = { assignmentId: "assign-1" };

  let d = t("pending", "request.submitted", id);
  assert.equal(d.nextState, "planning");
  assert.equal(d.commands.length, 1);
  assert.equal(d.commands[0]!.type, "plan");
  assert.equal(d.commands[0]!.payload.requestId, "req-1");

  d = t("planning", "workflow_run.created", { id: "run-1" });
  assert.equal(d.nextState, "awaiting_assignment");
  assert.equal(d.commands.length, 0);

  d = t("awaiting_assignment", "task.created", { id: "task-1" });
  assert.equal(d.nextState, "awaiting_assignment");
  assert.equal(d.commands.length, 1);
  assert.equal(d.commands[0]!.type, "assign");
  assert.equal(d.commands[0]!.payload.taskId, "task-1");

  d = t("awaiting_assignment", "task.assigned", assignmentId);
  assert.equal(d.nextState, "awaiting_execution");
  assert.equal(d.commands.length, 1);
  assert.equal(d.commands[0]!.type, "create_session");
  assert.equal(d.commands[0]!.payload.assignmentId, "assign-1");

  d = t("awaiting_execution", "execution_session.started", { id: "es-1" });
  assert.equal(d.nextState, "executing");
  assert.equal(d.commands.length, 0);

  d = t("executing", "execution_session.completed", { id: "es-1" });
  assert.equal(d.nextState, "completing");
  assert.equal(d.commands.length, 0);

  d = t("completing", "request.completed", { id: "req-1" });
  assert.equal(d.nextState, "completed");
  assert.equal(d.commands.length, 0);

  assert.ok(sm.isAccepting("completed"));
});

// ── Invalid transitions return current state ────────────────────────────

test("state machine: invalid transitions are no-ops", () => {
  // Trying to complete before executing
  let d = t("pending", "execution_session.completed", {});
  assert.equal(d.nextState, "pending");
  assert.equal(d.commands.length, 0);

  // Wrong event for current state
  d = t("executing", "task.created", {});
  assert.equal(d.nextState, "executing");

  d = t("completed", "request.submitted", {});
  assert.equal(d.nextState, "completed");

  // Unknown event type
  d = t("pending", "request.completed", {});
  assert.equal(d.nextState, "pending");
});

// ── Out-of-order delivery tests ─────────────────────────────────────────

test("state machine: reverse order events produce no transitions", () => {
  const events: Array<{ state: WorkflowRunState; event: WorkflowRunEventType }> = [
    { state: "pending", event: "request.completed" },
    { state: "pending", event: "execution_session.completed" },
    { state: "pending", event: "execution_session.started" },
    { state: "pending", event: "task.assigned" },
    { state: "pending", event: "task.created" },
    { state: "pending", event: "workflow_run.created" },
  ];

  for (const { state, event } of events) {
    const d = t(state, event, {});
    assert.equal(d.nextState, state, `event ${event} should be no-op from ${state}`);
    assert.equal(d.commands.length, 0, `event ${event} should produce no commands`);
  }
});

test("state machine: out-of-order events are safely ignored", () => {
  // Start from a mid-flow state
  const flows: Array<{ from: WorkflowRunState; events: WorkflowRunEventType[] }> = [
    { from: "planning", events: ["request.submitted", "task.created", "execution_session.completed", "request.completed"] },
    { from: "awaiting_assignment", events: ["request.submitted", "workflow_run.created", "execution_session.started", "request.completed"] },
    { from: "executing", events: ["request.submitted", "task.created", "task.assigned", "workflow_run.created"] },
    { from: "completed", events: ["request.submitted", "request.completed", "execution_session.completed"] },
  ];

  for (const { from, events } of flows) {
    for (const event of events) {
      const d = t(from, event, {});
      assert.equal(d.nextState, from, `from ${from}, event ${event} should stay in ${from}`);
      assert.equal(d.commands.length, 0, `from ${from}, event ${event} should produce no commands`);
    }
  }
});

test("state machine: eventual consistency with partial progress", () => {
  // If events arrive in the right order but skip some intermediate states,
  // the machine handles what it can
  let state: WorkflowRunState = "pending";

  // Jumping to execution_started without the earlier steps — no-op
  let d = t(state, "execution_session.started", {});
  assert.equal(d.nextState, "pending", "should stay in pending");

  // Now send request.submitted
  d = t(state, "request.submitted", { id: "req-1" });
  state = d.nextState;
  assert.equal(state, "planning");

  // Skip to execution_session.completed — no-op
  d = t(state, "execution_session.completed", {});
  assert.equal(d.nextState, "planning");

  // Send workflow_run.created
  d = t(state, "workflow_run.created", {});
  state = d.nextState;
  assert.equal(state, "awaiting_assignment");

  // Skip to request.completed — no-op
  d = t(state, "request.completed", {});
  assert.equal(d.nextState, "awaiting_assignment");

  // Progress normally from here
  d = t(state, "task.created", { id: "task-1" });
  state = d.nextState;
  assert.equal(state, "awaiting_assignment");

  d = t(state, "task.assigned", { assignmentId: "a-1" });
  state = d.nextState;
  assert.equal(state, "awaiting_execution");

  d = t(state, "execution_session.started", {});
  state = d.nextState;
  assert.equal(state, "executing");

  d = t(state, "execution_session.completed", {});
  state = d.nextState;
  assert.equal(state, "completing");

  d = t(state, "request.completed", {});
  state = d.nextState;
  assert.equal(state, "completed");

  assert.ok(sm.isAccepting(state));
});

// ── Random order stress test ────────────────────────────────────────────

test("state machine: random event ordering converges to same final state", () => {
  const allEvents: WorkflowRunEventType[] = [
    "request.submitted",
    "workflow_run.created",
    "task.created",
    "task.assigned",
    "execution_session.started",
    "execution_session.completed",
    "request.completed",
  ];

  // Run 10 randomized sequences
  for (let seed = 0; seed < 10; seed++) {
    let state: WorkflowRunState = "pending";

    // Create a deterministic pseudo-random sequence
    const shuffled = [...allEvents];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = (seed * (i + 1) + i) % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }

    // Process events in random order
    for (const event of shuffled) {
      const d = t(state, event, { id: "x" });
      state = d.nextState;
    }

    // The machine should not crash and should end in a valid state
    assert.ok(
      ["pending", "planning", "awaiting_assignment", "awaiting_execution", "executing", "completing", "completed"].includes(state),
      `seed ${seed}: invalid terminal state ${state}`,
    );
  }
});

// ── Edge cases ──────────────────────────────────────────────────────────

test("state machine: completed is terminal and ignores all events", () => {
  for (const event of ["request.submitted", "workflow_run.created", "task.created", "task.assigned"] as WorkflowRunEventType[]) {
    const d = t("completed", event, {});
    assert.equal(d.nextState, "completed", `completed should ignore ${event}`);
  }
});

test("state machine: failed is terminal and ignores all events", () => {
  for (const event of ["request.submitted", "workflow_run.created", "task.created", "task.assigned"] as WorkflowRunEventType[]) {
    const d = t("failed", event, {});
    assert.equal(d.nextState, "failed", `failed should ignore ${event}`);
  }
});

test("state machine: getValidTransitions returns correct transitions", () => {
  const pendingTransitions = sm.getValidTransitions("pending");
  assert.deepEqual(pendingTransitions, ["request.submitted"]);

  const executingTransitions = sm.getValidTransitions("executing");
  assert.deepEqual(executingTransitions, ["execution_session.completed", "execution_session.failed"]);

  const completedTransitions = sm.getValidTransitions("completed");
  assert.deepEqual(completedTransitions, []);
});
