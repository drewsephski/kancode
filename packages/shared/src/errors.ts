export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", cause?: unknown) {
    super(message, "validation_error", cause);
    this.name = "ValidationError";
  }
}

export class DomainError extends AppError {
  constructor(message = "Domain rule violated", cause?: unknown) {
    super(message, "domain_error", cause);
    this.name = "DomainError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", cause?: unknown) {
    super(message, "not_found", cause);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", cause?: unknown) {
    super(message, "conflict", cause);
    this.name = "ConflictError";
  }
}
