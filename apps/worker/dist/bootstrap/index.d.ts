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
export declare function bootstrapTriggerBridge(processManager: WorkflowRunProcessManager): void;
export declare const bootstrapWorker: () => void;
//# sourceMappingURL=index.d.ts.map