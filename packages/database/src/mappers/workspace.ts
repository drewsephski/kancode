import { Workspace } from "@kancode/domain";

export interface WorkspaceRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  version: number;
}

export function workspaceToRow(domain: Workspace): WorkspaceRow {
  return {
    id: domain.id,
    name: domain.name,
    slug: domain.slug,
    status: domain.status,
    version: domain.version,
  };
}

export function rowToWorkspace(row: WorkspaceRow): Workspace {
  return Workspace.fromState({
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status as Workspace["status"],
    version: row.version,
  });
}
