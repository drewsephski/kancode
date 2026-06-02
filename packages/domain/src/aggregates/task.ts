import { AggregateRoot } from "./aggregate-root.js";
import { DomainError } from "../errors/domain-error.js";

export type TaskStatus = "open" | "assigned" | "in_progress" | "completed" | "failed" | "cancelled";

export interface TaskProps {
  id: string;
  workspaceId: string;
  workflowRunId: string;
  title: string;
  description?: string;
  orderIndex: number;
}

export class Task extends AggregateRoot {
  private constructor(
    id: string,
    public readonly workspaceId: string,
    public readonly workflowRunId: string,
    public title: string,
    public description: string | undefined,
    public readonly orderIndex: number,
    public status: TaskStatus,
  ) {
    super(id);
  }

  static create(props: TaskProps): Task {
    const task = new Task(
      props.id,
      props.workspaceId,
      props.workflowRunId,
      props.title,
      props.description,
      props.orderIndex,
      "open",
    );
    task.recordEvent({
      type: "task.created",
      occurredAt: new Date(),
      payload: props,
    });
    return task;
  }

  assign(assignmentId: string): void {
    if (this.status !== "open") {
      throw new DomainError("Task must be open to assign", "task.invalid_state");
    }

    this.status = "assigned";
    this.recordEvent({
      type: "task.assigned",
      occurredAt: new Date(),
      payload: { taskId: this.id, workspaceId: this.workspaceId, assignmentId },
    });
  }

  start(): void {
    if (this.status !== "assigned") {
      throw new DomainError("Task must be assigned to start", "task.invalid_state");
    }

    this.status = "in_progress";
    this.recordEvent({
      type: "task.started",
      occurredAt: new Date(),
      payload: { taskId: this.id, workspaceId: this.workspaceId },
    });
  }

  complete(): void {
    if (this.status !== "in_progress") {
      throw new DomainError("Task must be in progress to complete", "task.invalid_state");
    }

    this.status = "completed";
    this.recordEvent({
      type: "task.completed",
      occurredAt: new Date(),
      payload: { taskId: this.id, workspaceId: this.workspaceId },
    });
  }

  static fromState(state: {
    id: string;
    workspaceId: string;
    workflowRunId: string;
    title: string;
    description: string | undefined;
    orderIndex: number;
    status: TaskStatus;
    version: number;
  }): Task {
    const task = new Task(
      state.id,
      state.workspaceId,
      state.workflowRunId,
      state.title,
      state.description,
      state.orderIndex,
      state.status,
    );
    task._version = state.version;
    return task;
  }

  fail(reason: string): void {
    if (this.status === "completed" || this.status === "cancelled") {
      throw new DomainError("Task is terminal", "task.invalid_state");
    }

    this.status = "failed";
    this.recordEvent({
      type: "task.failed",
      occurredAt: new Date(),
      payload: { taskId: this.id, workspaceId: this.workspaceId, reason },
    });
  }

  cancel(reason: string): void {
    if (this.status === "completed" || this.status === "cancelled") {
      throw new DomainError("Task is terminal", "task.invalid_state");
    }

    this.status = "cancelled";
    this.recordEvent({
      type: "task.cancelled",
      occurredAt: new Date(),
      payload: { taskId: this.id, workspaceId: this.workspaceId, reason },
    });
  }
}
