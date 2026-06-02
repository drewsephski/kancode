export declare class AppError extends Error {
    readonly code: string;
    readonly cause?: unknown | undefined;
    constructor(message: string, code: string, cause?: unknown | undefined);
}
export declare class ValidationError extends AppError {
    constructor(message?: string, cause?: unknown);
}
export declare class DomainError extends AppError {
    constructor(message?: string, cause?: unknown);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string, cause?: unknown);
}
export declare class ConflictError extends AppError {
    constructor(message?: string, cause?: unknown);
}
//# sourceMappingURL=errors.d.ts.map