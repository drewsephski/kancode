import { z } from "zod";
export const getRequestQuerySchema = z.object({
    requestId: z.string(),
});
export const getWorkflowRunQuerySchema = z.object({
    workflowRunId: z.string(),
});
export const listTasksQuerySchema = z.object({
    workflowRunId: z.string(),
});
//# sourceMappingURL=index.js.map