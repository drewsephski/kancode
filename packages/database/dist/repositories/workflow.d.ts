import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkflowRepository } from "@kancode/application";
import type { Workflow } from "@kancode/domain";
export declare class SupabaseWorkflowRepository implements WorkflowRepository {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    getById(id: string): Promise<Workflow | null>;
    save(workflow: Workflow): Promise<void>;
}
//# sourceMappingURL=workflow.d.ts.map