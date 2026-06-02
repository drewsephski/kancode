import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkspaceRepository } from "@kancode/application";
import type { Workspace } from "@kancode/domain";
export declare class SupabaseWorkspaceRepository implements WorkspaceRepository {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    getById(id: string): Promise<Workspace | null>;
    save(workspace: Workspace): Promise<void>;
}
//# sourceMappingURL=workspace.d.ts.map