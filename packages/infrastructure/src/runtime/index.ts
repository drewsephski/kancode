export interface RuntimeTaskRequest {
  assignmentId: string;
  executionSessionId: string;
  runtimeName: string;
  requestText?: string;
}

export interface RuntimeTaskResult {
  success: boolean;
  outputSummary: string;
}

export interface RuntimeAdapter {
  name: string;
  canExecute(request: RuntimeTaskRequest): Promise<boolean>;
  execute(request: RuntimeTaskRequest): Promise<RuntimeTaskResult>;
}
