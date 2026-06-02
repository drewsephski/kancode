import { AggregateRoot } from "./aggregate-root.js";
import { DomainError } from "../errors/domain-error.js";
export class Workspace extends AggregateRoot {
    name;
    slug;
    status;
    constructor(id, name, slug, status) {
        super(id);
        this.name = name;
        this.slug = slug;
        this.status = status;
    }
    static create(props) {
        const workspace = new Workspace(props.id, props.name, props.slug, "active");
        workspace.recordEvent({
            type: "workspace.created",
            occurredAt: new Date(),
            payload: props,
        });
        return workspace;
    }
    suspend(reason) {
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
    static fromState(state) {
        const workspace = new Workspace(state.id, state.name, state.slug, state.status);
        workspace._version = state.version;
        return workspace;
    }
    archive(reason) {
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
//# sourceMappingURL=workspace.js.map