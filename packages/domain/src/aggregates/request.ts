import { AggregateRoot } from "./aggregate-root.js";
import { DomainError } from "../errors/domain-error.js";

export type RequestStatus =
  | "submitted"
  | "clarification_needed"
  | "ready_for_planning"
  | "planned"
  | "cancelled"
  | "completed";

export interface RequestProps {
  id: string;
  workspaceId: string;
  requestText: string;
}

export class Request extends AggregateRoot {
  private constructor(
    id: string,
    public readonly workspaceId: string,
    public requestText: string,
    public status: RequestStatus,
  ) {
    super(id);
  }

  static submit(props: RequestProps): Request {
    const request = new Request(props.id, props.workspaceId, props.requestText, "submitted");
    request.recordEvent({
      type: "request.submitted",
      occurredAt: new Date(),
      payload: props,
    });
    return request;
  }

  requestClarification(): void {
    if (this.status !== "submitted") {
      throw new DomainError("Request must be submitted to request clarification", "request.invalid_state");
    }

    this.status = "clarification_needed";
    this.recordEvent({
      type: "request.clarification_needed",
      occurredAt: new Date(),
      payload: { requestId: this.id, workspaceId: this.workspaceId },
    });
  }

  markReadyForPlanning(): void {
    if (this.status !== "submitted" && this.status !== "clarification_needed") {
      throw new DomainError("Request is not in a plannable state", "request.invalid_state");
    }

    this.status = "ready_for_planning";
    this.recordEvent({
      type: "request.ready_for_planning",
      occurredAt: new Date(),
      payload: { requestId: this.id, workspaceId: this.workspaceId },
    });
  }

  markPlanned(): void {
    if (this.status !== "ready_for_planning") {
      throw new DomainError("Request must be ready for planning", "request.invalid_state");
    }

    this.status = "planned";
    this.recordEvent({
      type: "request.planned",
      occurredAt: new Date(),
      payload: { requestId: this.id, workspaceId: this.workspaceId },
    });
  }

  cancel(reason: string): void {
    this.ensureMutable();
    this.status = "cancelled";
    this.recordEvent({
      type: "request.cancelled",
      occurredAt: new Date(),
      payload: { requestId: this.id, workspaceId: this.workspaceId, reason },
    });
  }

  complete(): void {
    if (this.status !== "planned") {
      throw new DomainError("Request must be planned before completion", "request.invalid_state");
    }

    this.status = "completed";
    this.recordEvent({
      type: "request.completed",
      occurredAt: new Date(),
      payload: { requestId: this.id, workspaceId: this.workspaceId },
    });
  }

  static fromState(state: {
    id: string;
    workspaceId: string;
    requestText: string;
    status: RequestStatus;
    version: number;
  }): Request {
    const request = new Request(state.id, state.workspaceId, state.requestText, state.status);
    request._version = state.version;
    return request;
  }

  private ensureMutable(): void {
    if (this.status === "cancelled" || this.status === "completed") {
      throw new DomainError("Request is terminal", "request.terminal");
    }
  }
}
