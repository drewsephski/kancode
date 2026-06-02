import type { SupabaseClient } from "@supabase/supabase-js";
import type { TaskRepository } from "@kancode/application";
import type { Task } from "@kancode/domain";
export declare class SupabaseTaskRepository implements TaskRepository {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    getById(id: string): Promise<Task | null>;
    save(task: Task): Promise<void>;
}
//# sourceMappingURL=task.d.ts.map