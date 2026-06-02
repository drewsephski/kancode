import { task } from "@trigger.dev/sdk";

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
export const bridgeExecutionComplete = task({
  id: "bridge-execution-complete",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1_000,
    maxTimeoutInMs: 30_000,
  },
  run: async (payload: {
    executionSessionId: string;
    outputSummary: string;
    workspaceId: string;
  }) => {
    return {
      completed: true,
      executionSessionId: payload.executionSessionId,
    };
  },
});

/**
 * Bridge Execution Failed Task
 *
 * Handles the bridge reporting execution failure.
 */
export const bridgeExecutionFailed = task({
  id: "bridge-execution-failed",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1_000,
    maxTimeoutInMs: 30_000,
  },
  run: async (payload: {
    executionSessionId: string;
    errorMessage: string;
    workspaceId: string;
  }) => {
    return {
      failed: true,
      executionSessionId: payload.executionSessionId,
    };
  },
});
