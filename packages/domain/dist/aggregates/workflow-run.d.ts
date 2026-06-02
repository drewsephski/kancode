import { AggregateRoot } from "./aggregate-root.js";
export type WorkflowRunStatus = "queued" | "running" | "completed" | "failed" | "cancelled";
export interface WorkflowRunProps {
    id: string;
    workspaceId: string;
    workflowId: string;
    requestId: string;
}
export declare class WorkflowRun extends AggregateRoot {
    readonly workspaceId: string;
    readonly workflowId: string;
    readonly requestId: string;
    status: WorkflowRunStatus;
    private constructor();
    static create(props: WorkflowRunProps): WorkflowRun;
    start(): void;
    complete(): void;
    static fromState(state: {
        id: string;
        workspaceId: string;
        workflowId: string;
        requestId: string;
        status: WorkflowRunStatus;
        version: number;
    }): WorkflowRun;
    fail(reason: string): void;
    cancel(reason: string): void;
}
//# sourceMappingURL=workflow-run.d.ts.map