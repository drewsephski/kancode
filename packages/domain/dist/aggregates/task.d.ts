import { AggregateRoot } from "./aggregate-root.js";
export type TaskStatus = "open" | "assigned" | "in_progress" | "completed" | "failed" | "cancelled";
export interface TaskProps {
    id: string;
    workspaceId: string;
    workflowRunId: string;
    title: string;
    description?: string;
    orderIndex: number;
}
export declare class Task extends AggregateRoot {
    readonly workspaceId: string;
    readonly workflowRunId: string;
    title: string;
    description: string | undefined;
    readonly orderIndex: number;
    status: TaskStatus;
    private constructor();
    static create(props: TaskProps): Task;
    assign(assignmentId: string): void;
    start(): void;
    complete(): void;
    static fromState(state: {
        id: string;
        workspaceId: string;
        workflowRunId: string;
        title: string;
        description: string | undefined;
        orderIndex: number;
        status: TaskStatus;
        version: number;
    }): Task;
    fail(reason: string): void;
    cancel(reason: string): void;
}
//# sourceMappingURL=task.d.ts.map