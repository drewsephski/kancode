import { ExecutionSession } from "@kancode/domain";

export interface ExecutionSessionRow {
  id: string;
  workspace_id: string;
  assignment_id: string;
  runtime_name: string;
  status: string;
  last_sequence_number: number;
  version: number;
}

export function executionSessionToRow(domain: ExecutionSession): ExecutionSessionRow {
  return {
    id: domain.id,
    workspace_id: domain.workspaceId,
    assignment_id: domain.assignmentId,
    runtime_name: domain.runtimeName,
    status: domain.status,
    last_sequence_number: 0,
    version: domain.version,
  };
}

export function rowToExecutionSession(row: ExecutionSessionRow): ExecutionSession {
  return ExecutionSession.fromState({
    id: row.id,
    workspaceId: row.workspace_id,
    assignmentId: row.assignment_id,
    runtimeName: row.runtime_name,
    status: row.status as ExecutionSession["status"],
    lastSequenceNumber: row.last_sequence_number,
    version: row.version,
  });
}
