export type Result<TValue, TError = Error> = {
    readonly ok: true;
    readonly value: TValue;
} | {
    readonly ok: false;
    readonly error: TError;
};
export declare const ok: <TValue>(value: TValue) => Result<TValue, never>;
export declare const err: <TError>(error: TError) => Result<never, TError>;
export declare const isOk: <TValue, TError>(result: Result<TValue, TError>) => result is {
    readonly ok: true;
    readonly value: TValue;
};
export declare const isErr: <TValue, TError>(result: Result<TValue, TError>) => result is {
    readonly ok: false;
    readonly error: TError;
};
//# sourceMappingURL=result.d.ts.map