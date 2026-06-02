import assert from "node:assert/strict";
import test from "node:test";

import { WorkflowRun } from "./workflow-run.js";
import { DomainError } from "../errors/domain-error.js";

test("workflow run lifecycle transitions", () => {
  const run = WorkflowRun.create({
    id: "workflow_run_1",
    workspaceId: "workspace_1",
    workflowId: "workflow_1",
    requestId: "request_1",
  });

  assert.equal(run.status, "queued");
  assert.equal(run.version, 1);

  run.start();
  assert.equal(run.status, "running");
  assert.equal(run.version, 2);

  run.complete();
  assert.equal(run.status, "completed");
  assert.equal(run.version, 3);

  assert.throws(
    () => run.cancel("already done"),
    (error) => error instanceof DomainError,
  );
});

test("workflow run cannot complete before it is running", () => {
  const run = WorkflowRun.create({
    id: "workflow_run_2",
    workspaceId: "workspace_1",
    workflowId: "workflow_1",
    requestId: "request_1",
  });

  assert.throws(
    () => run.complete(),
    (error) => error instanceof DomainError,
  );
});
