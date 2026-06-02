import type { DomainEvent } from "@kancode/domain";

export interface EventPublisher {
  publish(events: DomainEvent[]): Promise<void>;
}

export interface EventSubscriber<TEvent = unknown> {
  subscribe(eventType: string, handler: (event: TEvent) => Promise<void>): void;
}
