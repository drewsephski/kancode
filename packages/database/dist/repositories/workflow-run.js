import { workflowRunToRow, rowToWorkflowRun } from "../mappers/workflow-run.js";
export class SupabaseWorkflowRunRepository {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async getById(id) {
        const { data, error } = await this.supabase
            .from("workflow_runs")
            .select("*")
            .eq("id", id)
            .single();
        if (error?.code === "PGRST116")
            return null;
        if (error)
            throw error;
        return rowToWorkflowRun(data);
    }
    async save(run) {
        const row = workflowRunToRow(run);
        const { error } = await this.supabase.from("workflow_runs").upsert(row);
        if (error)
            throw error;
    }
}
//# sourceMappingURL=workflow-run.js.map