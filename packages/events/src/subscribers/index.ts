import type { DomainEvent } from "@kancode/domain";

export interface SubscriberRegistry {
  register(eventType: string, handler: (event: DomainEvent) => Promise<void>): void;
  getHandlers(eventType: string): ReadonlyArray<(event: DomainEvent) => Promise<void>>;
}

export interface ProjectionSubscriber {
  eventType: string;
}

export interface RealtimeSubscriber {
  eventType: string;
}

export interface AuditSubscriber {
  eventType: string;
}
