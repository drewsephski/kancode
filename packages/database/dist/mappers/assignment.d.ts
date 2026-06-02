import { Assignment } from "@kancode/domain";
export interface AssignmentRow {
    id: string;
    workspace_id: string;
    task_id: string;
    status: string;
    execution_session_id: string | null;
    version: number;
}
export declare function assignmentToRow(domain: Assignment): AssignmentRow;
export declare function rowToAssignment(row: AssignmentRow): Assignment;
//# sourceMappingURL=assignment.d.ts.map