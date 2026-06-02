import type { SupabaseClient } from "@supabase/supabase-js";
import type { TransitionAuditEntry, TransitionAuditLog } from "@kancode/application";
import { auditEntryToRow, rowToAuditEntry } from "../mappers/transition-audit.js";

export class SupabaseTransitionAuditLog implements TransitionAuditLog {
  constructor(private readonly supabase: SupabaseClient) {}

  async record(entry: TransitionAuditEntry): Promise<void> {
    const row = auditEntryToRow(entry);
    const { error } = await this.supabase.from("transition_audit").insert(row);
    if (error) throw error;
  }

  async getByProcessId(processId: string): Promise<TransitionAuditEntry[]> {
    const { data, error } = await this.supabase
      .from("transition_audit")
      .select("*")
      .eq("process_id", processId)
      .order("revision", { ascending: true });

    if (error) throw error;
    return (data ?? []).map(rowToAuditEntry);
  }
}
