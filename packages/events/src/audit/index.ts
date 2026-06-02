export interface AuditRecord {
  id: string;
  actorId: string;
  workspaceId: string;
  action: string;
  occurredAt: string;
}
