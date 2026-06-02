import type { DomainEvent } from "@kancode/domain";

export interface DeadLetterEntry {
  id: string;
  outboxId: string;
  eventType: string;
  eventPayload: unknown;
  error: string;
  retryCount: number;
  failedAt: Date;
}

export interface DeadLetterQueue {
  enqueue(outboxId: string, event: DomainEvent, error: Error, retryCount: number): Promise<void>;
  getAll(): Promise<DeadLetterEntry[]>;
}
