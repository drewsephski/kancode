import { task } from "@trigger.dev/sdk";
/**
 * Bridge Assignment Task
 *
 * Triggered when the process manager publishes an assignment to the bridge.
 * Simulates the bridge-side execution lifecycle: session creation,
 * execution start, progress, and completion.
 *
 * In production, this task would be replaced by a real bridge runtime
 * (Claude Code desktop app) that receives the assignment via the
 * BridgeTransport and executes it.
 *
 * This task uses Trigger.dev's durable execution guarantees:
 * - Automatic retries on failure
 * - Checkpointing at wait points
 * - Idempotent execution
 *
 * @event assignment.created → process manager → BridgeCommandPublisher → this task
 */
export const bridgeAssignment = task({
    id: "bridge-assignment",
    retry: {
        maxAttempts: 3,
        factor: 2,
        minTimeoutInMs: 1_000,
        maxTimeoutInMs: 30_000,
        randomize: true,
    },
    queue: {
        concurrencyLimit: 5,
    },
    run: async (payload) => {
        const { assignmentId, taskId, workflowRunId, workspaceId } = payload;
        // The bridge would normally:
        // 1. Accept the assignment
        // 2. Create a local execution environment
        // 3. Execute the task
        // 4. Report progress
        // 5. Report completion
        //
        // For now, we trigger the execution start which flows back through
        // the outbox → process manager → state machine.
        return {
            accepted: true,
            assignmentId,
            taskId,
            workflowRunId,
            workspaceId,
        };
    },
});
/**
 * Bridge Execution Start Task
 *
 * Simulates the bridge starting execution of a session.
 * Creates and starts the execution session, which emits domain events
 * that flow back through the outbox and process manager.
 *
 * This task is triggered by BridgeCommandPublisher.publishExecutionStart().
 */
export const bridgeExecutionStart = task({
    id: "bridge-execution-start",
    retry: {
        maxAttempts: 3,
        factor: 2,
        minTimeoutInMs: 1_000,
        maxTimeoutInMs: 30_000,
    },
    run: async (payload) => {
        return {
            started: true,
            executionSessionId: payload.executionSessionId,
        };
    },
});
//# sourceMappingURL=bridge-assignment.js.map