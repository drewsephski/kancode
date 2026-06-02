import { z } from "zod";
export interface GetRequestQuery {
    requestId: string;
}
export declare const getRequestQuerySchema: z.ZodObject<{
    requestId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    requestId: string;
}, {
    requestId: string;
}>;
export interface GetWorkflowRunQuery {
    workflowRunId: string;
}
export declare const getWorkflowRunQuerySchema: z.ZodObject<{
    workflowRunId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    workflowRunId: string;
}, {
    workflowRunId: string;
}>;
export interface ListTasksQuery {
    workflowRunId: string;
}
export declare const listTasksQuerySchema: z.ZodObject<{
    workflowRunId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    workflowRunId: string;
}, {
    workflowRunId: string;
}>;
export interface BaseQuery {
    readonly kind: string;
}
//# sourceMappingURL=index.d.ts.map