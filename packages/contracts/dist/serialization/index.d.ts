import { z } from "zod";
export declare const jsonPrimitiveSchema: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]>;
export declare const jsonValueSchema: z.ZodType<unknown>;
export type SerializationSafe = unknown;
//# sourceMappingURL=index.d.ts.map