export class IdempotentHandler {
    inner;
    store;
    constructor(inner, store) {
        this.inner = inner;
        this.store = store;
    }
    async handle(command, context) {
        const existing = await this.store.get(context.idempotencyKey);
        if (existing !== null) {
            return existing;
        }
        const result = await this.inner.handle(command, context);
        await this.store.set(context.idempotencyKey, result);
        return result;
    }
}
//# sourceMappingURL=idempotent-handler.js.map