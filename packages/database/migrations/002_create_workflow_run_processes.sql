-- 002_create_workflow_run_processes.sql
-- Durable saga state for workflow run orchestration

CREATE TABLE IF NOT EXISTS workflow_run_processes (
  id TEXT PRIMARY KEY,
  workflow_run_id TEXT NOT NULL REFERENCES workflow_runs(id),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  state TEXT NOT NULL DEFAULT 'pending',
  revision INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wrp_workflow_run_id ON workflow_run_processes(workflow_run_id);
CREATE INDEX idx_wrp_state ON workflow_run_processes(state);
