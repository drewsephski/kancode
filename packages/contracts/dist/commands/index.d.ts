import { z } from "zod";
export interface CreateWorkspaceCommand {
    name: string;
    slug: string;
}
export declare const createWorkspaceCommandSchema: z.ZodObject<{
    commandId: z.ZodString;
    correlationId: z.ZodString;
    idempotencyKey: z.ZodString;
    workspaceId: z.ZodString;
    actorId: z.ZodString;
    issuedAt: z.ZodString;
} & {
    name: z.ZodString;
    slug: z.ZodString;
}, "strip", z.ZodTypeAny, {
    commandId: string;
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    name: string;
    slug: string;
}, {
    commandId: string;
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    name: string;
    slug: string;
}>;
export interface SubmitRequestCommand {
    requestText: string;
}
export declare const submitRequestCommandSchema: z.ZodObject<{
    commandId: z.ZodString;
    correlationId: z.ZodString;
    idempotencyKey: z.ZodString;
    workspaceId: z.ZodString;
    actorId: z.ZodString;
    issuedAt: z.ZodString;
} & {
    requestText: z.ZodString;
}, "strip", z.ZodTypeAny, {
    commandId: string;
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    requestText: string;
}, {
    commandId: string;
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    requestText: string;
}>;
export interface PlanWorkflowRunCommand {
    requestId: string;
}
export declare const planWorkflowRunCommandSchema: z.ZodObject<{
    commandId: z.ZodString;
    correlationId: z.ZodString;
    idempotencyKey: z.ZodString;
    workspaceId: z.ZodString;
    actorId: z.ZodString;
    issuedAt: z.ZodString;
} & {
    requestId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    commandId: string;
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    requestId: string;
}, {
    commandId: string;
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    requestId: string;
}>;
export interface CreateWorkflowRunCommand {
    workflowId: string;
    requestId: string;
}
export declare const createWorkflowRunCommandSchema: z.ZodObject<{
    commandId: z.ZodString;
    correlationId: z.ZodString;
    idempotencyKey: z.ZodString;
    workspaceId: z.ZodString;
    actorId: z.ZodString;
    issuedAt: z.ZodString;
} & {
    workflowId: z.ZodString;
    requestId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    commandId: string;
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    requestId: string;
    workflowId: string;
}, {
    commandId: string;
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    requestId: string;
    workflowId: string;
}>;
export interface CreateTaskCommand {
    workflowRunId: string;
    title: string;
    description?: string;
    orderIndex: number;
}
export declare const createTaskCommandSchema: z.ZodObject<{
    commandId: z.ZodString;
    correlationId: z.ZodString;
    idempotencyKey: z.ZodString;
    workspaceId: z.ZodString;
    actorId: z.ZodString;
    issuedAt: z.ZodString;
} & {
    workflowRunId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    orderIndex: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    commandId: string;
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    workflowRunId: string;
    title: string;
    orderIndex: number;
    description?: string | undefined;
}, {
    commandId: string;
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    workflowRunId: string;
    title: string;
    orderIndex: number;
    description?: string | undefined;
}>;
export interface AssignTaskCommand {
    taskId: string;
}
export declare const assignTaskCommandSchema: z.ZodObject<{
    commandId: z.ZodString;
    correlationId: z.ZodString;
    idempotencyKey: z.ZodString;
    workspaceId: z.ZodString;
    actorId: z.ZodString;
    issuedAt: z.ZodString;
} & {
    taskId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    commandId: string;
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    taskId: string;
}, {
    commandId: string;
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    taskId: string;
}>;
export interface CreateExecutionSessionCommand {
    assignmentId: string;
    runtimeName: string;
}
export declare const createExecutionSessionCommandSchema: z.ZodObject<{
    commandId: z.ZodString;
    correlationId: z.ZodString;
    idempotencyKey: z.ZodString;
    workspaceId: z.ZodString;
    actorId: z.ZodString;
    issuedAt: z.ZodString;
} & {
    assignmentId: z.ZodString;
    runtimeName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    commandId: string;
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    assignmentId: string;
    runtimeName: string;
}, {
    commandId: string;
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    assignmentId: string;
    runtimeName: string;
}>;
export interface StartExecutionSessionCommand {
    executionSessionId: string;
}
export declare const startExecutionSessionCommandSchema: z.ZodObject<{
    commandId: z.ZodString;
    correlationId: z.ZodString;
    idempotencyKey: z.ZodString;
    workspaceId: z.ZodString;
    actorId: z.ZodString;
    issuedAt: z.ZodString;
} & {
    executionSessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    commandId: string;
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    executionSessionId: string;
}, {
    commandId: string;
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    executionSessionId: string;
}>;
export interface RecordExecutionProgressCommand {
    executionSessionId: string;
    sequenceNumber: number;
    message: string;
}
export declare const recordExecutionProgressCommandSchema: z.ZodObject<{
    commandId: z.ZodString;
    correlationId: z.ZodString;
    idempotencyKey: z.ZodString;
    workspaceId: z.ZodString;
    actorId: z.ZodString;
    issuedAt: z.ZodString;
} & {
    executionSessionId: z.ZodString;
    sequenceNumber: z.ZodNumber;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    commandId: string;
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    message: string;
    executionSessionId: string;
    sequenceNumber: number;
}, {
    commandId: string;
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    message: string;
    executionSessionId: string;
    sequenceNumber: number;
}>;
export interface CompleteExecutionSessionCommand {
    executionSessionId: string;
    outputSummary: string;
}
export declare const completeExecutionSessionCommandSchema: z.ZodObject<{
    commandId: z.ZodString;
    correlationId: z.ZodString;
    idempotencyKey: z.ZodString;
    workspaceId: z.ZodString;
    actorId: z.ZodString;
    issuedAt: z.ZodString;
} & {
    executionSessionId: z.ZodString;
    outputSummary: z.ZodString;
}, "strip", z.ZodTypeAny, {
    commandId: string;
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    executionSessionId: string;
    outputSummary: string;
}, {
    commandId: string;
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    executionSessionId: string;
    outputSummary: string;
}>;
export interface FailExecutionSessionCommand {
    executionSessionId: string;
    errorMessage: string;
}
export declare const failExecutionSessionCommandSchema: z.ZodObject<{
    commandId: z.ZodString;
    correlationId: z.ZodString;
    idempotencyKey: z.ZodString;
    workspaceId: z.ZodString;
    actorId: z.ZodString;
    issuedAt: z.ZodString;
} & {
    executionSessionId: z.ZodString;
    errorMessage: z.ZodString;
}, "strip", z.ZodTypeAny, {
    commandId: string;
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    executionSessionId: string;
    errorMessage: string;
}, {
    commandId: string;
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    executionSessionId: string;
    errorMessage: string;
}>;
//# sourceMappingURL=index.d.ts.map