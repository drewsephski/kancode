import assert from "node:assert/strict";
import test from "node:test";
import { Workflow } from "./workflow.js";
test("aggregate event emission preserves sequence and clears on pull", () => {
    const workflow = Workflow.create({
        id: "workflow_1",
        workspaceId: "workspace_1",
        requestId: "request_1",
        title: "Stripe subscriptions",
    });
    workflow.plan();
    const events = workflow.pullEvents();
    assert.equal(events.length, 2);
    assert.deepEqual(events.map((event) => event.type), ["workflow.created", "workflow.planned"]);
    assert.deepEqual(events.map((event) => event.version), [1, 2]);
    assert.equal(workflow.pullEvents().length, 0);
});
//# sourceMappingURL=aggregate-event-emission.test.js.map