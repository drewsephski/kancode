import type { DomainEvent } from "@kancode/domain";
import type { WorkflowRunProcessManager } from "@kancode/orchestration";
import type { CommandContext } from "@kancode/application";
/**
 * Routes domain events from Trigger.dev back into the orchestration layer.
 *
 * This is a pure routing layer — it contains zero business logic and
 * zero Trigger.dev imports. Every event is forwarded unconditionally
 * to the WorkflowRunProcessManager which owns all state-machine-driven
 * orchestration decisions.
 */
export declare class TriggerEventRouter {
    private readonly processManager;
    constructor(processManager: WorkflowRunProcessManager);
    routeEvent(event: DomainEvent, context: CommandContext): Promise<void>;
}
//# sourceMappingURL=trigger-event-router.d.ts.map