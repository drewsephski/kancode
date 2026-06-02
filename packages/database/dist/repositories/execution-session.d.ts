import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExecutionSessionRepository } from "@kancode/application";
import type { ExecutionSession } from "@kancode/domain";
export declare class SupabaseExecutionSessionRepository implements ExecutionSessionRepository {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    getById(id: string): Promise<ExecutionSession | null>;
    save(session: ExecutionSession): Promise<void>;
}
//# sourceMappingURL=execution-session.d.ts.map