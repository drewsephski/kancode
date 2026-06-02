import { z } from "zod";
const baseEventSchema = z.object({
    eventId: z.string(),
    correlationId: z.string(),
    causationId: z.string().optional(),
    workspaceId: z.string(),
    occurredAt: z.string(),
    version: z.number().int().nonnegative(),
});
export const requestSubmittedEventSchema = baseEventSchema.extend({
    requestId: z.string(),
    requestText: z.string(),
});
export const workflowCreatedEventSchema = baseEventSchema.extend({
    workflowId: z.string(),
    requestId: z.string(),
    title: z.string(),
});
export const workflowRunCreatedEventSchema = baseEventSchema.extend({
    workflowRunId: z.string(),
    workflowId: z.string(),
    requestId: z.string(),
});
export const taskCreatedEventSchema = baseEventSchema.extend({
    taskId: z.string(),
    workflowRunId: z.string(),
    title: z.string(),
    orderIndex: z.number().int().nonnegative(),
});
export const assignmentCreatedEventSchema = baseEventSchema.extend({
    assignmentId: z.string(),
    taskId: z.string(),
});
export const executionSessionCreatedEventSchema = baseEventSchema.extend({
    executionSessionId: z.string(),
    assignmentId: z.string(),
    runtimeName: z.string(),
});
//# sourceMappingURL=index.js.map