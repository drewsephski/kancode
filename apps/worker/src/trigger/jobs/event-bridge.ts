import { task } from "@trigger.dev/sdk";
import type { EventBridgePayload } from "@kancode/infrastructure";

/**
 * Trigger.dev task that receives all domain events from TriggerDispatcher.
 *
 * This task is the single entry point for events flowing from the
 * outbox → TriggerDispatcher → Trigger.dev platform → Worker.
 *
 * The actual routing to the process manager is handled by the
 * worker bootstrap which wires in the TriggerEventRouter.
 *
 * This task definition is exported so Trigger.dev can discover
 * and register it during `trigger dev` or deployment.
 */
export const eventBridge = task({
  id: "event-bridge",
  run: async (payload: EventBridgePayload) => {
    const { eventType, event, metadata } = payload;

    // The actual routing callback is installed at bootstrap time
    // via setEventBridgeHandler(). If no handler is installed yet,
    // the event is logged and re-enqueued is left to the caller.
    if (!_handler) {
      console.warn(`[event-bridge] no handler installed for event ${eventType}, skipping`);
      return { processed: false, eventType, eventId: metadata.eventId };
    }

    await _handler(payload);
    return { processed: true, eventType, eventId: metadata.eventId };
  },
});

type EventBridgeHandler = (payload: EventBridgePayload) => Promise<void>;

let _handler: EventBridgeHandler | null = null;

/**
 * Install the handler called every time the event-bridge task runs.
 * Called once during worker bootstrap before any events arrive.
 */
export function setEventBridgeHandler(h: EventBridgeHandler): void {
  _handler = h;
}
