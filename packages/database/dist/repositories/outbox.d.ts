import type { SupabaseClient } from "@supabase/supabase-js";
import type { OutboxRepository, OutboxRecord } from "@kancode/application";
export declare class SupabaseOutboxRepository implements OutboxRepository {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    enqueue(records: OutboxRecord[]): Promise<void>;
    getPending(): Promise<OutboxRecord[]>;
    markDispatched(ids: string[]): Promise<void>;
}
//# sourceMappingURL=outbox.d.ts.map