import type { WorkflowRunProcess } from "@kancode/application";
export interface WorkflowRunProcessRow {
    id: string;
    workflow_run_id: string;
    workspace_id: string;
    state: string;
    revision: number;
    created_at: string;
    updated_at: string;
}
export declare function processToRow(domain: WorkflowRunProcess): WorkflowRunProcessRow;
export declare function rowToProcess(row: WorkflowRunProcessRow): WorkflowRunProcess;
//# sourceMappingURL=workflow-run-process.d.ts.map