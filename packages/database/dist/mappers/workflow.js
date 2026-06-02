import { Workflow } from "@kancode/domain";
export function workflowToRow(domain) {
    return {
        id: domain.id,
        workspace_id: domain.workspaceId,
        request_id: domain.requestId,
        title: domain.title,
        status: domain.status,
        version: domain.version,
    };
}
export function rowToWorkflow(row) {
    return Workflow.fromState({
        id: row.id,
        workspaceId: row.workspace_id,
        requestId: row.request_id,
        title: row.title,
        status: row.status,
        version: row.version,
    });
}
//# sourceMappingURL=workflow.js.map