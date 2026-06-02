import { z } from "zod";
export const baseDtoSchema = z.object({
    id: z.string(),
});
export const baseWorkspaceDtoSchema = baseDtoSchema.extend({
    workspaceId: z.string(),
});
export const baseTimestampedDtoSchema = baseDtoSchema.extend({
    createdAt: z.string(),
    updatedAt: z.string(),
});
export const baseRequestDtoSchema = baseWorkspaceDtoSchema.extend({
    status: z.string(),
});
export const baseResponseDtoSchema = z.object({
    success: z.boolean(),
});
//# sourceMappingURL=index.js.map