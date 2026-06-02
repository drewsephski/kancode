import { tasks } from "@trigger.dev/sdk";
export const MAX_RETRY_COUNT = 3;
export class TriggerDispatcher {
    outboxRepo;
    deadLetterQueue;
    idGenerator;
    clock;
    config;
    metrics;
    maxRetries;
    sendEvent;
    constructor(outboxRepo, deadLetterQueue, idGenerator, clock, config = {}, metrics) {
        this.outboxRepo = outboxRepo;
        this.deadLetterQueue = deadLetterQueue;
        this.idGenerator = idGenerator;
        this.clock = clock;
        this.config = config;
        this.metrics = metrics;
        this.maxRetries = config.maxRetries ?? MAX_RETRY_COUNT;
        this.sendEvent = config.sendEvent ?? this.defaultSendEvent.bind(this);
    }
    async dispatchPending() {
        const pending = await this.outboxRepo.getPending();
        if (pending.length === 0)
            return;
        const dispatchedIds = [];
        const deadLetterEntries = [];
        for (const record of pending) {
            try {
                await this.sendToTrigger(record);
                dispatchedIds.push(record.id);
                await this.metrics?.increment("trigger.events.sent", {
                    eventType: record.event.type,
                });
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                const currentRetryCount = record.retryCount ?? 0;
                await this.metrics?.increment("trigger.events.failed", {
                    eventType: record.event.type,
                    error: err.message,
                });
                if (currentRetryCount + 1 >= this.maxRetries) {
                    deadLetterEntries.push({ id: record.id, error: err });
                }
                else {
                    // Leave in outbox for retry on next dispatch cycle
                    console.warn(`[TriggerDispatcher] event ${record.id} failed (attempt ${currentRetryCount + 1}/${this.maxRetries}): ${err.message}`);
                }
            }
        }
        // Move terminal failures to dead-letter queue
        if (deadLetterEntries.length > 0) {
            for (const entry of deadLetterEntries) {
                const record = pending.find((r) => r.id === entry.id);
                if (record) {
                    await this.deadLetterQueue.enqueue(entry.id, record.event, entry.error, this.maxRetries);
                }
            }
            dispatchedIds.push(...deadLetterEntries.map((e) => e.id));
        }
        // Mark all consumed records as dispatched (removed from outbox)
        if (dispatchedIds.length > 0) {
            await this.outboxRepo.markDispatched(dispatchedIds);
        }
    }
    async sendToTrigger(record) {
        const payload = {
            eventType: record.event.type,
            event: record.event,
            metadata: {
                eventId: record.id,
                workspaceId: record.workspaceId,
                correlationId: `${record.event.type}-${record.id}`,
                causationId: `${record.event.type}-${record.id}`,
                aggregateId: typeof record.event.payload === "object" && record.event.payload !== null
                    ? String(record.event.payload.id ?? "")
                    : "",
                aggregateType: record.event.type.split(".")[0] ?? "",
                version: record.event.version,
            },
        };
        await this.sendEvent(payload);
    }
    async defaultSendEvent(payload) {
        await tasks.trigger("event-bridge", payload);
    }
}
//# sourceMappingURL=trigger-dispatcher.js.map