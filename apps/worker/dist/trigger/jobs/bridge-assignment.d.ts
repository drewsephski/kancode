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
export declare const bridgeAssignment: import("@trigger.dev/sdk").Task<"bridge-assignment", {
    assignmentId: string;
    taskId: string;
    workflowRunId: string;
    workspaceId: string;
}, {
    accepted: boolean;
    assignmentId: string;
    taskId: string;
    workflowRunId: string;
    workspaceId: string;
}>;
/**
 * Bridge Execution Start Task
 *
 * Simulates the bridge starting execution of a session.
 * Creates and starts the execution session, which emits domain events
 * that flow back through the outbox and process manager.
 *
 * This task is triggered by BridgeCommandPublisher.publishExecutionStart().
 */
export declare const bridgeExecutionStart: import("@trigger.dev/sdk").Task<"bridge-execution-start", {
    executionSessionId: string;
    assignmentId: string;
    runtimeName: string;
}, {
    started: boolean;
    executionSessionId: string;
}>;
//# sourceMappingURL=bridge-assignment.d.ts.map