import { z } from "zod";
export const realtimeChannelEnvelopeSchema = z.object({
    channel: z.string(),
    workspaceId: z.string(),
    correlationId: z.string(),
    occurredAt: z.string(),
    payload: z.unknown(),
});
//# sourceMappingURL=index.js.map