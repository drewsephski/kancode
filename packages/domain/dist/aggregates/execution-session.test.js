import assert from "node:assert/strict";
import test from "node:test";
import { ExecutionSession } from "./execution-session.js";
import { DomainError } from "../errors/domain-error.js";
test("execution session completion rules", () => {
    const session = ExecutionSession.create({
        id: "execution_session_1",
        workspaceId: "workspace_1",
        assignmentId: "assignment_1",
        runtimeName: "Claude Code",
    });
    assert.equal(session.status, "created");
    assert.equal(session.version, 1);
    assert.throws(() => session.complete("done"), (error) => error instanceof DomainError);
    assert.throws(() => session.recordProgress(1, "too early"), (error) => error instanceof DomainError);
    session.start();
    assert.equal(session.status, "started");
    assert.equal(session.version, 2);
    session.recordProgress(1, "initial checkpoint");
    assert.equal(session.version, 3);
    assert.throws(() => session.recordProgress(1, "duplicate checkpoint"), (error) => error instanceof DomainError);
    session.complete("all done");
    assert.equal(session.status, "completed");
    assert.equal(session.version, 4);
});
//# sourceMappingURL=execution-session.test.js.map