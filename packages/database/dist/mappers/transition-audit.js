export function auditEntryToRow(entry) {
    return {
        process_id: entry.processId,
        from_state: entry.fromState,
        to_state: entry.toState,
        event_type: entry.eventType,
        revision: entry.revision,
        occurred_at: entry.occurredAt.toISOString(),
    };
}
export function rowToAuditEntry(row) {
    return {
        processId: row.process_id,
        fromState: row.from_state,
        toState: row.to_state,
        eventType: row.event_type,
        revision: row.revision,
        occurredAt: new Date(row.occurred_at),
    };
}
//# sourceMappingURL=transition-audit.js.map