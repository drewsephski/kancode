import { z } from "zod";

export interface AckResponse {
  accepted: boolean;
  message?: string;
}

export interface BaseResponse {
  success: boolean;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

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
