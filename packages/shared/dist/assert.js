export const invariant = (condition, message) => {
    if (!condition) {
        throw new Error(message);
    }
};
export const ensureDefined = (value, message) => {
    if (value === null || value === undefined) {
        throw new Error(message);
    }
    return value;
};
export const ensureNonEmptyString = (value, message) => {
    if (!value.trim()) {
        throw new Error(message);
    }
    return value;
};
export const assertNever = (value) => {
    throw new Error(`Unexpected value: ${String(value)}`);
};
//# sourceMappingURL=assert.js.map