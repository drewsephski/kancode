import { requestToRow, rowToRequest } from "../mappers/request.js";
export class SupabaseRequestRepository {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async getById(id) {
        const { data, error } = await this.supabase
            .from("requests")
            .select("*")
            .eq("id", id)
            .single();
        if (error?.code === "PGRST116")
            return null;
        if (error)
            throw error;
        return rowToRequest(data);
    }
    async save(request) {
        const row = requestToRow(request);
        const { error } = await this.supabase.from("requests").upsert(row);
        if (error)
            throw error;
    }
}
//# sourceMappingURL=request.js.map