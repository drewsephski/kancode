import type { DomainEvent } from "@kancode/domain";
import type { EventPublisher, DomainEventStore, OutboxRepository, IdGenerator } from "../index.js";
export declare class OutboxBackedEventPublisher implements EventPublisher {
    private readonly eventStore;
    private readonly outbox;
    private readonly idGenerator;
    private readonly workspaceId;
    constructor(eventStore: DomainEventStore, outbox: OutboxRepository, idGenerator: IdGenerator, workspaceId: string);
    publish(events: DomainEvent[]): Promise<void>;
}
//# sourceMappingURL=outbox-event-publisher.d.ts.map