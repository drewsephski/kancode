import { z } from "zod";

export interface RealtimeChannelEnvelope<TPayload> {
  channel: string;
  workspaceId: string;
  correlationId: string;
  occurredAt: string;
  payload: TPayload;
}

export const realtimeChannelEnvelopeSchema = z.object({
  channel: z.string(),
  workspaceId: z.string(),
  correlationId: z.string(),
  occurredAt: z.string(),
  payload: z.unknown(),
});
