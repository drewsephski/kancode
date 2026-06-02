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

export const queryEnvelopeSchema = z.object({
  queryId: z.string(),
  correlationId: z.string(),
  workspaceId: z.string(),
  actorId: z.string(),
  issuedAt: z.string(),
  query: z.unknown(),
});

export const commandEnvelopeSchema = z.object({
  commandId: z.string(),
  correlationId: z.string(),
  idempotencyKey: z.string(),
  workspaceId: z.string(),
  actorId: z.string(),
  issuedAt: z.string(),
  command: z.unknown(),
});

export const eventEnvelopeSchema = z.object({
  eventId: z.string(),
  correlationId: z.string(),
  causationId: z.string().optional(),
  workspaceId: z.string(),
  occurredAt: z.string(),
  version: z.number().int().nonnegative(),
  event: z.unknown(),
});

export const bridgeMessageEnvelopeSchema = z.object({
  messageId: z.string(),
  correlationId: z.string(),
  idempotencyKey: z.string(),
  workspaceId: z.string(),
  bridgeId: z.string(),
  machineId: z.string(),
  assignmentId: z.string().optional(),
  executionSessionId: z.string().optional(),
  type: z.string(),
  sequenceNumber: z.number().int().nonnegative(),
  occurredAt: z.string(),
  payload: z.unknown(),
});

export const responseEnvelopeSchema = z.object({
  responseId: z.string(),
  correlationId: z.string(),
  respondedAt: z.string().optional(),
  response: z.unknown(),
});

export interface ResponseEnvelope<TResponse> {
  responseId: string;
  correlationId: string;
  respondedAt?: string;
  response: TResponse;
}
