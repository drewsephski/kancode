import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkflowRunProcess, WorkflowRunProcessRepository } from "@kancode/application";
import { processToRow, rowToProcess } from "../mappers/workflow-run-process.js";

export class SupabaseWorkflowRunProcessRepository implements WorkflowRunProcessRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async save(process: WorkflowRunProcess): Promise<void> {
    const row = processToRow(process);
    const { error } = await this.supabase.from("workflow_run_processes").upsert(row);
    if (error) throw error;
  }

  async getById(id: string): Promise<WorkflowRunProcess | null> {
    const { data, error } = await this.supabase
      .from("workflow_run_processes")
      .select("*")
      .eq("id", id)
      .single();

    if (error?.code === "PGRST116") return null;
    if (error) throw error;
    return rowToProcess(data);
  }

  async getByWorkflowRunId(workflowRunId: string): Promise<WorkflowRunProcess | null> {
    const { data, error } = await this.supabase
      .from("workflow_run_processes")
      .select("*")
      .eq("workflow_run_id", workflowRunId)
      .single();

    if (error?.code === "PGRST116") return null;
    if (error) throw error;
    return rowToProcess(data);
  }
}
