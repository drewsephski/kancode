import type { DomainEventStore, OutboxRepository, IdempotencyStore } from "@kancode/application";
export declare function eventStoreContracts(createStore: () => DomainEventStore): {
    "append stores events and getAll retrieves them in order"(): Promise<void>;
    "append with empty array is a no-op"(): Promise<void>;
    "multiple appends accumulate events"(): Promise<void>;
};
export declare function outboxRepositoryContracts(createRepo: () => OutboxRepository): {
    "enqueue adds pending records"(): Promise<void>;
    "markDispatched updates status"(): Promise<void>;
    "enqueue with empty array is a no-op"(): Promise<void>;
};
export declare function idempotencyStoreContracts(createStore: () => IdempotencyStore): {
    "has returns false for unknown keys"(): Promise<void>;
    "set followed by get returns stored value"(): Promise<void>;
    "get returns null for unset keys"(): Promise<void>;
    "has returns true after set"(): Promise<void>;
    "overwriting a key replaces its value"(): Promise<void>;
};
//# sourceMappingURL=infrastructure-contracts.d.ts.map