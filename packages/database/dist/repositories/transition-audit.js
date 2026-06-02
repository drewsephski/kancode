import { auditEntryToRow, rowToAuditEntry } from "../mappers/transition-audit.js";
export class SupabaseTransitionAuditLog {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async record(entry) {
        const row = auditEntryToRow(entry);
        const { error } = await this.supabase.from("transition_audit").insert(row);
        if (error)
            throw error;
    }
    async getByProcessId(processId) {
        const { data, error } = await this.supabase
            .from("transition_audit")
            .select("*")
            .eq("process_id", processId)
            .order("revision", { ascending: true });
        if (error)
            throw error;
        return (data ?? []).map(rowToAuditEntry);
    }
}
//# sourceMappingURL=transition-audit.js.map