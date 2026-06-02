import { z } from "zod";

export interface GetRequestQuery {
  requestId: string;
}

export const getRequestQuerySchema = z.object({
  requestId: z.string(),
});

export interface GetWorkflowRunQuery {
  workflowRunId: string;
}

export const getWorkflowRunQuerySchema = z.object({
  workflowRunId: z.string(),
});

export interface ListTasksQuery {
  workflowRunId: string;
}

export const listTasksQuerySchema = z.object({
  workflowRunId: z.string(),
});

export interface BaseQuery {
  readonly kind: string;
}
