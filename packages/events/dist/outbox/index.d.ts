import type { DomainEvent } from "@kancode/domain";
export interface OutboxRecord {
    id: string;
    workspaceId: string;
    event: DomainEvent;
    status: "pending" | "dispatched" | "failed";
}
export interface OutboxPublisher {
    enqueue(events: DomainEvent[]): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map