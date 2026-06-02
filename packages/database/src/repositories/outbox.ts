import type { SupabaseClient } from "@supabase/supabase-js";
import type { DomainEvent } from "@kancode/domain";
import type { OutboxRepository, OutboxRecord } from "@kancode/application";
import { outboxRow, rowToOutboxRecord } from "../mappers/event.js";

export class SupabaseOutboxRepository implements OutboxRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async enqueue(records: OutboxRecord[]): Promise<void> {
    if (records.length === 0) return;

    const rows = records.map((r) => outboxRow(r.event, r.id, r.workspaceId));
    const { error } = await this.supabase.from("outbox").insert(rows);
    if (error) throw error;
  }

  async getPending(): Promise<OutboxRecord[]> {
    const { data, error } = await this.supabase
      .from("outbox")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data ?? []).map(rowToOutboxRecord);
  }

  async markDispatched(ids: string[]): Promise<void> {
    if (ids.length === 0) return;

    const { error } = await this.supabase
      .from("outbox")
      .update({ status: "dispatched" })
      .in("id", ids);

    if (error) throw error;
  }
}
