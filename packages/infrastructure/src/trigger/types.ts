import type { DomainEvent } from "@kancode/domain";

export interface EventBridgeMetadata {
  eventId: string;
  correlationId: string;
  causationId: string;
  workspaceId: string;
  aggregateId: string;
  aggregateType: string;
  version: number;
}

export interface EventBridgePayload {
  eventType: string;
  event: DomainEvent;
  metadata: EventBridgeMetadata;
}

export type SendEventFn = (payload: EventBridgePayload) => Promise<void>;
