export function processToRow(domain) {
    return {
        id: domain.id,
        workflow_run_id: domain.workflowRunId,
        workspace_id: domain.workspaceId,
        state: domain.state,
        revision: domain.revision,
        created_at: domain.createdAt.toISOString(),
        updated_at: domain.updatedAt.toISOString(),
    };
}
export function rowToProcess(row) {
    return {
        id: row.id,
        workflowRunId: row.workflow_run_id,
        workspaceId: row.workspace_id,
        state: row.state,
        revision: row.revision,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
    };
}
//# sourceMappingURL=workflow-run-process.js.map