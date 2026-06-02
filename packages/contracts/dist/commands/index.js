import { z } from "zod";
const baseCommandSchema = z.object({
    commandId: z.string(),
    correlationId: z.string(),
    idempotencyKey: z.string(),
    workspaceId: z.string(),
    actorId: z.string(),
    issuedAt: z.string(),
});
export const createWorkspaceCommandSchema = baseCommandSchema.extend({
    name: z.string().min(1),
    slug: z.string().min(1),
});
export const submitRequestCommandSchema = baseCommandSchema.extend({
    requestText: z.string().min(1),
});
export const planWorkflowRunCommandSchema = baseCommandSchema.extend({
    requestId: z.string(),
});
export const createWorkflowRunCommandSchema = baseCommandSchema.extend({
    workflowId: z.string(),
    requestId: z.string(),
});
export const createTaskCommandSchema = baseCommandSchema.extend({
    workflowRunId: z.string(),
    title: z.string().min(1),
    description: z.string().optional(),
    orderIndex: z.number().int().nonnegative(),
});
export const assignTaskCommandSchema = baseCommandSchema.extend({
    taskId: z.string(),
});
export const createExecutionSessionCommandSchema = baseCommandSchema.extend({
    assignmentId: z.string(),
    runtimeName: z.string().min(1),
});
export const startExecutionSessionCommandSchema = baseCommandSchema.extend({
    executionSessionId: z.string(),
});
export const recordExecutionProgressCommandSchema = baseCommandSchema.extend({
    executionSessionId: z.string(),
    sequenceNumber: z.number().int().nonnegative(),
    message: z.string(),
});
export const completeExecutionSessionCommandSchema = baseCommandSchema.extend({
    executionSessionId: z.string(),
    outputSummary: z.string(),
});
export const failExecutionSessionCommandSchema = baseCommandSchema.extend({
    executionSessionId: z.string(),
    errorMessage: z.string(),
});
//# sourceMappingURL=index.js.map