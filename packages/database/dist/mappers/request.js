import { Request } from "@kancode/domain";
export function requestToRow(domain) {
    return {
        id: domain.id,
        workspace_id: domain.workspaceId,
        request_text: domain.requestText,
        status: domain.status,
        version: domain.version,
    };
}
export function rowToRequest(row) {
    return Request.fromState({
        id: row.id,
        workspaceId: row.workspace_id,
        requestText: row.request_text,
        status: row.status,
        version: row.version,
    });
}
//# sourceMappingURL=request.js.map