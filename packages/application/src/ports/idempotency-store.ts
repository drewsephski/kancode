export interface IdempotencyStore {
  has(key: string): Promise<boolean>;
  set(key: string, result: unknown): Promise<void>;
  get<T>(key: string): Promise<T | null>;
}
