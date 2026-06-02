import type { DomainEvent } from "@kancode/domain";
export interface DomainEventRow {
    id?: number;
    aggregate_id: string;
    type: string;
    payload: Record<string, unknown>;
    version: number;
    occurred_at: string;
}
export interface OutboxRow {
    id: string;
    workspace_id: string;
    event_type: string;
    event_payload: Record<string, unknown>;
    event_version: number;
    status: string;
}
export declare function domainEventToRow(aggregateId: string, event: DomainEvent): DomainEventRow;
export declare function rowToDomainEvent(row: DomainEventRow): DomainEvent;
export declare function outboxRow(event: DomainEvent, outboxId: string, workspaceId: string): OutboxRow;
export declare function rowToOutboxRecord(row: OutboxRow): {
    id: string;
    workspaceId: string;
    event: DomainEvent;
    status: "pending" | "dispatched" | "failed";
};
//# sourceMappingURL=event.d.ts.map