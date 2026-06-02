import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkspaceRepository } from "@kancode/application";
import type { Workspace } from "@kancode/domain";
import { workspaceToRow, rowToWorkspace } from "../mappers/workspace.js";

export class SupabaseWorkspaceRepository implements WorkspaceRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getById(id: string): Promise<Workspace | null> {
    const { data, error } = await this.supabase
      .from("workspaces")
      .select("*")
      .eq("id", id)
      .single();

    if (error?.code === "PGRST116") return null;
    if (error) throw error;
    return rowToWorkspace(data);
  }

  async save(workspace: Workspace): Promise<void> {
    const row = workspaceToRow(workspace);
    const { error } = await this.supabase.from("workspaces").upsert(row);
    if (error) throw error;
  }
}
