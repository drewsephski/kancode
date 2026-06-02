import { AggregateRoot } from "./aggregate-root.js";
import { DomainError } from "../errors/domain-error.js";

export type WorkspaceStatus = "active" | "suspended" | "archived";

export interface WorkspaceProps {
  id: string;
  name: string;
  slug: string;
}

export class Workspace extends AggregateRoot {
  private constructor(
    id: string,
    public name: string,
    public slug: string,
    public status: WorkspaceStatus,
  ) {
    super(id);
  }

  static create(props: WorkspaceProps): Workspace {
    const workspace = new Workspace(props.id, props.name, props.slug, "active");
    workspace.recordEvent({
      type: "workspace.created",
      occurredAt: new Date(),
      payload: props,
    });
    return workspace;
  }

  suspend(reason: string): void {
    if (this.status !== "active") {
      throw new DomainError("Workspace must be active to suspend", "workspace.invalid_state");
    }

    this.status = "suspended";
    this.recordEvent({
      type: "workspace.suspended",
      occurredAt: new Date(),
      payload: { workspaceId: this.id, reason },
    });
  }

  static fromState(state: {
    id: string;
    name: string;
    slug: string;
    status: WorkspaceStatus;
    version: number;
  }): Workspace {
    const workspace = new Workspace(state.id, state.name, state.slug, state.status);
    workspace._version = state.version;
    return workspace;
  }

  archive(reason: string): void {
    if (this.status === "archived") {
      throw new DomainError("Workspace is already archived", "workspace.invalid_state");
    }

    this.status = "archived";
    this.recordEvent({
      type: "workspace.archived",
      occurredAt: new Date(),
      payload: { workspaceId: this.id, reason },
    });
  }
}
