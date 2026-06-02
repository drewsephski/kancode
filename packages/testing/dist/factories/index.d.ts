import { Assignment, ExecutionSession, Request, Task, Workflow, WorkflowRun, Workspace } from "@kancode/domain";
export declare const createWorkspace: (overrides?: {
    id?: string;
    name?: string;
    slug?: string;
}) => Workspace;
export declare const createRequest: (overrides?: {
    id?: string;
    workspaceId?: string;
    requestText?: string;
}) => Request;
export declare const createWorkflow: (overrides?: {
    id?: string;
    workspaceId?: string;
    requestId?: string;
    title?: string;
}) => Workflow;
export declare const createWorkflowRun: (overrides?: {
    id?: string;
    workspaceId?: string;
    workflowId?: string;
    requestId?: string;
}) => WorkflowRun;
export declare const createTask: (overrides?: {
    id?: string;
    workspaceId?: string;
    workflowRunId?: string;
    title?: string;
    description?: string;
    orderIndex?: number;
}) => Task;
export declare const createAssignment: (overrides?: {
    id?: string;
    workspaceId?: string;
    taskId?: string;
}) => Assignment;
export declare const createExecutionSession: (overrides?: {
    id?: string;
    workspaceId?: string;
    assignmentId?: string;
    runtimeName?: string;
}) => ExecutionSession;
//# sourceMappingURL=index.d.ts.map