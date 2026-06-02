import { AggregateRoot } from "./aggregate-root.js";
import { DomainError } from "../errors/domain-error.js";

export type WorkflowStatus = "draft" | "planned" | "archived";

export interface WorkflowProps {
  id: string;
  workspaceId: string;
  requestId: string;
  title: string;
}

export class Workflow extends AggregateRoot {
  private constructor(
    id: string,
    public readonly workspaceId: string,
    public readonly requestId: string,
    public title: string,
    public status: WorkflowStatus,
  ) {
    super(id);
  }

  static create(props: WorkflowProps): Workflow {
    const workflow = new Workflow(props.id, props.workspaceId, props.requestId, props.title, "draft");
    workflow.recordEvent({
      type: "workflow.created",
      occurredAt: new Date(),
      payload: props,
    });
    return workflow;
  }

  plan(): void {
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

  static fromState(state: {
    id: string;
    workspaceId: string;
    requestId: string;
    title: string;
    status: WorkflowStatus;
    version: number;
  }): Workflow {
    const workflow = new Workflow(state.id, state.workspaceId, state.requestId, state.title, state.status);
    workflow._version = state.version;
    return workflow;
  }

  archive(reason: string): void {
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
