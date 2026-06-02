import { AggregateRoot } from "./aggregate-root.js";
export type WorkflowStatus = "draft" | "planned" | "archived";
export interface WorkflowProps {
    id: string;
    workspaceId: string;
    requestId: string;
    title: string;
}
export declare class Workflow extends AggregateRoot {
    readonly workspaceId: string;
    readonly requestId: string;
    title: string;
    status: WorkflowStatus;
    private constructor();
    static create(props: WorkflowProps): Workflow;
    plan(): void;
    static fromState(state: {
        id: string;
        workspaceId: string;
        requestId: string;
        title: string;
        status: WorkflowStatus;
        version: number;
    }): Workflow;
    archive(reason: string): void;
}
//# sourceMappingURL=workflow.d.ts.map