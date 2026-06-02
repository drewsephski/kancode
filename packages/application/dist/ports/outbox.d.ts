import type { DomainEvent } from "@kancode/domain";
export interface OutboxRecord {
    id: string;
    workspaceId: string;
    event: DomainEvent;
    status: "pending" | "dispatched" | "failed";
}
export interface OutboxRepository {
    enqueue(records: OutboxRecord[]): Promise<void>;
    getPending(): Promise<OutboxRecord[]>;
    markDispatched(ids: string[]): Promise<void>;
}
//# sourceMappingURL=outbox.d.ts.map