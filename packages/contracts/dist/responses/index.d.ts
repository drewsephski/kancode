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
export declare const ackResponseSchema: z.ZodObject<{
    accepted: z.ZodBoolean;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    accepted: boolean;
    message?: string | undefined;
}, {
    accepted: boolean;
    message?: string | undefined;
}>;
export declare const errorResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodObject<{
        code: z.ZodString;
        message: z.ZodString;
        details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        message: string;
        details?: Record<string, unknown> | undefined;
    }, {
        code: string;
        message: string;
        details?: Record<string, unknown> | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown> | undefined;
    };
}, {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown> | undefined;
    };
}>;
//# sourceMappingURL=index.d.ts.map