export interface SessionIdentity {
  userId: string;
  workspaceId?: string;
}

export interface AuthAdapter {
  getSession(): Promise<SessionIdentity | null>;
}
