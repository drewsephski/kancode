import type { TransitionAuditEntry } from "@kancode/application";

export interface TransitionAuditRow {
  id?: number;
  process_id: string;
  from_state: string;
  to_state: string;
  event_type: string;
  revision: number;
  occurred_at: string;
}

export function auditEntryToRow(entry: TransitionAuditEntry): TransitionAuditRow {
  return {
    process_id: entry.processId,
    from_state: entry.fromState,
    to_state: entry.toState,
    event_type: entry.eventType,
    revision: entry.revision,
    occurred_at: entry.occurredAt.toISOString(),
  };
}

export function rowToAuditEntry(row: TransitionAuditRow): TransitionAuditEntry {
  return {
    processId: row.process_id,
    fromState: row.from_state,
    toState: row.to_state,
    eventType: row.event_type,
    revision: row.revision,
    occurredAt: new Date(row.occurred_at),
  };
}
