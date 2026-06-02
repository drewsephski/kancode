import type { SupabaseClient } from "@supabase/supabase-js";
import type { IdempotencyStore } from "@kancode/application";
export declare class SupabaseIdempotencyStore implements IdempotencyStore {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    has(key: string): Promise<boolean>;
    set(key: string, result: unknown): Promise<void>;
    get<T>(key: string): Promise<T | null>;
}
//# sourceMappingURL=idempotency.d.ts.map