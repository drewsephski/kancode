export interface TransitionAuditEntry {
  processId: string;
  fromState: string;
  toState: string;
  eventType: string;
  revision: number;
  occurredAt: Date;
}

export interface TransitionAuditLog {
  record(entry: TransitionAuditEntry): Promise<void>;
  getByProcessId(processId: string): Promise<TransitionAuditEntry[]>;
}
