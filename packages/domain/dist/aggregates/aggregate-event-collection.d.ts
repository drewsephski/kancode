import type { DomainEvent } from "../events/domain-event.js";
export declare class AggregateEventCollection {
    #private;
    add(event: DomainEvent): void;
    pull(): DomainEvent[];
    get size(): number;
    isEmpty(): boolean;
}
//# sourceMappingURL=aggregate-event-collection.d.ts.map