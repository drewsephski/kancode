export function domainEventToRow(aggregateId, event) {
    return {
        aggregate_id: aggregateId,
        type: event.type,
        payload: event.payload,
        version: event.version,
        occurred_at: (event.occurredAt instanceof Date ? event.occurredAt : new Date(event.occurredAt)).toISOString(),
    };
}
export function rowToDomainEvent(row) {
    return {
        type: row.type,
        occurredAt: new Date(row.occurred_at),
        payload: row.payload,
        version: row.version,
    };
}
export function outboxRow(event, outboxId, workspaceId) {
    return {
        id: outboxId,
        workspace_id: workspaceId,
        event_type: event.type,
        event_payload: event.payload,
        event_version: event.version,
        status: "pending",
    };
}
export function rowToOutboxRecord(row) {
    return {
        id: row.id,
        workspaceId: row.workspace_id,
        event: {
            type: row.event_type,
            occurredAt: new Date(),
            payload: row.event_payload,
            version: row.event_version,
        },
        status: row.status,
    };
}
//# sourceMappingURL=event.js.map