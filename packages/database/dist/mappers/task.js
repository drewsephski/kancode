import { Task } from "@kancode/domain";
export function taskToRow(domain) {
    return {
        id: domain.id,
        workspace_id: domain.workspaceId,
        workflow_run_id: domain.workflowRunId,
        title: domain.title,
        description: domain.description ?? null,
        order_index: domain.orderIndex,
        status: domain.status,
        version: domain.version,
    };
}
export function rowToTask(row) {
    return Task.fromState({
        id: row.id,
        workspaceId: row.workspace_id,
        workflowRunId: row.workflow_run_id,
        title: row.title,
        description: row.description ?? undefined,
        orderIndex: row.order_index,
        status: row.status,
        version: row.version,
    });
}
//# sourceMappingURL=task.js.map