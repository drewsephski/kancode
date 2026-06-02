export interface Logger {
    info(message: string, metadata?: Record<string, unknown>): void;
    warn(message: string, metadata?: Record<string, unknown>): void;
    error(message: string, metadata?: Record<string, unknown>): void;
    debug(message: string, metadata?: Record<string, unknown>): void;
}
export type LogLevel = "debug" | "info" | "warn" | "error";
export interface LogContext {
    correlationId?: string;
    workspaceId?: string;
    actorId?: string;
}
export interface LoggerFactory {
    create(context?: LogContext): Logger;
}
export declare class ConsoleLogger implements Logger {
    info(message: string, metadata?: Record<string, unknown>): void;
    warn(message: string, metadata?: Record<string, unknown>): void;
    error(message: string, metadata?: Record<string, unknown>): void;
    debug(message: string, metadata?: Record<string, unknown>): void;
}
//# sourceMappingURL=logging.d.ts.map