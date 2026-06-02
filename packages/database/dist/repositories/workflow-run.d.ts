import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkflowRunRepository } from "@kancode/application";
import type { WorkflowRun } from "@kancode/domain";
export declare class SupabaseWorkflowRunRepository implements WorkflowRunRepository {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    getById(id: string): Promise<WorkflowRun | null>;
    save(run: WorkflowRun): Promise<void>;
}
//# sourceMappingURL=workflow-run.d.ts.map