export class OutboxBackedEventPublisher {
    eventStore;
    outbox;
    idGenerator;
    workspaceId;
    constructor(eventStore, outbox, idGenerator, workspaceId) {
        this.eventStore = eventStore;
        this.outbox = outbox;
        this.idGenerator = idGenerator;
        this.workspaceId = workspaceId;
    }
    async publish(events) {
        if (events.length === 0)
            return;
        await this.eventStore.append(events);
        const records = events.map((event) => ({
            id: this.idGenerator.next(),
            workspaceId: this.workspaceId,
            event,
            status: "pending",
        }));
        await this.outbox.enqueue(records);
    }
}
//# sourceMappingURL=outbox-event-publisher.js.map