import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkflowRunProcess, WorkflowRunProcessRepository } from "@kancode/application";
export declare class SupabaseWorkflowRunProcessRepository implements WorkflowRunProcessRepository {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    save(process: WorkflowRunProcess): Promise<void>;
    getById(id: string): Promise<WorkflowRunProcess | null>;
    getByWorkflowRunId(workflowRunId: string): Promise<WorkflowRunProcess | null>;
}
//# sourceMappingURL=workflow-run-process.d.ts.map