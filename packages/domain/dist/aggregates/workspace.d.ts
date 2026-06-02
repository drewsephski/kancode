import { AggregateRoot } from "./aggregate-root.js";
export type WorkspaceStatus = "active" | "suspended" | "archived";
export interface WorkspaceProps {
    id: string;
    name: string;
    slug: string;
}
export declare class Workspace extends AggregateRoot {
    name: string;
    slug: string;
    status: WorkspaceStatus;
    private constructor();
    static create(props: WorkspaceProps): Workspace;
    suspend(reason: string): void;
    static fromState(state: {
        id: string;
        name: string;
        slug: string;
        status: WorkspaceStatus;
        version: number;
    }): Workspace;
    archive(reason: string): void;
}
//# sourceMappingURL=workspace.d.ts.map