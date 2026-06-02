import { AggregateRoot } from "./aggregate-root.js";
import { DomainError } from "../errors/domain-error.js";
export class ExecutionSession extends AggregateRoot {
    workspaceId;
    assignmentId;
    runtimeName;
    status;
    lastSequenceNumber = 0;
    constructor(id, workspaceId, assignmentId, runtimeName, status) {
        super(id);
        this.workspaceId = workspaceId;
        this.assignmentId = assignmentId;
        this.runtimeName = runtimeName;
        this.status = status;
    }
    static create(props) {
        const session = new ExecutionSession(props.id, props.workspaceId, props.assignmentId, props.runtimeName, "created");
        session.recordEvent({
            type: "execution_session.created",
            occurredAt: new Date(),
            payload: props,
        });
        return session;
    }
    start() {
        if (this.status !== "created") {
            throw new DomainError("Execution session must be created to start", "execution_session.invalid_state");
        }
        this.status = "started";
        this.recordEvent({
            type: "execution_session.started",
            occurredAt: new Date(),
            payload: { executionSessionId: this.id, workspaceId: this.workspaceId },
        });
    }
    pause(reason) {
        if (this.status !== "started") {
            throw new DomainError("Execution session must be started to pause", "execution_session.invalid_state");
        }
        this.status = "paused";
        this.recordEvent({
            type: "execution_session.paused",
            occurredAt: new Date(),
            payload: { executionSessionId: this.id, workspaceId: this.workspaceId, reason },
        });
    }
    complete(outputSummary) {
        if (this.status !== "started" && this.status !== "paused") {
            throw new DomainError("Execution session must be active to complete", "execution_session.invalid_state");
        }
        this.status = "completed";
        this.recordEvent({
            type: "execution_session.completed",
            occurredAt: new Date(),
            payload: { executionSessionId: this.id, workspaceId: this.workspaceId, outputSummary },
        });
    }
    fail(errorMessage) {
        if (this.status === "completed" || this.status === "cancelled") {
            throw new DomainError("Execution session is terminal", "execution_session.invalid_state");
        }
        this.status = "failed";
        this.recordEvent({
            type: "execution_session.failed",
            occurredAt: new Date(),
            payload: { executionSessionId: this.id, workspaceId: this.workspaceId, errorMessage },
        });
    }
    cancel(reason) {
        if (this.status === "completed" || this.status === "cancelled") {
            throw new DomainError("Execution session is terminal", "execution_session.invalid_state");
        }
        this.status = "cancelled";
        this.recordEvent({
            type: "execution_session.cancelled",
            occurredAt: new Date(),
            payload: { executionSessionId: this.id, workspaceId: this.workspaceId, reason },
        });
    }
    static fromState(state) {
        const session = new ExecutionSession(state.id, state.workspaceId, state.assignmentId, state.runtimeName, state.status);
        session.lastSequenceNumber = state.lastSequenceNumber;
        session._version = state.version;
        return session;
    }
    recordProgress(sequenceNumber, message) {
        if (this.status !== "started" && this.status !== "paused") {
            throw new DomainError("Execution session must be active to record progress", "execution_session.invalid_state");
        }
        if (sequenceNumber <= this.lastSequenceNumber) {
            throw new DomainError("Progress sequence number must increase", "execution_session.sequence");
        }
        this.lastSequenceNumber = sequenceNumber;
        this.recordEvent({
            type: "execution_session.progressed",
            occurredAt: new Date(),
            payload: {
                executionSessionId: this.id,
                workspaceId: this.workspaceId,
                sequenceNumber,
                message,
            },
        });
    }
}
//# sourceMappingURL=execution-session.js.map