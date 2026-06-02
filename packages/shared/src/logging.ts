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

export class ConsoleLogger implements Logger {
  info(message: string, metadata?: Record<string, unknown>): void {
    console.info(message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    console.warn(message, metadata);
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    console.error(message, metadata);
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    console.debug(message, metadata);
  }
}
