import type { Command, CommandHandler, CommandContext, IdempotencyStore } from "../index.js";
export declare class IdempotentHandler<T extends Command, TResult> implements CommandHandler<T, TResult> {
    private readonly inner;
    private readonly store;
    constructor(inner: CommandHandler<T, TResult>, store: IdempotencyStore);
    handle(command: T, context: CommandContext): Promise<TResult>;
}
//# sourceMappingURL=idempotent-handler.d.ts.map