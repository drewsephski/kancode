import { z } from "zod";
export const ackResponseSchema = z.object({
    accepted: z.boolean(),
    message: z.string().optional(),
});
export const errorResponseSchema = z.object({
    success: z.literal(false),
    error: z.object({
        code: z.string(),
        message: z.string(),
        details: z.record(z.string(), z.unknown()).optional(),
    }),
});
//# sourceMappingURL=index.js.map