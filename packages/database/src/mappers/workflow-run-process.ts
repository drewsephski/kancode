import type { WorkflowRunProcess, WorkflowRunProcessState } from "@kancode/application";

export interface WorkflowRunProcessRow {
  id: string;
  workflow_run_id: string;
  workspace_id: string;
  state: string;
  revision: number;
  created_at: string;
  updated_at: string;
}

export function processToRow(domain: WorkflowRunProcess): WorkflowRunProcessRow {
  return {
    id: domain.id,
    workflow_run_id: domain.workflowRunId,
    workspace_id: domain.workspaceId,
    state: domain.state,
    revision: domain.revision,
    created_at: domain.createdAt.toISOString(),
    updated_at: domain.updatedAt.toISOString(),
  };
}

export function rowToProcess(row: WorkflowRunProcessRow): WorkflowRunProcess {
  return {
    id: row.id,
    workflowRunId: row.workflow_run_id,
    workspaceId: row.workspace_id,
    state: row.state as WorkflowRunProcessState,
    revision: row.revision,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
