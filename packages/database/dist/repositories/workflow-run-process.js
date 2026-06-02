import { processToRow, rowToProcess } from "../mappers/workflow-run-process.js";
export class SupabaseWorkflowRunProcessRepository {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async save(process) {
        const row = processToRow(process);
        const { error } = await this.supabase.from("workflow_run_processes").upsert(row);
        if (error)
            throw error;
    }
    async getById(id) {
        const { data, error } = await this.supabase
            .from("workflow_run_processes")
            .select("*")
            .eq("id", id)
            .single();
        if (error?.code === "PGRST116")
            return null;
        if (error)
            throw error;
        return rowToProcess(data);
    }
    async getByWorkflowRunId(workflowRunId) {
        const { data, error } = await this.supabase
            .from("workflow_run_processes")
            .select("*")
            .eq("workflow_run_id", workflowRunId)
            .single();
        if (error?.code === "PGRST116")
            return null;
        if (error)
            throw error;
        return rowToProcess(data);
    }
}
//# sourceMappingURL=workflow-run-process.js.map