import { Request } from "@kancode/domain";

export interface RequestRow {
  id: string;
  workspace_id: string;
  request_text: string;
  status: string;
  version: number;
}

export function requestToRow(domain: Request): RequestRow {
  return {
    id: domain.id,
    workspace_id: domain.workspaceId,
    request_text: domain.requestText,
    status: domain.status,
    version: domain.version,
  };
}

export function rowToRequest(row: RequestRow): Request {
  return Request.fromState({
    id: row.id,
    workspaceId: row.workspace_id,
    requestText: row.request_text,
    status: row.status as Request["status"],
    version: row.version,
  });
}
