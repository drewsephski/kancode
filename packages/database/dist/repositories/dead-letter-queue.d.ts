import type { SupabaseClient } from "@supabase/supabase-js";
import type { DomainEvent } from "@kancode/domain";
import type { DeadLetterEntry, DeadLetterQueue } from "@kancode/application";
export declare class SupabaseDeadLetterQueue implements DeadLetterQueue {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    enqueue(outboxId: string, event: DomainEvent, error: Error, retryCount: number): Promise<void>;
    getAll(): Promise<DeadLetterEntry[]>;
}
//# sourceMappingURL=dead-letter-queue.d.ts.map