import { WorkflowRun } from "@kancode/domain";

export interface WorkflowRunRow {
  id: string;
  workspace_id: string;
  workflow_id: string;
  request_id: string;
  status: string;
  version: number;
}

export function workflowRunToRow(domain: WorkflowRun): WorkflowRunRow {
  return {
    id: domain.id,
    workspace_id: domain.workspaceId,
    workflow_id: domain.workflowId,
    request_id: domain.requestId,
    status: domain.status,
    version: domain.version,
  };
}

export function rowToWorkflowRun(row: WorkflowRunRow): WorkflowRun {
  return WorkflowRun.fromState({
    id: row.id,
    workspaceId: row.workspace_id,
    workflowId: row.workflow_id,
    requestId: row.request_id,
    status: row.status as WorkflowRun["status"],
    version: row.version,
  });
}
