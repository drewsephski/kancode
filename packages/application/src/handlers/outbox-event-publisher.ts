import type { DomainEvent } from "@kancode/domain";
import type { EventPublisher, DomainEventStore, OutboxRepository, IdGenerator } from "../index.js";

export class OutboxBackedEventPublisher implements EventPublisher {
  constructor(
    private readonly eventStore: DomainEventStore,
    private readonly outbox: OutboxRepository,
    private readonly idGenerator: IdGenerator,
    private readonly workspaceId: string,
  ) {}

  async publish(events: DomainEvent[]): Promise<void> {
    if (events.length === 0) return;

    await this.eventStore.append(events);

    const records = events.map((event) => ({
      id: this.idGenerator.next(),
      workspaceId: this.workspaceId,
      event,
      status: "pending" as const,
    }));
    await this.outbox.enqueue(records);
  }
}
