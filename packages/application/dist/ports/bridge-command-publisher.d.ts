/**
 * Port for publishing bridge commands to the execution runtime.
 *
 * This is an application-layer port. Infrastructure owns the
 * implementation that translates these into Trigger.dev task
 * triggers or bridge transport messages.
 *
 * Implementations must be:
 * - idempotent
 * - correlation-aware
 * - metrics-enabled
 */
export interface BridgeCommandPublisher {
    /**
     * Publish an assignment to the bridge for execution.
     * Called when an assignment has been created and is ready
     * for bridge-side processing.
     */
    publishAssignment(input: {
        assignmentId: string;
        taskId: string;
        workflowRunId: string;
        workspaceId: string;
    }): Promise<void>;
    /**
     * Signal the bridge to begin execution of a session.
     * Called after the execution session has been created locally
     * and the bridge should start the runtime.
     */
    publishExecutionStart(input: {
        executionSessionId: string;
        assignmentId: string;
        runtimeName: string;
    }): Promise<void>;
}
//# sourceMappingURL=bridge-command-publisher.d.ts.map