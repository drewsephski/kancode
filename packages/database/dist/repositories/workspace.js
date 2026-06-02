import { workspaceToRow, rowToWorkspace } from "../mappers/workspace.js";
export class SupabaseWorkspaceRepository {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async getById(id) {
        const { data, error } = await this.supabase
            .from("workspaces")
            .select("*")
            .eq("id", id)
            .single();
        if (error?.code === "PGRST116")
            return null;
        if (error)
            throw error;
        return rowToWorkspace(data);
    }
    async save(workspace) {
        const row = workspaceToRow(workspace);
        const { error } = await this.supabase.from("workspaces").upsert(row);
        if (error)
            throw error;
    }
}
//# sourceMappingURL=workspace.js.map