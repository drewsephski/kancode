import type { DeadLetterEntry } from "@kancode/application";
import type { DomainEvent } from "@kancode/domain";
export interface DeadLetterRow {
    id: string;
    outbox_id: string;
    event_type: string;
    event_payload: Record<string, unknown>;
    error: string;
    retry_count: number;
    failed_at: string;
}
export declare function deadLetterToRow(id: string, outboxId: string, event: DomainEvent, error: string, retryCount: number): DeadLetterRow;
export declare function rowToDeadLetterEntry(row: DeadLetterRow): DeadLetterEntry;
//# sourceMappingURL=dead-letter-queue.d.ts.map