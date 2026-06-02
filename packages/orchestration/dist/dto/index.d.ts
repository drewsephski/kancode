export interface WorkflowPlannerInput {
    requestId: string;
    workspaceId: string;
    requestText: string;
}
export interface WorkflowPlannerOutput {
    workflowId: string;
    workflowRunId: string;
    taskIds: string[];
}
export interface WorkflowRunCoordinatorStartInput {
    workflowRunId: string;
    workflowId: string;
    workspaceId: string;
}
export interface WorkflowRunCoordinatorCompleteInput {
    workflowRunId: string;
    workspaceId: string;
}
export interface AssignmentCoordinatorInput {
    workflowRunId: string;
    taskId: string;
    workspaceId: string;
}
export interface AssignmentCoordinatorOutput {
    assignmentId: string;
}
export interface ExecutionCoordinatorStartInput {
    assignmentId: string;
    workspaceId: string;
    runtimeName: string;
}
export interface ExecutionCoordinatorStartOutput {
    executionSessionId: string;
}
export interface ExecutionCoordinatorCompleteInput {
    executionSessionId: string;
    workspaceId: string;
}
//# sourceMappingURL=index.d.ts.map