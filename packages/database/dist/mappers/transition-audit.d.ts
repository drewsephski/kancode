import type { TransitionAuditEntry } from "@kancode/application";
export interface TransitionAuditRow {
    id?: number;
    process_id: string;
    from_state: string;
    to_state: string;
    event_type: string;
    revision: number;
    occurred_at: string;
}
export declare function auditEntryToRow(entry: TransitionAuditEntry): TransitionAuditRow;
export declare function rowToAuditEntry(row: TransitionAuditRow): TransitionAuditEntry;
//# sourceMappingURL=transition-audit.d.ts.map