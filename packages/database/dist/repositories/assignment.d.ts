import type { SupabaseClient } from "@supabase/supabase-js";
import type { AssignmentRepository } from "@kancode/application";
import type { Assignment } from "@kancode/domain";
export declare class SupabaseAssignmentRepository implements AssignmentRepository {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    getById(id: string): Promise<Assignment | null>;
    save(assignment: Assignment): Promise<void>;
}
//# sourceMappingURL=assignment.d.ts.map