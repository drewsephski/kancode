import { outboxRow, rowToOutboxRecord } from "../mappers/event.js";
export class SupabaseOutboxRepository {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async enqueue(records) {
        if (records.length === 0)
            return;
        const rows = records.map((r) => outboxRow(r.event, r.id, r.workspaceId));
        const { error } = await this.supabase.from("outbox").insert(rows);
        if (error)
            throw error;
    }
    async getPending() {
        const { data, error } = await this.supabase
            .from("outbox")
            .select("*")
            .eq("status", "pending")
            .order("created_at", { ascending: true });
        if (error)
            throw error;
        return (data ?? []).map(rowToOutboxRecord);
    }
    async markDispatched(ids) {
        if (ids.length === 0)
            return;
        const { error } = await this.supabase
            .from("outbox")
            .update({ status: "dispatched" })
            .in("id", ids);
        if (error)
            throw error;
    }
}
//# sourceMappingURL=outbox.js.map