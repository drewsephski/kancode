import type { SupabaseClient } from "@supabase/supabase-js";
import type { RequestRepository } from "@kancode/application";
import type { Request } from "@kancode/domain";
export declare class SupabaseRequestRepository implements RequestRepository {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    getById(id: string): Promise<Request | null>;
    save(request: Request): Promise<void>;
}
//# sourceMappingURL=request.d.ts.map