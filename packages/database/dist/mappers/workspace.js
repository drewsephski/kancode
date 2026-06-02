import { Workspace } from "@kancode/domain";
export function workspaceToRow(domain) {
    return {
        id: domain.id,
        name: domain.name,
        slug: domain.slug,
        status: domain.status,
        version: domain.version,
    };
}
export function rowToWorkspace(row) {
    return Workspace.fromState({
        id: row.id,
        name: row.name,
        slug: row.slug,
        status: row.status,
        version: row.version,
    });
}
//# sourceMappingURL=workspace.js.map