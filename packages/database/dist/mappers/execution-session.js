import { ExecutionSession } from "@kancode/domain";
export function executionSessionToRow(domain) {
    return {
        id: domain.id,
        workspace_id: domain.workspaceId,
        assignment_id: domain.assignmentId,
        runtime_name: domain.runtimeName,
        status: domain.status,
        last_sequence_number: 0,
        version: domain.version,
    };
}
export function rowToExecutionSession(row) {
    return ExecutionSession.fromState({
        id: row.id,
        workspaceId: row.workspace_id,
        assignmentId: row.assignment_id,
        runtimeName: row.runtime_name,
        status: row.status,
        lastSequenceNumber: row.last_sequence_number,
        version: row.version,
    });
}
//# sourceMappingURL=execution-session.js.map