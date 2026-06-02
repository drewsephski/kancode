import type { SupabaseClient } from "@supabase/supabase-js";
import type { AssignmentRepository } from "@kancode/application";
import type { Assignment } from "@kancode/domain";
import { assignmentToRow, rowToAssignment } from "../mappers/assignment.js";

export class SupabaseAssignmentRepository implements AssignmentRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getById(id: string): Promise<Assignment | null> {
    const { data, error } = await this.supabase
      .from("assignments")
      .select("*")
      .eq("id", id)
      .single();

    if (error?.code === "PGRST116") return null;
    if (error) throw error;
    return rowToAssignment(data);
  }

  async save(assignment: Assignment): Promise<void> {
    const row = assignmentToRow(assignment);
    const { error } = await this.supabase.from("assignments").upsert(row);
    if (error) throw error;
  }
}
