import { z } from "zod";
export const bridgeAckSchema = z.object({
    messageId: z.string(),
    correlationId: z.string(),
    sequenceNumber: z.number().int().nonnegative(),
    accepted: z.boolean(),
    errorCode: z.string().optional(),
    errorMessage: z.string().optional(),
});
//# sourceMappingURL=index.js.map