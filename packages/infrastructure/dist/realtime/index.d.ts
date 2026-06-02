export interface RealtimePublisher<TPayload = unknown> {
    publish(channel: string, payload: TPayload): Promise<void>;
}
export interface RealtimeSubscriber<TPayload = unknown> {
    subscribe(channel: string, handler: (payload: TPayload) => Promise<void>): void;
}
//# sourceMappingURL=index.d.ts.map