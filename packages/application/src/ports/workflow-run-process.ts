export type WorkflowRunProcessState =
  | "pending"
  | "planning"
  | "awaiting_assignment"
  | "awaiting_execution"
  | "executing"
  | "completing"
  | "completed"
  | "failed";

export interface WorkflowRunProcess {
  id: string;
  workflowRunId: string;
  workspaceId: string;
  state: WorkflowRunProcessState;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowRunProcessRepository {
  save(process: WorkflowRunProcess): Promise<void>;
  getById(id: string): Promise<WorkflowRunProcess | null>;
  getByWorkflowRunId(workflowRunId: string): Promise<WorkflowRunProcess | null>;
}
