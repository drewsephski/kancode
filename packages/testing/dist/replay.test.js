import assert from "node:assert/strict";
import test from "node:test";
import { FakeDomainEventStore } from "@kancode/testing";
import { WorkflowReplayService, WorkflowRunStateMachine } from "@kancode/orchestration";
test("replay: reconstructs state machine transitions from event store", async () => {
    const eventStore = new FakeDomainEventStore();
    const stateMachine = new WorkflowRunStateMachine();
    const replay = new WorkflowReplayService(eventStore, stateMachine);
    // Feed events in the order they would be stored.
    // All events use the same ID so replay can find them.
    const wid = "wf-1";
    await eventStore.append([
        { type: "request.submitted", occurredAt: new Date("2025-01-01T00:00:01Z"), payload: { id: wid, workspaceId: "ws-1", requestText: "Replay test" }, version: 1 },
        { type: "workflow_run.created", occurredAt: new Date("2025-01-01T00:00:02Z"), payload: { id: wid }, version: 1 },
        { type: "task.created", occurredAt: new Date("2025-01-01T00:00:03Z"), payload: { id: wid }, version: 1 },
        { type: "task.assigned", occurredAt: new Date("2025-01-01T00:00:04Z"), payload: { id: wid, assignmentId: wid, taskId: wid }, version: 1 },
        { type: "execution_session.started", occurredAt: new Date("2025-01-01T00:00:05Z"), payload: { id: wid }, version: 1 },
        { type: "execution_session.completed", occurredAt: new Date("2025-01-01T00:00:06Z"), payload: { id: wid }, version: 1 },
        { type: "request.completed", occurredAt: new Date("2025-01-01T00:00:07Z"), payload: { id: wid }, version: 1 },
    ]);
    const result = await replay.replay(wid);
    assert.equal(result.finalState, "completed");
    assert.ok(result.transitions.length >= 1);
    // Verify transition chain
    const stateChain = result.transitions.map((t) => `${t.fromState} → ${t.toState}`);
    assert.ok(result.transitions.some((t) => t.fromState === "pending" && t.toState === "planning"));
    assert.ok(result.transitions.some((t) => t.toState === "completed"), "should reach completed");
});
test("replay: partial event stream produces intermediate state", async () => {
    const eventStore = new FakeDomainEventStore();
    const stateMachine = new WorkflowRunStateMachine();
    const replay = new WorkflowReplayService(eventStore, stateMachine);
    // Only first two events
    await eventStore.append([
        { type: "request.submitted", occurredAt: new Date(), payload: { id: "wf-2" }, version: 1 },
        { type: "workflow_run.created", occurredAt: new Date(), payload: { id: "wf-2" }, version: 1 },
    ]);
    const result = await replay.replay("wf-2");
    assert.equal(result.finalState, "awaiting_assignment");
    assert.equal(result.transitions.length, 2);
    assert.equal(result.transitions[0].fromState, "pending");
    assert.equal(result.transitions[0].toState, "planning");
    assert.equal(result.transitions[1].fromState, "planning");
    assert.equal(result.transitions[1].toState, "awaiting_assignment");
});
test("replay: formatReplay produces readable output", async () => {
    const eventStore = new FakeDomainEventStore();
    const stateMachine = new WorkflowRunStateMachine();
    const replay = new WorkflowReplayService(eventStore, stateMachine);
    const wid = "wf-3";
    await eventStore.append([
        { type: "request.submitted", occurredAt: new Date(), payload: { id: wid }, version: 1 },
        { type: "workflow_run.created", occurredAt: new Date(), payload: { id: wid }, version: 1 },
        { type: "task.created", occurredAt: new Date(), payload: { id: wid }, version: 1 },
        { type: "task.assigned", occurredAt: new Date(), payload: { id: wid, assignmentId: wid, taskId: wid }, version: 1 },
        { type: "execution_session.started", occurredAt: new Date(), payload: { id: wid }, version: 1 },
        { type: "execution_session.completed", occurredAt: new Date(), payload: { id: wid }, version: 1 },
        { type: "request.completed", occurredAt: new Date(), payload: { id: wid }, version: 1 },
    ]);
    const result = await replay.replay(wid);
    const output = replay.formatReplay(result);
    assert.ok(output.includes("final state: completed"));
    assert.ok(output.includes("request.submitted"));
    assert.ok(output.includes("[command: plan]"));
    assert.ok(output.includes("[command: assign]"));
    assert.ok(output.includes("[command: create_session]"));
});
test("replay: no events produces pending state", async () => {
    const eventStore = new FakeDomainEventStore();
    const replay = new WorkflowReplayService(eventStore, new WorkflowRunStateMachine());
    const result = await replay.replay("nonexistent");
    assert.equal(result.finalState, "pending");
    assert.equal(result.transitions.length, 0);
});
//# sourceMappingURL=replay.test.js.map