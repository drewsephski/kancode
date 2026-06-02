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
export declare const eventBridge: import("@trigger.dev/sdk").Task<"event-bridge", EventBridgePayload, {
    processed: boolean;
    eventType: string;
    eventId: string;
}>;
type EventBridgeHandler = (payload: EventBridgePayload) => Promise<void>;
/**
 * Install the handler called every time the event-bridge task runs.
 * Called once during worker bootstrap before any events arrive.
 */
export declare function setEventBridgeHandler(h: EventBridgeHandler): void;
export {};
//# sourceMappingURL=event-bridge.d.ts.map