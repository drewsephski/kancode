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
export declare const baseDtoSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const baseWorkspaceDtoSchema: z.ZodObject<{
    id: z.ZodString;
} & {
    workspaceId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    workspaceId: string;
    id: string;
}, {
    workspaceId: string;
    id: string;
}>;
export declare const baseTimestampedDtoSchema: z.ZodObject<{
    id: z.ZodString;
} & {
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
}>;
export declare const baseRequestDtoSchema: z.ZodObject<{
    id: z.ZodString;
} & {
    workspaceId: z.ZodString;
} & {
    status: z.ZodString;
}, "strip", z.ZodTypeAny, {
    workspaceId: string;
    status: string;
    id: string;
}, {
    workspaceId: string;
    status: string;
    id: string;
}>;
export declare const baseResponseDtoSchema: z.ZodObject<{
    success: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    success: boolean;
}, {
    success: boolean;
}>;
//# sourceMappingURL=index.d.ts.map