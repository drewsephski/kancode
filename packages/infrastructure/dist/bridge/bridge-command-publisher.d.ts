import type { BridgeCommandPublisher, MetricsRecorder } from "@kancode/application";
/**
 * Infrastructure implementation of BridgeCommandPublisher.
 *
 * Uses Trigger.dev tasks to deliver bridge commands:
 * - publishAssignment triggers the "bridge-assignment" task
 * - publishExecutionStart triggers the "bridge-execution-start" task
 *
 * Each delivery includes correlation metadata and uses
 * Trigger.dev's built-in retry and durability guarantees.
 */
export declare class TriggerBridgeCommandPublisher implements BridgeCommandPublisher {
    private readonly metrics?;
    constructor(metrics?: MetricsRecorder | undefined);
    publishAssignment(input: {
        assignmentId: string;
        taskId: string;
        workflowRunId: string;
        workspaceId: string;
    }): Promise<void>;
    publishExecutionStart(input: {
        executionSessionId: string;
        assignmentId: string;
        runtimeName: string;
    }): Promise<void>;
}
//# sourceMappingURL=bridge-command-publisher.d.ts.map