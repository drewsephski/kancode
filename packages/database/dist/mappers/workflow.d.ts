import { Workflow } from "@kancode/domain";
export interface WorkflowRow {
    id: string;
    workspace_id: string;
    request_id: string;
    title: string;
    status: string;
    version: number;
}
export declare function workflowToRow(domain: Workflow): WorkflowRow;
export declare function rowToWorkflow(row: WorkflowRow): Workflow;
//# sourceMappingURL=workflow.d.ts.map