import type { SupabaseClient } from "@supabase/supabase-js";
import type { TaskRepository } from "@kancode/application";
import type { Task } from "@kancode/domain";
import { taskToRow, rowToTask } from "../mappers/task.js";

export class SupabaseTaskRepository implements TaskRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getById(id: string): Promise<Task | null> {
    const { data, error } = await this.supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single();

    if (error?.code === "PGRST116") return null;
    if (error) throw error;
    return rowToTask(data);
  }

  async save(task: Task): Promise<void> {
    const row = taskToRow(task);
    const { error } = await this.supabase.from("tasks").upsert(row);
    if (error) throw error;
  }
}
