export function deadLetterToRow(id, outboxId, event, error, retryCount) {
    return {
        id,
        outbox_id: outboxId,
        event_type: event.type,
        event_payload: event.payload,
        error,
        retry_count: retryCount,
        failed_at: new Date().toISOString(),
    };
}
export function rowToDeadLetterEntry(row) {
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
//# sourceMappingURL=dead-letter-queue.js.map