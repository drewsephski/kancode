import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkflowRunRepository } from "@kancode/application";
import type { WorkflowRun } from "@kancode/domain";
import { workflowRunToRow, rowToWorkflowRun } from "../mappers/workflow-run.js";

export class SupabaseWorkflowRunRepository implements WorkflowRunRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getById(id: string): Promise<WorkflowRun | null> {
    const { data, error } = await this.supabase
      .from("workflow_runs")
      .select("*")
      .eq("id", id)
      .single();

    if (error?.code === "PGRST116") return null;
    if (error) throw error;
    return rowToWorkflowRun(data);
  }

  async save(run: WorkflowRun): Promise<void> {
    const row = workflowRunToRow(run);
    const { error } = await this.supabase.from("workflow_runs").upsert(row);
    if (error) throw error;
  }
}
