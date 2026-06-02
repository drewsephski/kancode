import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkflowRepository } from "@kancode/application";
import type { Workflow } from "@kancode/domain";
import { workflowToRow, rowToWorkflow } from "../mappers/workflow.js";

export class SupabaseWorkflowRepository implements WorkflowRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getById(id: string): Promise<Workflow | null> {
    const { data, error } = await this.supabase
      .from("workflows")
      .select("*")
      .eq("id", id)
      .single();

    if (error?.code === "PGRST116") return null;
    if (error) throw error;
    return rowToWorkflow(data);
  }

  async save(workflow: Workflow): Promise<void> {
    const row = workflowToRow(workflow);
    const { error } = await this.supabase.from("workflows").upsert(row);
    if (error) throw error;
  }
}
