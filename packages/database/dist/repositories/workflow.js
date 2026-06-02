import { workflowToRow, rowToWorkflow } from "../mappers/workflow.js";
export class SupabaseWorkflowRepository {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async getById(id) {
        const { data, error } = await this.supabase
            .from("workflows")
            .select("*")
            .eq("id", id)
            .single();
        if (error?.code === "PGRST116")
            return null;
        if (error)
            throw error;
        return rowToWorkflow(data);
    }
    async save(workflow) {
        const row = workflowToRow(workflow);
        const { error } = await this.supabase.from("workflows").upsert(row);
        if (error)
            throw error;
    }
}
//# sourceMappingURL=workflow.js.map