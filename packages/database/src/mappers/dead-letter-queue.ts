import type { DeadLetterEntry } from "@kancode/application";
import type { DomainEvent } from "@kancode/domain";

export interface DeadLetterRow {
  id: string;
  outbox_id: string;
  event_type: string;
  event_payload: Record<string, unknown>;
  error: string;
  retry_count: number;
  failed_at: string;
}

export function deadLetterToRow(
  id: string,
  outboxId: string,
  event: DomainEvent,
  error: string,
  retryCount: number,
): DeadLetterRow {
  return {
    id,
    outbox_id: outboxId,
    event_type: event.type,
    event_payload: event.payload as Record<string, unknown>,
    error,
    retry_count: retryCount,
    failed_at: new Date().toISOString(),
  };
}

export function rowToDeadLetterEntry(row: DeadLetterRow): DeadLetterEntry {
  return {
    id: row.id,
    outboxId: row.outbox_id,
    eventType: row.event_type,
    eventPayload: row.event_payload,
    error: row.error,
    retryCount: row.retry_count,
    failedAt: new Date(row.failed_at),
  };
}
