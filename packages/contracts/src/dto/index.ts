import { z } from "zod";

export interface BaseDto {
  id: string;
}

export interface BaseWorkspaceDto extends BaseDto {
  workspaceId: string;
}

export interface BaseTimestampedDto extends BaseDto {
  createdAt: string;
  updatedAt: string;
}

export interface BaseRequestDto extends BaseWorkspaceDto {
  status: string;
}

export interface BaseResponseDto {
  success: boolean;
}

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
