import { executionSessionToRow, rowToExecutionSession } from "../mappers/execution-session.js";
export class SupabaseExecutionSessionRepository {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async getById(id) {
        const { data, error } = await this.supabase
            .from("execution_sessions")
            .select("*")
            .eq("id", id)
            .single();
        if (error?.code === "PGRST116")
            return null;
        if (error)
            throw error;
        return rowToExecutionSession(data);
    }
    async save(session) {
        const row = executionSessionToRow(session);
        const { error } = await this.supabase.from("execution_sessions").upsert(row);
        if (error)
            throw error;
    }
}
//# sourceMappingURL=execution-session.js.map