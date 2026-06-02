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

export function domainEventToRow(aggregateId: string, event: DomainEvent): DomainEventRow {
  return {
    aggregate_id: aggregateId,
    type: event.type,
    payload: event.payload as Record<string, unknown>,
    version: event.version,
    occurred_at: (event.occurredAt instanceof Date ? event.occurredAt : new Date(event.occurredAt)).toISOString(),
  };
}

export function rowToDomainEvent(row: DomainEventRow): DomainEvent {
  return {
    type: row.type,
    occurredAt: new Date(row.occurred_at),
    payload: row.payload,
    version: row.version,
  };
}

export function outboxRow(event: DomainEvent, outboxId: string, workspaceId: string): OutboxRow {
  return {
    id: outboxId,
    workspace_id: workspaceId,
    event_type: event.type,
    event_payload: event.payload as Record<string, unknown>,
    event_version: event.version,
    status: "pending",
  };
}

export function rowToOutboxRecord(row: OutboxRow) {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    event: {
      type: row.event_type,
      occurredAt: new Date(),
      payload: row.event_payload,
      version: row.event_version,
    } as DomainEvent,
    status: row.status as "pending" | "dispatched" | "failed",
  };
}
