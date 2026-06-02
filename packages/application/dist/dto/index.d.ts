export interface RequestDto {
    id: string;
    workspaceId: string;
    requestText: string;
    status: string;
}
export interface WorkflowRunDto {
    id: string;
    workflowId: string;
    requestId: string;
    status: string;
}
export interface TaskDto {
    id: string;
    workflowRunId: string;
    title: string;
    description?: string;
    orderIndex: number;
    status: string;
}
//# sourceMappingURL=index.d.ts.map