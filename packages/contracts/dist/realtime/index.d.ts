import { z } from "zod";
export interface RealtimeChannelEnvelope<TPayload> {
    channel: string;
    workspaceId: string;
    correlationId: string;
    occurredAt: string;
    payload: TPayload;
}
export declare const realtimeChannelEnvelopeSchema: z.ZodObject<{
    channel: z.ZodString;
    workspaceId: z.ZodString;
    correlationId: z.ZodString;
    occurredAt: z.ZodString;
    payload: z.ZodUnknown;
}, "strip", z.ZodTypeAny, {
    correlationId: string;
    workspaceId: string;
    occurredAt: string;
    channel: string;
    payload?: unknown;
}, {
    correlationId: string;
    workspaceId: string;
    occurredAt: string;
    channel: string;
    payload?: unknown;
}>;
//# sourceMappingURL=index.d.ts.map