export type WorkflowRunState = "pending" | "planning" | "awaiting_assignment" | "awaiting_execution" | "executing" | "completing" | "completed" | "failed";
export type WorkflowRunEventType = "request.submitted" | "workflow_run.created" | "task.created" | "task.assigned" | "assignment.created" | "execution_session.started" | "execution_session.completed" | "execution_session.failed" | "request.completed";
export interface StateMachineCommand {
    type: "plan" | "assign" | "create_session" | "publish_assignment";
    payload: Record<string, string>;
}
export interface StateMachineDecision {
    nextState: WorkflowRunState;
    commands: StateMachineCommand[];
}
export declare class WorkflowRunStateMachine {
    transition(currentState: WorkflowRunState, eventType: WorkflowRunEventType, payload: Record<string, unknown>): StateMachineDecision;
    getValidTransitions(state: WorkflowRunState): WorkflowRunEventType[];
    isAccepting(state: WorkflowRunState): boolean;
}
//# sourceMappingURL=workflow-run-state-machine.d.ts.map