import { taskToRow, rowToTask } from "../mappers/task.js";
export class SupabaseTaskRepository {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async getById(id) {
        const { data, error } = await this.supabase
            .from("tasks")
            .select("*")
            .eq("id", id)
            .single();
        if (error?.code === "PGRST116")
            return null;
        if (error)
            throw error;
        return rowToTask(data);
    }
    async save(task) {
        const row = taskToRow(task);
        const { error } = await this.supabase.from("tasks").upsert(row);
        if (error)
            throw error;
    }
}
//# sourceMappingURL=task.js.map