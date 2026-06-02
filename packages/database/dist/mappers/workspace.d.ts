import { Workspace } from "@kancode/domain";
export interface WorkspaceRow {
    id: string;
    name: string;
    slug: string;
    status: string;
    version: number;
}
export declare function workspaceToRow(domain: Workspace): WorkspaceRow;
export declare function rowToWorkspace(row: WorkspaceRow): Workspace;
//# sourceMappingURL=workspace.d.ts.map