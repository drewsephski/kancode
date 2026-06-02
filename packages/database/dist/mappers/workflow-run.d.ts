import { WorkflowRun } from "@kancode/domain";
export interface WorkflowRunRow {
    id: string;
    workspace_id: string;
    workflow_id: string;
    request_id: string;
    status: string;
    version: number;
}
export declare function workflowRunToRow(domain: WorkflowRun): WorkflowRunRow;
export declare function rowToWorkflowRun(row: WorkflowRunRow): WorkflowRun;
//# sourceMappingURL=workflow-run.d.ts.map