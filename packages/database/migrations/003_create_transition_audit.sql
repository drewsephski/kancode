-- 003_create_transition_audit.sql
-- Durable audit trail for workflow run process state transitions

CREATE TABLE IF NOT EXISTS transition_audit (
  id BIGSERIAL PRIMARY KEY,
  process_id TEXT NOT NULL,
  from_state TEXT NOT NULL,
  to_state TEXT NOT NULL,
  event_type TEXT NOT NULL,
  revision INTEGER NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transition_audit_process_id ON transition_audit(process_id);
CREATE INDEX idx_transition_audit_occurred_at ON transition_audit(occurred_at);
