import { Task } from "@kancode/domain";

export interface TaskRow {
  id: string;
  workspace_id: string;
  workflow_run_id: string;
  title: string;
  description: string | null;
  order_index: number;
  status: string;
  version: number;
}

export function taskToRow(domain: Task): TaskRow {
  return {
    id: domain.id,
    workspace_id: domain.workspaceId,
    workflow_run_id: domain.workflowRunId,
    title: domain.title,
    description: domain.description ?? null,
    order_index: domain.orderIndex,
    status: domain.status,
    version: domain.version,
  };
}

export function rowToTask(row: TaskRow): Task {
  return Task.fromState({
    id: row.id,
    workspaceId: row.workspace_id,
    workflowRunId: row.workflow_run_id,
    title: row.title,
    description: row.description ?? undefined,
    orderIndex: row.order_index,
    status: row.status as Task["status"],
    version: row.version,
  });
}
