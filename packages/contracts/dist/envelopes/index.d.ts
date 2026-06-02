import { z } from "zod";
export interface CommandEnvelope<TCommand> {
    commandId: string;
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    command: TCommand;
}
export interface EventEnvelope<TEvent> {
    eventId: string;
    correlationId: string;
    causationId?: string;
    workspaceId: string;
    occurredAt: string;
    version: number;
    event: TEvent;
}
export interface QueryEnvelope<TQuery> {
    queryId: string;
    correlationId: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    query: TQuery;
}
export interface BridgeMessageEnvelope<TType extends string, TPayload> {
    messageId: string;
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    bridgeId: string;
    machineId: string;
    assignmentId?: string;
    executionSessionId?: string;
    type: TType;
    sequenceNumber: number;
    occurredAt: string;
    payload: TPayload;
}
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export interface JsonObject {
    [key: string]: JsonValue;
}
export interface SerializationSafeRecord {
    [key: string]: JsonValue;
}
export declare const queryEnvelopeSchema: z.ZodObject<{
    queryId: z.ZodString;
    correlationId: z.ZodString;
    workspaceId: z.ZodString;
    actorId: z.ZodString;
    issuedAt: z.ZodString;
    query: z.ZodUnknown;
}, "strip", z.ZodTypeAny, {
    correlationId: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    queryId: string;
    query?: unknown;
}, {
    correlationId: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    queryId: string;
    query?: unknown;
}>;
export declare const commandEnvelopeSchema: z.ZodObject<{
    commandId: z.ZodString;
    correlationId: z.ZodString;
    idempotencyKey: z.ZodString;
    workspaceId: z.ZodString;
    actorId: z.ZodString;
    issuedAt: z.ZodString;
    command: z.ZodUnknown;
}, "strip", z.ZodTypeAny, {
    commandId: string;
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    command?: unknown;
}, {
    commandId: string;
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    actorId: string;
    issuedAt: string;
    command?: unknown;
}>;
export declare const eventEnvelopeSchema: z.ZodObject<{
    eventId: z.ZodString;
    correlationId: z.ZodString;
    causationId: z.ZodOptional<z.ZodString>;
    workspaceId: z.ZodString;
    occurredAt: z.ZodString;
    version: z.ZodNumber;
    event: z.ZodUnknown;
}, "strip", z.ZodTypeAny, {
    correlationId: string;
    workspaceId: string;
    eventId: string;
    occurredAt: string;
    version: number;
    causationId?: string | undefined;
    event?: unknown;
}, {
    correlationId: string;
    workspaceId: string;
    eventId: string;
    occurredAt: string;
    version: number;
    causationId?: string | undefined;
    event?: unknown;
}>;
export declare const bridgeMessageEnvelopeSchema: z.ZodObject<{
    messageId: z.ZodString;
    correlationId: z.ZodString;
    idempotencyKey: z.ZodString;
    workspaceId: z.ZodString;
    bridgeId: z.ZodString;
    machineId: z.ZodString;
    assignmentId: z.ZodOptional<z.ZodString>;
    executionSessionId: z.ZodOptional<z.ZodString>;
    type: z.ZodString;
    sequenceNumber: z.ZodNumber;
    occurredAt: z.ZodString;
    payload: z.ZodUnknown;
}, "strip", z.ZodTypeAny, {
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    type: string;
    sequenceNumber: number;
    occurredAt: string;
    messageId: string;
    bridgeId: string;
    machineId: string;
    assignmentId?: string | undefined;
    executionSessionId?: string | undefined;
    payload?: unknown;
}, {
    correlationId: string;
    idempotencyKey: string;
    workspaceId: string;
    type: string;
    sequenceNumber: number;
    occurredAt: string;
    messageId: string;
    bridgeId: string;
    machineId: string;
    assignmentId?: string | undefined;
    executionSessionId?: string | undefined;
    payload?: unknown;
}>;
export declare const responseEnvelopeSchema: z.ZodObject<{
    responseId: z.ZodString;
    correlationId: z.ZodString;
    respondedAt: z.ZodOptional<z.ZodString>;
    response: z.ZodUnknown;
}, "strip", z.ZodTypeAny, {
    correlationId: string;
    responseId: string;
    respondedAt?: string | undefined;
    response?: unknown;
}, {
    correlationId: string;
    responseId: string;
    respondedAt?: string | undefined;
    response?: unknown;
}>;
export interface ResponseEnvelope<TResponse> {
    responseId: string;
    correlationId: string;
    respondedAt?: string;
    response: TResponse;
}
//# sourceMappingURL=index.d.ts.map