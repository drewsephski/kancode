import { AggregateRoot } from "./aggregate-root.js";
import { DomainError } from "../errors/domain-error.js";
export class WorkflowRun extends AggregateRoot {
    workspaceId;
    workflowId;
    requestId;
    status;
    constructor(id, workspaceId, workflowId, requestId, status) {
        super(id);
        this.workspaceId = workspaceId;
        this.workflowId = workflowId;
        this.requestId = requestId;
        this.status = status;
    }
    static create(props) {
        const run = new WorkflowRun(props.id, props.workspaceId, props.workflowId, props.requestId, "queued");
        run.recordEvent({
            type: "workflow_run.created",
            occurredAt: new Date(),
            payload: props,
        });
        return run;
    }
    start() {
        if (this.status !== "queued") {
            throw new DomainError("Workflow run must be queued to start", "workflow_run.invalid_state");
        }
        this.status = "running";
        this.recordEvent({
            type: "workflow_run.started",
            occurredAt: new Date(),
            payload: { workflowRunId: this.id, workspaceId: this.workspaceId },
        });
    }
    complete() {
        if (this.status !== "running") {
            throw new DomainError("Workflow run must be running to complete", "workflow_run.invalid_state");
        }
        this.status = "completed";
        this.recordEvent({
            type: "workflow_run.completed",
            occurredAt: new Date(),
            payload: { workflowRunId: this.id, workspaceId: this.workspaceId },
        });
    }
    static fromState(state) {
        const run = new WorkflowRun(state.id, state.workspaceId, state.workflowId, state.requestId, state.status);
        run._version = state.version;
        return run;
    }
    fail(reason) {
        if (this.status === "completed" || this.status === "cancelled") {
            throw new DomainError("Workflow run is terminal", "workflow_run.invalid_state");
        }
        this.status = "failed";
        this.recordEvent({
            type: "workflow_run.failed",
            occurredAt: new Date(),
            payload: { workflowRunId: this.id, workspaceId: this.workspaceId, reason },
        });
    }
    cancel(reason) {
        if (this.status === "completed" || this.status === "cancelled") {
            throw new DomainError("Workflow run is terminal", "workflow_run.invalid_state");
        }
        this.status = "cancelled";
        this.recordEvent({
            type: "workflow_run.cancelled",
            occurredAt: new Date(),
            payload: { workflowRunId: this.id, workspaceId: this.workspaceId, reason },
        });
    }
}
//# sourceMappingURL=workflow-run.js.map