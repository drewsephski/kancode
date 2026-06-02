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
export declare class TriggerJobRegistry {
    private readonly jobs;
    register(eventType: string, handler: TriggerJobHandler): void;
    getHandler(eventType: string): TriggerJobHandler | undefined;
    hasHandler(eventType: string): boolean;
    registeredEventTypes(): string[];
    registerRequestSubmittedJob(handler: TriggerJobHandler): void;
    registerWorkflowRunCreatedJob(handler: TriggerJobHandler): void;
    registerTaskCreatedJob(handler: TriggerJobHandler): void;
    registerTaskAssignedJob(handler: TriggerJobHandler): void;
    registerExecutionSessionStartedJob(handler: TriggerJobHandler): void;
    registerExecutionSessionCompletedJob(handler: TriggerJobHandler): void;
    registerExecutionSessionFailedJob(handler: TriggerJobHandler): void;
    registerRequestCompletedJob(handler: TriggerJobHandler): void;
}
//# sourceMappingURL=trigger-job-registry.d.ts.map