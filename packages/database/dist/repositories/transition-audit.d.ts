import type { SupabaseClient } from "@supabase/supabase-js";
import type { TransitionAuditEntry, TransitionAuditLog } from "@kancode/application";
export declare class SupabaseTransitionAuditLog implements TransitionAuditLog {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    record(entry: TransitionAuditEntry): Promise<void>;
    getByProcessId(processId: string): Promise<TransitionAuditEntry[]>;
}
//# sourceMappingURL=transition-audit.d.ts.map