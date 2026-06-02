import { AggregateRoot } from "./aggregate-root.js";
export type AssignmentStatus = "pending" | "accepted" | "executing" | "completed" | "failed" | "revoked" | "expired";
export interface AssignmentProps {
    id: string;
    workspaceId: string;
    taskId: string;
}
export declare class Assignment extends AggregateRoot {
    readonly workspaceId: string;
    readonly taskId: string;
    status: AssignmentStatus;
    executionSessionId: string | null;
    private constructor();
    static create(props: AssignmentProps): Assignment;
    accept(): void;
    start(executionSessionId: string): void;
    complete(): void;
    fail(reason: string): void;
    revoke(reason: string): void;
    static fromState(state: {
        id: string;
        workspaceId: string;
        taskId: string;
        status: AssignmentStatus;
        executionSessionId: string | null;
        version: number;
    }): Assignment;
    expire(): void;
}
//# sourceMappingURL=assignment.d.ts.map