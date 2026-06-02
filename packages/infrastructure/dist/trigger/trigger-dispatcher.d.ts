import type { EventDispatcher } from "@kancode/events";
import type { OutboxRepository, DeadLetterQueue, IdGenerator, Clock, MetricsRecorder } from "@kancode/application";
import type { SendEventFn } from "./types.js";
export declare const MAX_RETRY_COUNT = 3;
export interface TriggerDispatcherConfig {
    maxRetries?: number;
    /**
     * Override the send function for testing. Defaults to `tasks.trigger("event-bridge", payload)`.
     */
    sendEvent?: SendEventFn;
}
export declare class TriggerDispatcher implements EventDispatcher {
    private readonly outboxRepo;
    private readonly deadLetterQueue;
    private readonly idGenerator;
    private readonly clock;
    private readonly config;
    private readonly metrics?;
    private readonly maxRetries;
    private readonly sendEvent;
    constructor(outboxRepo: OutboxRepository, deadLetterQueue: DeadLetterQueue, idGenerator: IdGenerator, clock: Clock, config?: TriggerDispatcherConfig, metrics?: MetricsRecorder | undefined);
    dispatchPending(): Promise<void>;
    private sendToTrigger;
    private defaultSendEvent;
}
//# sourceMappingURL=trigger-dispatcher.d.ts.map