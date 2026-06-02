import type { DomainEvent } from "@kancode/domain";
import type { EventDispatcher, SubscriberRegistry } from "@kancode/events";
import type { OutboxRepository } from "@kancode/application";

export class OutboxDispatcher implements EventDispatcher {
  constructor(
    private readonly outboxRepo: OutboxRepository,
    private readonly registry: SubscriberRegistry,
  ) {}

  async dispatchPending(): Promise<void> {
    const pending = await this.outboxRepo.getPending();
    if (pending.length === 0) return;

    const dispatchedIds: string[] = [];

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
