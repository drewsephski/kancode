import { z } from "zod";
export interface RequestSubmittedEvent {
    requestId: string;
    requestText: string;
}
export declare const requestSubmittedEventSchema: z.ZodObject<{
    eventId: z.ZodString;
    correlationId: z.ZodString;
    causationId: z.ZodOptional<z.ZodString>;
    workspaceId: z.ZodString;
    occurredAt: z.ZodString;
    version: z.ZodNumber;
} & {
    requestId: z.ZodString;
    requestText: z.ZodString;
}, "strip", z.ZodTypeAny, {
    correlationId: string;
    workspaceId: string;
    requestText: string;
    requestId: string;
    eventId: string;
    occurredAt: string;
    version: number;
    causationId?: string | undefined;
}, {
    correlationId: string;
    workspaceId: string;
    requestText: string;
    requestId: string;
    eventId: string;
    occurredAt: string;
    version: number;
    causationId?: string | undefined;
}>;
export interface WorkflowCreatedEvent {
    workflowId: string;
    requestId: string;
    title: string;
}
export declare const workflowCreatedEventSchema: z.ZodObject<{
    eventId: z.ZodString;
    correlationId: z.ZodString;
    causationId: z.ZodOptional<z.ZodString>;
    workspaceId: z.ZodString;
    occurredAt: z.ZodString;
    version: z.ZodNumber;
} & {
    workflowId: z.ZodString;
    requestId: z.ZodString;
    title: z.ZodString;
}, "strip", z.ZodTypeAny, {
    correlationId: string;
    workspaceId: string;
    requestId: string;
    workflowId: string;
    title: string;
    eventId: string;
    occurredAt: string;
    version: number;
    causationId?: string | undefined;
}, {
    correlationId: string;
    workspaceId: string;
    requestId: string;
    workflowId: string;
    title: string;
    eventId: string;
    occurredAt: string;
    version: number;
    causationId?: string | undefined;
}>;
export interface WorkflowRunCreatedEvent {
    workflowRunId: string;
    workflowId: string;
    requestId: string;
}
export declare const workflowRunCreatedEventSchema: z.ZodObject<{
    eventId: z.ZodString;
    correlationId: z.ZodString;
    causationId: z.ZodOptional<z.ZodString>;
    workspaceId: z.ZodString;
    occurredAt: z.ZodString;
    version: z.ZodNumber;
} & {
    workflowRunId: z.ZodString;
    workflowId: z.ZodString;
    requestId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    correlationId: string;
    workspaceId: string;
    requestId: string;
    workflowId: string;
    workflowRunId: string;
    eventId: string;
    occurredAt: string;
    version: number;
    causationId?: string | undefined;
}, {
    correlationId: string;
    workspaceId: string;
    requestId: string;
    workflowId: string;
    workflowRunId: string;
    eventId: string;
    occurredAt: string;
    version: number;
    causationId?: string | undefined;
}>;
export interface TaskCreatedEvent {
    taskId: string;
    workflowRunId: string;
    title: string;
    orderIndex: number;
}
export declare const taskCreatedEventSchema: z.ZodObject<{
    eventId: z.ZodString;
    correlationId: z.ZodString;
    causationId: z.ZodOptional<z.ZodString>;
    workspaceId: z.ZodString;
    occurredAt: z.ZodString;
    version: z.ZodNumber;
} & {
    taskId: z.ZodString;
    workflowRunId: z.ZodString;
    title: z.ZodString;
    orderIndex: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    correlationId: string;
    workspaceId: string;
    workflowRunId: string;
    title: string;
    orderIndex: number;
    taskId: string;
    eventId: string;
    occurredAt: string;
    version: number;
    causationId?: string | undefined;
}, {
    correlationId: string;
    workspaceId: string;
    workflowRunId: string;
    title: string;
    orderIndex: number;
    taskId: string;
    eventId: string;
    occurredAt: string;
    version: number;
    causationId?: string | undefined;
}>;
export interface AssignmentCreatedEvent {
    assignmentId: string;
    taskId: string;
}
export declare const assignmentCreatedEventSchema: z.ZodObject<{
    eventId: z.ZodString;
    correlationId: z.ZodString;
    causationId: z.ZodOptional<z.ZodString>;
    workspaceId: z.ZodString;
    occurredAt: z.ZodString;
    version: z.ZodNumber;
} & {
    assignmentId: z.ZodString;
    taskId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    correlationId: string;
    workspaceId: string;
    taskId: string;
    assignmentId: string;
    eventId: string;
    occurredAt: string;
    version: number;
    causationId?: string | undefined;
}, {
    correlationId: string;
    workspaceId: string;
    taskId: string;
    assignmentId: string;
    eventId: string;
    occurredAt: string;
    version: number;
    causationId?: string | undefined;
}>;
export interface ExecutionSessionCreatedEvent {
    executionSessionId: string;
    assignmentId: string;
    runtimeName: string;
}
export declare const executionSessionCreatedEventSchema: z.ZodObject<{
    eventId: z.ZodString;
    correlationId: z.ZodString;
    causationId: z.ZodOptional<z.ZodString>;
    workspaceId: z.ZodString;
    occurredAt: z.ZodString;
    version: z.ZodNumber;
} & {
    executionSessionId: z.ZodString;
    assignmentId: z.ZodString;
    runtimeName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    correlationId: string;
    workspaceId: string;
    assignmentId: string;
    runtimeName: string;
    executionSessionId: string;
    eventId: string;
    occurredAt: string;
    version: number;
    causationId?: string | undefined;
}, {
    correlationId: string;
    workspaceId: string;
    assignmentId: string;
    runtimeName: string;
    executionSessionId: string;
    eventId: string;
    occurredAt: string;
    version: number;
    causationId?: string | undefined;
}>;
//# sourceMappingURL=index.d.ts.map