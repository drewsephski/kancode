/**
 * Bridge Execution Completion Task
 *
 * Handles the bridge reporting execution as completed.
 * This task is triggered when the bridge finishes executing
 * and reports results back to the cloud.
 *
 * The completion flows through:
 * 1. This task receives the completion payload
 * 2. The execution_session.completed event is emitted
 * 3. The outbox dispatcher picks it up
 * 4. The TriggerEventRouter routes it to the process manager
 * 5. The state machine transitions from executing → completing
 * 6. Subsequent events complete the workflow run and request
 *
 * Durable delivery guarantees:
 * - Retries on failure
 * - Idempotent via idempotency key
 * - Exactly-once semantics
 */
export declare const bridgeExecutionComplete: import("@trigger.dev/sdk").Task<"bridge-execution-complete", {
    executionSessionId: string;
    outputSummary: string;
    workspaceId: string;
}, {
    completed: boolean;
    executionSessionId: string;
}>;
/**
 * Bridge Execution Failed Task
 *
 * Handles the bridge reporting execution failure.
 */
export declare const bridgeExecutionFailed: import("@trigger.dev/sdk").Task<"bridge-execution-failed", {
    executionSessionId: string;
    errorMessage: string;
    workspaceId: string;
}, {
    failed: boolean;
    executionSessionId: string;
}>;
//# sourceMappingURL=bridge-execution-complete.d.ts.map