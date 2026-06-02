import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExecutionSessionRepository } from "@kancode/application";
import type { ExecutionSession } from "@kancode/domain";
import { executionSessionToRow, rowToExecutionSession } from "../mappers/execution-session.js";

export class SupabaseExecutionSessionRepository implements ExecutionSessionRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getById(id: string): Promise<ExecutionSession | null> {
    const { data, error } = await this.supabase
      .from("execution_sessions")
      .select("*")
      .eq("id", id)
      .single();

    if (error?.code === "PGRST116") return null;
    if (error) throw error;
    return rowToExecutionSession(data);
  }

  async save(session: ExecutionSession): Promise<void> {
    const row = executionSessionToRow(session);
    const { error } = await this.supabase.from("execution_sessions").upsert(row);
    if (error) throw error;
  }
}
