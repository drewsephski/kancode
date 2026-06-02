import { AggregateRoot } from "./aggregate-root.js";
export type RequestStatus = "submitted" | "clarification_needed" | "ready_for_planning" | "planned" | "cancelled" | "completed";
export interface RequestProps {
    id: string;
    workspaceId: string;
    requestText: string;
}
export declare class Request extends AggregateRoot {
    readonly workspaceId: string;
    requestText: string;
    status: RequestStatus;
    private constructor();
    static submit(props: RequestProps): Request;
    requestClarification(): void;
    markReadyForPlanning(): void;
    markPlanned(): void;
    cancel(reason: string): void;
    complete(): void;
    static fromState(state: {
        id: string;
        workspaceId: string;
        requestText: string;
        status: RequestStatus;
        version: number;
    }): Request;
    private ensureMutable;
}
//# sourceMappingURL=request.d.ts.map