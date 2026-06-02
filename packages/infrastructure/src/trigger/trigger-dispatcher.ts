import type { EventDispatcher } from "@kancode/events";
import type { OutboxRepository, DeadLetterQueue, IdGenerator, Clock, MetricsRecorder } from "@kancode/application";
import { tasks } from "@trigger.dev/sdk";
import type { EventBridgePayload, SendEventFn } from "./types.js";

export const MAX_RETRY_COUNT = 3;

export interface TriggerDispatcherConfig {
  maxRetries?: number;
  /**
   * Override the send function for testing. Defaults to `tasks.trigger("event-bridge", payload)`.
   */
  sendEvent?: SendEventFn;
}

export class TriggerDispatcher implements EventDispatcher {
  private readonly maxRetries: number;
  private readonly sendEvent: SendEventFn;

  constructor(
    private readonly outboxRepo: OutboxRepository,
    private readonly deadLetterQueue: DeadLetterQueue,
    private readonly idGenerator: IdGenerator,
    private readonly clock: Clock,
    private readonly config: TriggerDispatcherConfig = {},
    private readonly metrics?: MetricsRecorder,
  ) {
    this.maxRetries = config.maxRetries ?? MAX_RETRY_COUNT;
    this.sendEvent = config.sendEvent ?? this.defaultSendEvent.bind(this);
  }

  async dispatchPending(): Promise<void> {
    const pending = await this.outboxRepo.getPending();
    if (pending.length === 0) return;

    const dispatchedIds: string[] = [];
    const deadLetterEntries: Array<{ id: string; error: Error }> = [];

    for (const record of pending) {
      try {
        await this.sendToTrigger(record);
        dispatchedIds.push(record.id);
        await this.metrics?.increment("trigger.events.sent", {
          eventType: record.event.type,
        });
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        const currentRetryCount = (record as unknown as Record<string, number>).retryCount ?? 0;

        await this.metrics?.increment("trigger.events.failed", {
          eventType: record.event.type,
          error: err.message,
        });

        if (currentRetryCount + 1 >= this.maxRetries) {
          deadLetterEntries.push({ id: record.id, error: err });
        } else {
          // Leave in outbox for retry on next dispatch cycle
          console.warn(
            `[TriggerDispatcher] event ${record.id} failed (attempt ${currentRetryCount + 1}/${this.maxRetries}): ${err.message}`,
          );
        }
      }
    }

    // Move terminal failures to dead-letter queue
    if (deadLetterEntries.length > 0) {
      for (const entry of deadLetterEntries) {
        const record = pending.find((r) => r.id === entry.id);
        if (record) {
          await this.deadLetterQueue.enqueue(
            entry.id,
            record.event,
            entry.error,
            this.maxRetries,
          );
        }
      }
      dispatchedIds.push(...deadLetterEntries.map((e) => e.id));
    }

    // Mark all consumed records as dispatched (removed from outbox)
    if (dispatchedIds.length > 0) {
      await this.outboxRepo.markDispatched(dispatchedIds);
    }
  }

  private async sendToTrigger(record: {
    id: string;
    workspaceId: string;
    event: { type: string; occurredAt: Date; payload: unknown; version: number };
  }): Promise<void> {
    const payload: EventBridgePayload = {
      eventType: record.event.type,
      event: record.event,
      metadata: {
        eventId: record.id,
        workspaceId: record.workspaceId,
        correlationId: `${record.event.type}-${record.id}`,
        causationId: `${record.event.type}-${record.id}`,
        aggregateId:
          typeof record.event.payload === "object" && record.event.payload !== null
            ? String((record.event.payload as Record<string, unknown>).id ?? "")
            : "",
        aggregateType: record.event.type.split(".")[0] ?? "",
        version: record.event.version,
      },
    };

    await this.sendEvent(payload);
  }

  private async defaultSendEvent(payload: EventBridgePayload): Promise<void> {
    await tasks.trigger("event-bridge", payload);
  }
}
