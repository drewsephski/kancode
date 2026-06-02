import type { Command } from "../commands/index.js";
import type { Query } from "../queries/index.js";
export interface CommandContext {
    workspaceId: string;
    actorId: string;
    correlationId: string;
    idempotencyKey: string;
    policySnapshotId?: string;
}
export interface QueryContext {
    workspaceId: string;
    actorId: string;
    correlationId: string;
}
export interface CommandHandler<TCommand extends Command = Command, TResult = void> {
    handle(command: TCommand, context: CommandContext): Promise<TResult>;
}
export interface QueryHandler<TQuery extends Query = Query, TResult = unknown> {
    handle(query: TQuery, context: QueryContext): Promise<TResult>;
}
export type MvpCommandHandler = CommandHandler;
export type MvpQueryHandler = QueryHandler<Query, unknown>;
export * from "./submit-request.handler.js";
export * from "./plan-workflow-run.handler.js";
export * from "./assign-task.handler.js";
export * from "./create-execution-session.handler.js";
export * from "./complete-execution-session.handler.js";
export * from "./idempotent-handler.js";
export * from "./outbox-event-publisher.js";
//# sourceMappingURL=index.d.ts.map