/**
 * Central registry of event types and their registered handlers.
 *
 * This registry provides visibility into which events have handlers
 * registered. It is used by the worker trigger bootstrap to validate
 * that all required events are covered. The actual event routing
 * happens through TriggerEventRouter → WorkflowRunProcessManager.
 */
export class TriggerJobRegistry {
    jobs = new Map();
    register(eventType, handler) {
        if (this.jobs.has(eventType)) {
            throw new Error(`Duplicate registration for event type: ${eventType}`);
        }
        this.jobs.set(eventType, handler);
    }
    getHandler(eventType) {
        return this.jobs.get(eventType);
    }
    hasHandler(eventType) {
        return this.jobs.has(eventType);
    }
    registeredEventTypes() {
        return Array.from(this.jobs.keys());
    }
    registerRequestSubmittedJob(handler) {
        this.register("request.submitted", handler);
    }
    registerWorkflowRunCreatedJob(handler) {
        this.register("workflow_run.created", handler);
    }
    registerTaskCreatedJob(handler) {
        this.register("task.created", handler);
    }
    registerTaskAssignedJob(handler) {
        this.register("task.assigned", handler);
    }
    registerExecutionSessionStartedJob(handler) {
        this.register("execution_session.started", handler);
    }
    registerExecutionSessionCompletedJob(handler) {
        this.register("execution_session.completed", handler);
    }
    registerExecutionSessionFailedJob(handler) {
        this.register("execution_session.failed", handler);
    }
    registerRequestCompletedJob(handler) {
        this.register("request.completed", handler);
    }
}
//# sourceMappingURL=trigger-job-registry.js.map