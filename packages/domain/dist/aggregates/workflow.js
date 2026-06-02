import { AggregateRoot } from "./aggregate-root.js";
import { DomainError } from "../errors/domain-error.js";
export class Workflow extends AggregateRoot {
    workspaceId;
    requestId;
    title;
    status;
    constructor(id, workspaceId, requestId, title, status) {
        super(id);
        this.workspaceId = workspaceId;
        this.requestId = requestId;
        this.title = title;
        this.status = status;
    }
    static create(props) {
        const workflow = new Workflow(props.id, props.workspaceId, props.requestId, props.title, "draft");
        workflow.recordEvent({
            type: "workflow.created",
            occurredAt: new Date(),
            payload: props,
        });
        return workflow;
    }
    plan() {
        if (this.status !== "draft") {
            throw new DomainError("Workflow must be draft to plan", "workflow.invalid_state");
        }
        this.status = "planned";
        this.recordEvent({
            type: "workflow.planned",
            occurredAt: new Date(),
            payload: { workflowId: this.id, workspaceId: this.workspaceId, requestId: this.requestId },
        });
    }
    static fromState(state) {
        const workflow = new Workflow(state.id, state.workspaceId, state.requestId, state.title, state.status);
        workflow._version = state.version;
        return workflow;
    }
    archive(reason) {
        if (this.status === "archived") {
            throw new DomainError("Workflow is already archived", "workflow.invalid_state");
        }
        this.status = "archived";
        this.recordEvent({
            type: "workflow.archived",
            occurredAt: new Date(),
            payload: { workflowId: this.id, workspaceId: this.workspaceId, reason },
        });
    }
}
//# sourceMappingURL=workflow.js.map