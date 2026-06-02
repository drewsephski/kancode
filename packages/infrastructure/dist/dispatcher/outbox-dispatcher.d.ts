import type { EventDispatcher, SubscriberRegistry } from "@kancode/events";
import type { OutboxRepository } from "@kancode/application";
export declare class OutboxDispatcher implements EventDispatcher {
    private readonly outboxRepo;
    private readonly registry;
    constructor(outboxRepo: OutboxRepository, registry: SubscriberRegistry);
    dispatchPending(): Promise<void>;
}
//# sourceMappingURL=outbox-dispatcher.d.ts.map