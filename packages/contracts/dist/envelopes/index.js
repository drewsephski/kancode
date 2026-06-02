import { z } from "zod";
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
//# sourceMappingURL=index.js.map