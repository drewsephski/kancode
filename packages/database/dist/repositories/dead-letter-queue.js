import { deadLetterToRow, rowToDeadLetterEntry } from "../mappers/dead-letter-queue.js";
export class SupabaseDeadLetterQueue {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async enqueue(outboxId, event, error, retryCount) {
        const row = deadLetterToRow(`dlq-${outboxId}`, outboxId, event, error.message, retryCount);
        const { error: dbError } = await this.supabase.from("dead_letter_queue").insert(row);
        if (dbError)
            throw dbError;
    }
    async getAll() {
        const { data, error } = await this.supabase
            .from("dead_letter_queue")
            .select("*")
            .order("failed_at", { ascending: false });
        if (error)
            throw error;
        return (data ?? []).map(rowToDeadLetterEntry);
    }
}
//# sourceMappingURL=dead-letter-queue.js.map