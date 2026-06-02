import { AggregateRoot } from "./aggregate-root.js";
import { DomainError } from "../errors/domain-error.js";
export class Assignment extends AggregateRoot {
    workspaceId;
    taskId;
    status;
    executionSessionId;
    constructor(id, workspaceId, taskId, status, executionSessionId = null) {
        super(id);
        this.workspaceId = workspaceId;
        this.taskId = taskId;
        this.status = status;
        this.executionSessionId = executionSessionId;
    }
    static create(props) {
        const assignment = new Assignment(props.id, props.workspaceId, props.taskId, "pending");
        assignment.recordEvent({
            type: "assignment.created",
            occurredAt: new Date(),
            payload: props,
        });
        return assignment;
    }
    accept() {
        if (this.status !== "pending") {
            throw new DomainError("Assignment must be pending to accept", "assignment.invalid_state");
        }
        this.status = "accepted";
        this.recordEvent({
            type: "assignment.accepted",
            occurredAt: new Date(),
            payload: { assignmentId: this.id, workspaceId: this.workspaceId, taskId: this.taskId },
        });
    }
    start(executionSessionId) {
        if (this.status !== "accepted") {
            throw new DomainError("Assignment must be accepted to start", "assignment.invalid_state");
        }
        this.executionSessionId = executionSessionId;
        this.status = "executing";
        this.recordEvent({
            type: "assignment.executing",
            occurredAt: new Date(),
            payload: { assignmentId: this.id, workspaceId: this.workspaceId, executionSessionId },
        });
    }
    complete() {
        if (this.status !== "executing") {
            throw new DomainError("Assignment must be executing to complete", "assignment.invalid_state");
        }
        this.status = "completed";
        this.recordEvent({
            type: "assignment.completed",
            occurredAt: new Date(),
            payload: { assignmentId: this.id, workspaceId: this.workspaceId },
        });
    }
    fail(reason) {
        if (this.status === "completed" || this.status === "revoked" || this.status === "expired") {
            throw new DomainError("Assignment is terminal", "assignment.invalid_state");
        }
        this.status = "failed";
        this.recordEvent({
            type: "assignment.failed",
            occurredAt: new Date(),
            payload: { assignmentId: this.id, workspaceId: this.workspaceId, reason },
        });
    }
    revoke(reason) {
        if (this.status === "completed" || this.status === "revoked" || this.status === "expired") {
            throw new DomainError("Assignment is terminal", "assignment.invalid_state");
        }
        this.status = "revoked";
        this.recordEvent({
            type: "assignment.revoked",
            occurredAt: new Date(),
            payload: { assignmentId: this.id, workspaceId: this.workspaceId, reason },
        });
    }
    static fromState(state) {
        const assignment = new Assignment(state.id, state.workspaceId, state.taskId, state.status, state.executionSessionId);
        assignment._version = state.version;
        return assignment;
    }
    expire() {
        if (this.status === "completed" || this.status === "revoked" || this.status === "expired") {
            throw new DomainError("Assignment is terminal", "assignment.invalid_state");
        }
        this.status = "expired";
        this.recordEvent({
            type: "assignment.expired",
            occurredAt: new Date(),
            payload: { assignmentId: this.id, workspaceId: this.workspaceId },
        });
    }
}
//# sourceMappingURL=assignment.js.map