import { Workflow } from "@kancode/domain";

export interface WorkflowRow {
  id: string;
  workspace_id: string;
  request_id: string;
  title: string;
  status: string;
  version: number;
}

export function workflowToRow(domain: Workflow): WorkflowRow {
  return {
    id: domain.id,
    workspace_id: domain.workspaceId,
    request_id: domain.requestId,
    title: domain.title,
    status: domain.status,
    version: domain.version,
  };
}

export function rowToWorkflow(row: WorkflowRow): Workflow {
  return Workflow.fromState({
    id: row.id,
    workspaceId: row.workspace_id,
    requestId: row.request_id,
    title: row.title,
    status: row.status as Workflow["status"],
    version: row.version,
  });
}
