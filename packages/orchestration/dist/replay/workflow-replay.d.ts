import type { DomainEventStore, TransitionAuditLog } from "@kancode/application";
import { WorkflowRunStateMachine } from "../process-manager/workflow-run-state-machine.js";
import type { WorkflowRunState, WorkflowRunEventType, StateMachineCommand } from "../process-manager/workflow-run-state-machine.js";
export interface ReplayTransition {
    fromState: WorkflowRunState;
    toState: WorkflowRunState;
    eventType: WorkflowRunEventType;
    commands: StateMachineCommand[];
}
export interface ReplayResult {
    finalState: WorkflowRunState;
    transitions: ReplayTransition[];
}
export declare class WorkflowReplayService {
    private readonly eventStore;
    private readonly stateMachine;
    private readonly auditLog?;
    constructor(eventStore: DomainEventStore, stateMachine: WorkflowRunStateMachine, auditLog?: TransitionAuditLog | undefined);
    replay(processId: string): Promise<ReplayResult>;
    formatReplay(result: ReplayResult): string;
}
//# sourceMappingURL=workflow-replay.d.ts.map