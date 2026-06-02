import assert from "node:assert/strict";
import test from "node:test";
import { Assignment } from "./assignment.js";
import { DomainError } from "../errors/domain-error.js";
test("assignment enforces its execution lifecycle", () => {
    const assignment = Assignment.create({
        id: "assignment_1",
        workspaceId: "workspace_1",
        taskId: "task_1",
    });
    assert.equal(assignment.status, "pending");
    assert.equal(assignment.version, 1);
    assert.throws(() => assignment.complete(), (error) => error instanceof DomainError);
    assignment.accept();
    assert.equal(assignment.status, "accepted");
    assert.equal(assignment.version, 2);
    assignment.start("execution_session_1");
    assert.equal(assignment.status, "executing");
    assert.equal(assignment.executionSessionId, "execution_session_1");
    assert.equal(assignment.version, 3);
    assignment.complete();
    assert.equal(assignment.status, "completed");
    assert.equal(assignment.version, 4);
    assert.throws(() => assignment.revoke("too late"), (error) => error instanceof DomainError);
});
test("assignment cannot start before acceptance", () => {
    const assignment = Assignment.create({
        id: "assignment_2",
        workspaceId: "workspace_1",
        taskId: "task_1",
    });
    assert.throws(() => assignment.start("execution_session_2"), (error) => error instanceof DomainError);
});
//# sourceMappingURL=assignment.test.js.map