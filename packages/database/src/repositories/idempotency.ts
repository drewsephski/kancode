import type { SupabaseClient } from "@supabase/supabase-js";
import type { IdempotencyStore } from "@kancode/application";

export class SupabaseIdempotencyStore implements IdempotencyStore {
  constructor(private readonly supabase: SupabaseClient) {}

  async has(key: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("idempotency_keys")
      .select("key")
      .eq("key", key)
      .single();

    if (error?.code === "PGRST116") return false;
    if (error) throw error;
    return data !== null;
  }

  async set(key: string, result: unknown): Promise<void> {
    const { error } = await this.supabase.from("idempotency_keys").upsert({
      key,
      result: result as Record<string, unknown> | null,
    });
    if (error) throw error;
  }

  async get<T>(key: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from("idempotency_keys")
      .select("result")
      .eq("key", key)
      .single();

    if (error?.code === "PGRST116") return null;
    if (error) throw error;
    return (data?.result as T) ?? null;
  }
}
