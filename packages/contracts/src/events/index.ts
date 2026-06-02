import { z } from "zod";

const baseEventSchema = z.object({
  eventId: z.string(),
  correlationId: z.string(),
  causationId: z.string().optional(),
  workspaceId: z.string(),
  occurredAt: z.string(),
  version: z.number().int().nonnegative(),
});

export interface RequestSubmittedEvent {
  requestId: string;
  requestText: string;
}

export const requestSubmittedEventSchema = baseEventSchema.extend({
  requestId: z.string(),
  requestText: z.string(),
});

export interface WorkflowCreatedEvent {
  workflowId: string;
  requestId: string;
  title: string;
}

export const workflowCreatedEventSchema = baseEventSchema.extend({
  workflowId: z.string(),
  requestId: z.string(),
  title: z.string(),
});

export interface WorkflowRunCreatedEvent {
  workflowRunId: string;
  workflowId: string;
  requestId: string;
}

export const workflowRunCreatedEventSchema = baseEventSchema.extend({
  workflowRunId: z.string(),
  workflowId: z.string(),
  requestId: z.string(),
});

export interface TaskCreatedEvent {
  taskId: string;
  workflowRunId: string;
  title: string;
  orderIndex: number;
}

export const taskCreatedEventSchema = baseEventSchema.extend({
  taskId: z.string(),
  workflowRunId: z.string(),
  title: z.string(),
  orderIndex: z.number().int().nonnegative(),
});

export interface AssignmentCreatedEvent {
  assignmentId: string;
  taskId: string;
}

export const assignmentCreatedEventSchema = baseEventSchema.extend({
  assignmentId: z.string(),
  taskId: z.string(),
});

export interface ExecutionSessionCreatedEvent {
  executionSessionId: string;
  assignmentId: string;
  runtimeName: string;
}

export const executionSessionCreatedEventSchema = baseEventSchema.extend({
  executionSessionId: z.string(),
  assignmentId: z.string(),
  runtimeName: z.string(),
});
