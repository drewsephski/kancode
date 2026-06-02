import type { Command, CommandHandler, CommandContext, IdempotencyStore } from "../index.js";

export class IdempotentHandler<T extends Command, TResult> implements CommandHandler<T, TResult> {
  constructor(
    private readonly inner: CommandHandler<T, TResult>,
    private readonly store: IdempotencyStore,
  ) {}

  async handle(command: T, context: CommandContext): Promise<TResult> {
    const existing = await this.store.get<TResult>(context.idempotencyKey);
    if (existing !== null) {
      return existing;
    }

    const result = await this.inner.handle(command, context);
    await this.store.set(context.idempotencyKey, result);
    return result;
  }
}
