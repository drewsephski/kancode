import type { SupabaseClient } from "@supabase/supabase-js";
import type { DomainEvent } from "@kancode/domain";
import type { DomainEventStore } from "@kancode/application";
export declare class SupabaseEventStore implements DomainEventStore {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    append(events: DomainEvent[]): Promise<void>;
    getByAggregateId(aggregateId: string): Promise<DomainEvent[]>;
    getAll(): Promise<DomainEvent[]>;
}
//# sourceMappingURL=event-store.d.ts.map