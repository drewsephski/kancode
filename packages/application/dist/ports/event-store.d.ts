import type { DomainEvent } from "@kancode/domain";
export interface DomainEventStore {
    append(events: DomainEvent[]): Promise<void>;
    getByAggregateId(aggregateId: string): Promise<DomainEvent[]>;
    getAll(): Promise<DomainEvent[]>;
}
//# sourceMappingURL=event-store.d.ts.map