import assert from "node:assert/strict";
import test from "node:test";
import { WorkflowRunStateMachine } from "@kancode/orchestration";
const sm = new WorkflowRunStateMachine();
test("state machine: execution_session.failed transitions to failed from executing", () => {
    const d = sm.transition("executing", "execution_session.failed", { id: "es-1" });
    assert.equal(d.nextState, "failed");
    assert.equal(d.commands.length, 0);
    assert.ok(sm.isAccepting("failed"), "failed should be an accepting state");
});
test("state machine: execution_session.failed transitions to failed from awaiting_execution", () => {
    const d = sm.transition("awaiting_execution", "execution_session.failed", { id: "es-1" });
    assert.equal(d.nextState, "failed");
    assert.equal(d.commands.length, 0);
});
test("state machine: execution_session.failed is ignored from planning", () => {
    const d = sm.transition("planning", "execution_session.failed", { id: "es-1" });
    assert.equal(d.nextState, "planning", "should stay in planning");
    assert.equal(d.commands.length, 0);
});
test("state machine: execution_session.failed is ignored from completed", () => {
    const d = sm.transition("completed", "execution_session.failed", { id: "es-1" });
    assert.equal(d.nextState, "completed", "completed is terminal");
    assert.equal(d.commands.length, 0);
});
test("state machine: failed is terminal and ignores all subsequent events", () => {
    const events = [
        "request.submitted",
        "workflow_run.created",
        "task.created",
        "task.assigned",
        "execution_session.started",
        "execution_session.completed",
        "execution_session.failed",
        "request.completed",
    ];
    for (const event of events) {
        const d = sm.transition("failed", event, { id: "x" });
        assert.equal(d.nextState, "failed", `failed should ignore ${event}`);
        assert.equal(d.commands.length, 0, `failed should produce no commands for ${event}`);
    }
});
test("state machine: full flow through failure path", () => {
    // Normal flow until executing, then fail
    const flow = [
        { state: "pending", event: "request.submitted", expectedState: "planning" },
        { state: "planning", event: "workflow_run.created", expectedState: "awaiting_assignment" },
        { state: "awaiting_assignment", event: "task.created", expectedState: "awaiting_assignment" },
        { state: "awaiting_assignment", event: "task.assigned", expectedState: "awaiting_execution" },
        { state: "awaiting_execution", event: "execution_session.failed", expectedState: "failed" },
    ];
    for (const { state, event, expectedState } of flow) {
        const d = sm.transition(state, event, {});
        assert.equal(d.nextState, expectedState, `${state} + ${event} should → ${expectedState}`);
    }
});
//# sourceMappingURL=failure-recovery.integration.test.js.map