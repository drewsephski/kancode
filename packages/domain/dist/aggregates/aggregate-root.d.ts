import type { DomainEvent, DomainEventInput } from "../events/domain-event.js";
export declare abstract class AggregateRoot {
    #private;
    readonly id: string;
    protected _version: number;
    constructor(id: string, _version?: number);
    get version(): number;
    protected recordEvent(event: DomainEventInput): void;
    pullEvents(): DomainEvent[];
}
//# sourceMappingURL=aggregate-root.d.ts.map