import { TriggerJobRegistry, type EventBridgePayload } from "@kancode/infrastructure";
import type { WorkflowRunProcessManager } from "@kancode/orchestration";
/**
 * Build the TriggerJobRegistry with all workflow-related event types.
 *
 * Each registration validates that the event type maps to the
 * process manager handler. The registry is used at bootstrap time
 * to verify all expected events are covered.
 *
 * Returns the configured registry.
 */
export declare function buildTriggerJobRegistry(processManager: WorkflowRunProcessManager): TriggerJobRegistry;
/**
 * Build the event bridge handler that the event-bridge Trigger task calls.
 * This wires the EventBridgePayload into the registered handlers.
 */
export declare function buildEventBridgeHandler(registry: TriggerJobRegistry): (payload: EventBridgePayload) => Promise<void>;
//# sourceMappingURL=index.d.ts.map