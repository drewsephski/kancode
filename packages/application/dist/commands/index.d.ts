export interface Command<TType extends string = string, TPayload = unknown> {
    type: TType;
    payload: TPayload;
}
export interface BaseCommand<TPayload = unknown> extends Command<string, TPayload> {
}
export interface CreateWorkspaceCommand extends Command<"workspace.create", {
    name: string;
    slug: string;
}> {
}
export interface SubmitRequestCommand extends Command<"request.submit", {
    requestText: string;
}> {
}
export interface PlanWorkflowRunCommand extends Command<"workflow.plan", {
    requestId: string;
}> {
}
export interface AssignTaskCommand extends Command<"task.assign", {
    taskId: string;
}> {
}
export interface CreateExecutionSessionCommand extends Command<"execution_session.create", {
    assignmentId: string;
    runtimeName: string;
}> {
}
export interface CompleteExecutionSessionCommand extends Command<"execution_session.complete", {
    executionSessionId: string;
    outputSummary: string;
}> {
}
export type MvpCommand = CreateWorkspaceCommand | SubmitRequestCommand | PlanWorkflowRunCommand | AssignTaskCommand | CreateExecutionSessionCommand | CompleteExecutionSessionCommand;
//# sourceMappingURL=index.d.ts.map