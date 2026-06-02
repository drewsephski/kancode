import { assignmentToRow, rowToAssignment } from "../mappers/assignment.js";
export class SupabaseAssignmentRepository {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async getById(id) {
        const { data, error } = await this.supabase
            .from("assignments")
            .select("*")
            .eq("id", id)
            .single();
        if (error?.code === "PGRST116")
            return null;
        if (error)
            throw error;
        return rowToAssignment(data);
    }
    async save(assignment) {
        const row = assignmentToRow(assignment);
        const { error } = await this.supabase.from("assignments").upsert(row);
        if (error)
            throw error;
    }
}
//# sourceMappingURL=assignment.js.map