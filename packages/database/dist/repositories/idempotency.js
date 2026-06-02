export class SupabaseIdempotencyStore {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async has(key) {
        const { data, error } = await this.supabase
            .from("idempotency_keys")
            .select("key")
            .eq("key", key)
            .single();
        if (error?.code === "PGRST116")
            return false;
        if (error)
            throw error;
        return data !== null;
    }
    async set(key, result) {
        const { error } = await this.supabase.from("idempotency_keys").upsert({
            key,
            result: result,
        });
        if (error)
            throw error;
    }
    async get(key) {
        const { data, error } = await this.supabase
            .from("idempotency_keys")
            .select("result")
            .eq("key", key)
            .single();
        if (error?.code === "PGRST116")
            return null;
        if (error)
            throw error;
        return data?.result ?? null;
    }
}
//# sourceMappingURL=idempotency.js.map