import { tasks } from "@trigger.dev/sdk";
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
export class TriggerBridgeCommandPublisher {
    metrics;
    constructor(metrics) {
        this.metrics = metrics;
    }
    async publishAssignment(input) {
        await this.metrics?.increment("bridge.publish_assignment", {
            assignmentId: input.assignmentId,
            workspaceId: input.workspaceId,
        });
        await tasks.trigger("bridge-assignment", {
            assignmentId: input.assignmentId,
            taskId: input.taskId,
            workflowRunId: input.workflowRunId,
            workspaceId: input.workspaceId,
        });
    }
    async publishExecutionStart(input) {
        await this.metrics?.increment("bridge.publish_execution_start", {
            executionSessionId: input.executionSessionId,
        });
        await tasks.trigger("bridge-execution-start", {
            executionSessionId: input.executionSessionId,
            assignmentId: input.assignmentId,
            runtimeName: input.runtimeName,
        });
    }
}
//# sourceMappingURL=bridge-command-publisher.js.map