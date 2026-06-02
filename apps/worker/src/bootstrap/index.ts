import { setEventBridgeHandler } from "../trigger/jobs/event-bridge.js";
import { buildTriggerJobRegistry, buildEventBridgeHandler } from "../trigger/registry/index.js";
import type { WorkflowRunProcessManager } from "@kancode/orchestration";

/**
 * Bootstrap the Trigger.dev event bridge.
 *
 * Wires the TriggerJobRegistry and TriggerEventRouter to the
 * event-bridge Trigger task so incoming events are routed
 * through the process manager.
 *
 * Must be called once during worker startup, AFTER the process
 * manager has been fully constructed with all its handlers.
 */
export function bootstrapTriggerBridge(
  processManager: WorkflowRunProcessManager,
): void {
  const registry = buildTriggerJobRegistry(processManager);
  const handler = buildEventBridgeHandler(registry);
  setEventBridgeHandler(handler);
}

export const bootstrapWorker = (): void => {
  // Bootstrap is intentionally minimal — the Trigger.dev worker
  // entrypoint wires dependencies and calls bootstrapTriggerBridge().
};
