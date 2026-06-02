import { WorkflowRun } from "@kancode/domain";
export function workflowRunToRow(domain) {
    return {
        id: domain.id,
        workspace_id: domain.workspaceId,
        workflow_id: domain.workflowId,
        request_id: domain.requestId,
        status: domain.status,
        version: domain.version,
    };
}
export function rowToWorkflowRun(row) {
    return WorkflowRun.fromState({
        id: row.id,
        workspaceId: row.workspace_id,
        workflowId: row.workflow_id,
        requestId: row.request_id,
        status: row.status,
        version: row.version,
    });
}
//# sourceMappingURL=workflow-run.js.map