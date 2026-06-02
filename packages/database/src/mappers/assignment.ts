import { Assignment } from "@kancode/domain";

export interface AssignmentRow {
  id: string;
  workspace_id: string;
  task_id: string;
  status: string;
  execution_session_id: string | null;
  version: number;
}

export function assignmentToRow(domain: Assignment): AssignmentRow {
  return {
    id: domain.id,
    workspace_id: domain.workspaceId,
    task_id: domain.taskId,
    status: domain.status,
    execution_session_id: domain.executionSessionId,
    version: domain.version,
  };
}

export function rowToAssignment(row: AssignmentRow): Assignment {
  return Assignment.fromState({
    id: row.id,
    workspaceId: row.workspace_id,
    taskId: row.task_id,
    status: row.status as Assignment["status"],
    executionSessionId: row.execution_session_id,
    version: row.version,
  });
}
