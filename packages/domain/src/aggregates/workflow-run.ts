import { AggregateRoot } from "./aggregate-root.js";
import { DomainError } from "../errors/domain-error.js";

export type WorkflowRunStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export interface WorkflowRunProps {
  id: string;
  workspaceId: string;
  workflowId: string;
  requestId: string;
}

export class WorkflowRun extends AggregateRoot {
  private constructor(
    id: string,
    public readonly workspaceId: string,
    public readonly workflowId: string,
    public readonly requestId: string,
    public status: WorkflowRunStatus,
  ) {
    super(id);
  }

  static create(props: WorkflowRunProps): WorkflowRun {
    const run = new WorkflowRun(props.id, props.workspaceId, props.workflowId, props.requestId, "queued");
    run.recordEvent({
      type: "workflow_run.created",
      occurredAt: new Date(),
      payload: props,
    });
    return run;
  }

  start(): void {
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

  complete(): void {
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

  static fromState(state: {
    id: string;
    workspaceId: string;
    workflowId: string;
    requestId: string;
    status: WorkflowRunStatus;
    version: number;
  }): WorkflowRun {
    const run = new WorkflowRun(state.id, state.workspaceId, state.workflowId, state.requestId, state.status);
    run._version = state.version;
    return run;
  }

  fail(reason: string): void {
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

  cancel(reason: string): void {
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
