import { z } from "zod";

const baseCommandSchema = z.object({
  commandId: z.string(),
  correlationId: z.string(),
  idempotencyKey: z.string(),
  workspaceId: z.string(),
  actorId: z.string(),
  issuedAt: z.string(),
});

export interface CreateWorkspaceCommand {
  name: string;
  slug: string;
}

export const createWorkspaceCommandSchema = baseCommandSchema.extend({
  name: z.string().min(1),
  slug: z.string().min(1),
});

export interface SubmitRequestCommand {
  requestText: string;
}

export const submitRequestCommandSchema = baseCommandSchema.extend({
  requestText: z.string().min(1),
});

export interface PlanWorkflowRunCommand {
  requestId: string;
}

export const planWorkflowRunCommandSchema = baseCommandSchema.extend({
  requestId: z.string(),
});

export interface CreateWorkflowRunCommand {
  workflowId: string;
  requestId: string;
}

export const createWorkflowRunCommandSchema = baseCommandSchema.extend({
  workflowId: z.string(),
  requestId: z.string(),
});

export interface CreateTaskCommand {
  workflowRunId: string;
  title: string;
  description?: string;
  orderIndex: number;
}

export const createTaskCommandSchema = baseCommandSchema.extend({
  workflowRunId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  orderIndex: z.number().int().nonnegative(),
});

export interface AssignTaskCommand {
  taskId: string;
}

export const assignTaskCommandSchema = baseCommandSchema.extend({
  taskId: z.string(),
});

export interface CreateExecutionSessionCommand {
  assignmentId: string;
  runtimeName: string;
}

export const createExecutionSessionCommandSchema = baseCommandSchema.extend({
  assignmentId: z.string(),
  runtimeName: z.string().min(1),
});

export interface StartExecutionSessionCommand {
  executionSessionId: string;
}

export const startExecutionSessionCommandSchema = baseCommandSchema.extend({
  executionSessionId: z.string(),
});

export interface RecordExecutionProgressCommand {
  executionSessionId: string;
  sequenceNumber: number;
  message: string;
}

export const recordExecutionProgressCommandSchema = baseCommandSchema.extend({
  executionSessionId: z.string(),
  sequenceNumber: z.number().int().nonnegative(),
  message: z.string(),
});

export interface CompleteExecutionSessionCommand {
  executionSessionId: string;
  outputSummary: string;
}

export const completeExecutionSessionCommandSchema = baseCommandSchema.extend({
  executionSessionId: z.string(),
  outputSummary: z.string(),
});

export interface FailExecutionSessionCommand {
  executionSessionId: string;
  errorMessage: string;
}

export const failExecutionSessionCommandSchema = baseCommandSchema.extend({
  executionSessionId: z.string(),
  errorMessage: z.string(),
});
