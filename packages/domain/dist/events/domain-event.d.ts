export interface DomainEvent<TType extends string = string, TPayload = unknown> {
    type: TType;
    occurredAt: Date;
    payload: TPayload;
    version: number;
}
export type DomainEventInput<TType extends string = string, TPayload = unknown> = Omit<DomainEvent<TType, TPayload>, "version">;
//# sourceMappingURL=domain-event.d.ts.map