import { ExecutionSession } from "@kancode/domain";
export interface ExecutionSessionRow {
    id: string;
    workspace_id: string;
    assignment_id: string;
    runtime_name: string;
    status: string;
    last_sequence_number: number;
    version: number;
}
export declare function executionSessionToRow(domain: ExecutionSession): ExecutionSessionRow;
export declare function rowToExecutionSession(row: ExecutionSessionRow): ExecutionSession;
//# sourceMappingURL=execution-session.d.ts.map