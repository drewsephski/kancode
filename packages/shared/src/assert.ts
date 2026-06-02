export const invariant = (condition: unknown, message: string): asserts condition => {
  if (!condition) {
    throw new Error(message);
  }
};

export const ensureDefined = <T>(value: T | null | undefined, message: string): T => {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
  return value;
};

export const ensureNonEmptyString = (value: string, message: string): string => {
  if (!value.trim()) {
    throw new Error(message);
  }
  return value;
};

export const assertNever = (value: never): never => {
  throw new Error(`Unexpected value: ${String(value)}`);
};
