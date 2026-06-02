import { AggregateRoot } from "./aggregate-root.js";
export type ExecutionSessionStatus = "created" | "started" | "paused" | "completed" | "failed" | "cancelled";
export interface ExecutionSessionProps {
    id: string;
    workspaceId: string;
    assignmentId: string;
    runtimeName: string;
}
export declare class ExecutionSession extends AggregateRoot {
    readonly workspaceId: string;
    readonly assignmentId: string;
    runtimeName: string;
    status: ExecutionSessionStatus;
    private lastSequenceNumber;
    private constructor();
    static create(props: ExecutionSessionProps): ExecutionSession;
    start(): void;
    pause(reason: string): void;
    complete(outputSummary: string): void;
    fail(errorMessage: string): void;
    cancel(reason: string): void;
    static fromState(state: {
        id: string;
        workspaceId: string;
        assignmentId: string;
        runtimeName: string;
        status: ExecutionSessionStatus;
        lastSequenceNumber: number;
        version: number;
    }): ExecutionSession;
    recordProgress(sequenceNumber: number, message: string): void;
}
//# sourceMappingURL=execution-session.d.ts.map