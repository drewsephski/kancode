import type { SupabaseClient } from "@supabase/supabase-js";
import type { DomainEvent } from "@kancode/domain";
import type { DeadLetterEntry, DeadLetterQueue } from "@kancode/application";
import { deadLetterToRow, rowToDeadLetterEntry } from "../mappers/dead-letter-queue.js";

export class SupabaseDeadLetterQueue implements DeadLetterQueue {
  constructor(private readonly supabase: SupabaseClient) {}

  async enqueue(
    outboxId: string,
    event: DomainEvent,
    error: Error,
    retryCount: number,
  ): Promise<void> {
    const row = deadLetterToRow(
      `dlq-${outboxId}`,
      outboxId,
      event,
      error.message,
      retryCount,
    );
    const { error: dbError } = await this.supabase.from("dead_letter_queue").insert(row);
    if (dbError) throw dbError;
  }

  async getAll(): Promise<DeadLetterEntry[]> {
    const { data, error } = await this.supabase
      .from("dead_letter_queue")
      .select("*")
      .order("failed_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(rowToDeadLetterEntry);
  }
}
