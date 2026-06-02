import { Assignment } from "@kancode/domain";
export function assignmentToRow(domain) {
    return {
        id: domain.id,
        workspace_id: domain.workspaceId,
        task_id: domain.taskId,
        status: domain.status,
        execution_session_id: domain.executionSessionId,
        version: domain.version,
    };
}
export function rowToAssignment(row) {
    return Assignment.fromState({
        id: row.id,
        workspaceId: row.workspace_id,
        taskId: row.task_id,
        status: row.status,
        executionSessionId: row.execution_session_id,
        version: row.version,
    });
}
//# sourceMappingURL=assignment.js.map