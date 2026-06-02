export class AppError extends Error {
    code;
    cause;
    constructor(message, code, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = "AppError";
    }
}
export class ValidationError extends AppError {
    constructor(message = "Validation failed", cause) {
        super(message, "validation_error", cause);
        this.name = "ValidationError";
    }
}
export class DomainError extends AppError {
    constructor(message = "Domain rule violated", cause) {
        super(message, "domain_error", cause);
        this.name = "DomainError";
    }
}
export class NotFoundError extends AppError {
    constructor(message = "Resource not found", cause) {
        super(message, "not_found", cause);
        this.name = "NotFoundError";
    }
}
export class ConflictError extends AppError {
    constructor(message = "Conflict", cause) {
        super(message, "conflict", cause);
        this.name = "ConflictError";
    }
}
//# sourceMappingURL=errors.js.map