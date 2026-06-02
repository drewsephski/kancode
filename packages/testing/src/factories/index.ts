import {
  Assignment,
  ExecutionSession,
  Request,
  Task,
  Workflow,
  WorkflowRun,
  Workspace,
} from "@kancode/domain";

export const createWorkspace = (overrides: {
  id?: string;
  name?: string;
  slug?: string;
} = {}): Workspace =>
  Workspace.create({
    id: overrides.id ?? "workspace-1",
    name: overrides.name ?? "Acme",
    slug: overrides.slug ?? "acme",
  });

export const createRequest = (overrides: {
  id?: string;
  workspaceId?: string;
  requestText?: string;
} = {}): Request =>
  Request.submit({
    id: overrides.id ?? "request-1",
    workspaceId: overrides.workspaceId ?? "workspace-1",
    requestText: overrides.requestText ?? "Build Stripe subscriptions",
  });

export const createWorkflow = (overrides: {
  id?: string;
  workspaceId?: string;
  requestId?: string;
  title?: string;
} = {}): Workflow =>
  Workflow.create({
    id: overrides.id ?? "workflow-1",
    workspaceId: overrides.workspaceId ?? "workspace-1",
    requestId: overrides.requestId ?? "request-1",
    title: overrides.title ?? "Build Stripe subscriptions",
  });

export const createWorkflowRun = (overrides: {
  id?: string;
  workspaceId?: string;
  workflowId?: string;
  requestId?: string;
} = {}): WorkflowRun =>
  WorkflowRun.create({
    id: overrides.id ?? "workflow-run-1",
    workspaceId: overrides.workspaceId ?? "workspace-1",
    workflowId: overrides.workflowId ?? "workflow-1",
    requestId: overrides.requestId ?? "request-1",
  });

export const createTask = (overrides: {
  id?: string;
  workspaceId?: string;
  workflowRunId?: string;
  title?: string;
  description?: string;
  orderIndex?: number;
} = {}): Task =>
  Task.create({
    id: overrides.id ?? "task-1",
    workspaceId: overrides.workspaceId ?? "workspace-1",
    workflowRunId: overrides.workflowRunId ?? "workflow-run-1",
    title: overrides.title ?? "Implement billing flow",
    ...(overrides.description !== undefined ? { description: overrides.description } : {}),
    orderIndex: overrides.orderIndex ?? 0,
  });

export const createAssignment = (overrides: {
  id?: string;
  workspaceId?: string;
  taskId?: string;
} = {}): Assignment =>
  Assignment.create({
    id: overrides.id ?? "assignment-1",
    workspaceId: overrides.workspaceId ?? "workspace-1",
    taskId: overrides.taskId ?? "task-1",
  });

export const createExecutionSession = (overrides: {
  id?: string;
  workspaceId?: string;
  assignmentId?: string;
  runtimeName?: string;
} = {}): ExecutionSession =>
  ExecutionSession.create({
    id: overrides.id ?? "execution-session-1",
    workspaceId: overrides.workspaceId ?? "workspace-1",
    assignmentId: overrides.assignmentId ?? "assignment-1",
    runtimeName: overrides.runtimeName ?? "Claude Code",
  });
