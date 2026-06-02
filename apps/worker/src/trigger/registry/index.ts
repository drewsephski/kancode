import {
  TriggerJobRegistry,
  TriggerEventRouter,
  type EventBridgePayload,
} from "@kancode/infrastructure";
import type { WorkflowRunProcessManager } from "@kancode/orchestration";
import type { CommandContext } from "@kancode/application";

/**
 * Build the TriggerJobRegistry with all workflow-related event types.
 *
 * Each registration validates that the event type maps to the
 * process manager handler. The registry is used at bootstrap time
 * to verify all expected events are covered.
 *
 * Returns the configured registry.
 */
export function buildTriggerJobRegistry(
  processManager: WorkflowRunProcessManager,
): TriggerJobRegistry {
  const router = new TriggerEventRouter(processManager);
  const registry = new TriggerJobRegistry();

  const makeHandler = (router: TriggerEventRouter, eventType: string) => {
    return async (event: import("@kancode/domain").DomainEvent) => {
      const context: CommandContext = {
        workspaceId:
          (event.payload as Record<string, unknown>)?.workspaceId as string ?? "",
        actorId: "system",
        correlationId: `trigger-${eventType}-${event.occurredAt.getTime()}`,
        idempotencyKey: `trigger-${eventType}-${event.occurredAt.getTime()}`,
      };
      await router.routeEvent(event, context);
    };
  };

  // Register all expected workflow events
  registry.registerRequestSubmittedJob(makeHandler(router, "request.submitted"));
  registry.registerWorkflowRunCreatedJob(makeHandler(router, "workflow_run.created"));
  registry.registerTaskCreatedJob(makeHandler(router, "task.created"));
  registry.registerTaskAssignedJob(makeHandler(router, "task.assigned"));
  registry.registerExecutionSessionStartedJob(makeHandler(router, "execution_session.started"));
  registry.registerExecutionSessionCompletedJob(makeHandler(router, "execution_session.completed"));
  registry.registerExecutionSessionFailedJob(makeHandler(router, "execution_session.failed"));
  registry.registerRequestCompletedJob(makeHandler(router, "request.completed"));

  return registry;
}

/**
 * Build the event bridge handler that the event-bridge Trigger task calls.
 * This wires the EventBridgePayload into the registered handlers.
 */
export function buildEventBridgeHandler(
  registry: TriggerJobRegistry,
): (payload: EventBridgePayload) => Promise<void> {
  return async (payload: EventBridgePayload) => {
    const handler = registry.getHandler(payload.eventType);
    if (!handler) {
      console.warn(`[event-bridge] no registered handler for event type: ${payload.eventType}`);
      return;
    }
    await handler(payload.event);
  };
}
