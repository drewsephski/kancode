import type { DomainEvent } from "@kancode/domain";

export interface TriggerJobHandler {
  (event: DomainEvent): Promise<void>;
}

/**
 * Central registry of event types and their registered handlers.
 *
 * This registry provides visibility into which events have handlers
 * registered. It is used by the worker trigger bootstrap to validate
 * that all required events are covered. The actual event routing
 * happens through TriggerEventRouter → WorkflowRunProcessManager.
 */
export class TriggerJobRegistry {
  private readonly jobs = new Map<string, TriggerJobHandler>();

  register(eventType: string, handler: TriggerJobHandler): void {
    if (this.jobs.has(eventType)) {
      throw new Error(`Duplicate registration for event type: ${eventType}`);
    }
    this.jobs.set(eventType, handler);
  }

  getHandler(eventType: string): TriggerJobHandler | undefined {
    return this.jobs.get(eventType);
  }

  hasHandler(eventType: string): boolean {
    return this.jobs.has(eventType);
  }

  registeredEventTypes(): string[] {
    return Array.from(this.jobs.keys());
  }

  registerRequestSubmittedJob(handler: TriggerJobHandler): void {
    this.register("request.submitted", handler);
  }

  registerWorkflowRunCreatedJob(handler: TriggerJobHandler): void {
    this.register("workflow_run.created", handler);
  }

  registerTaskCreatedJob(handler: TriggerJobHandler): void {
    this.register("task.created", handler);
  }

  registerTaskAssignedJob(handler: TriggerJobHandler): void {
    this.register("task.assigned", handler);
  }

  registerExecutionSessionStartedJob(handler: TriggerJobHandler): void {
    this.register("execution_session.started", handler);
  }

  registerExecutionSessionCompletedJob(handler: TriggerJobHandler): void {
    this.register("execution_session.completed", handler);
  }

  registerExecutionSessionFailedJob(handler: TriggerJobHandler): void {
    this.register("execution_session.failed", handler);
  }

  registerRequestCompletedJob(handler: TriggerJobHandler): void {
    this.register("request.completed", handler);
  }
}
