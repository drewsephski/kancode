export class OutboxDispatcher {
    outboxRepo;
    registry;
    constructor(outboxRepo, registry) {
        this.outboxRepo = outboxRepo;
        this.registry = registry;
    }
    async dispatchPending() {
        const pending = await this.outboxRepo.getPending();
        if (pending.length === 0)
            return;
        const dispatchedIds = [];
        for (const record of pending) {
            const handlers = this.registry.getHandlers(record.event.type);
            if (handlers.length > 0) {
                for (const handler of handlers) {
                    await handler(record.event);
                }
            }
            dispatchedIds.push(record.id);
        }
        if (dispatchedIds.length > 0) {
            await this.outboxRepo.markDispatched(dispatchedIds);
        }
    }
}
//# sourceMappingURL=outbox-dispatcher.js.map