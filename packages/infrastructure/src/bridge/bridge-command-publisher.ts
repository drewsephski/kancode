import type { BridgeCommandPublisher, MetricsRecorder } from "@kancode/application";
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
export class TriggerBridgeCommandPublisher implements BridgeCommandPublisher {
  constructor(private readonly metrics?: MetricsRecorder) {}

  async publishAssignment(input: {
    assignmentId: string;
    taskId: string;
    workflowRunId: string;
    workspaceId: string;
  }): Promise<void> {
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

  async publishExecutionStart(input: {
    executionSessionId: string;
    assignmentId: string;
    runtimeName: string;
  }): Promise<void> {
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
