/**
 * Routes domain events from Trigger.dev back into the orchestration layer.
 *
 * This is a pure routing layer — it contains zero business logic and
 * zero Trigger.dev imports. Every event is forwarded unconditionally
 * to the WorkflowRunProcessManager which owns all state-machine-driven
 * orchestration decisions.
 */
export class TriggerEventRouter {
    processManager;
    constructor(processManager) {
        this.processManager = processManager;
    }
    async routeEvent(event, context) {
        await this.processManager.handle(event, context);
    }
}
//# sourceMappingURL=trigger-event-router.js.map