import assert from "node:assert/strict";

import type {
  AssignmentRepository,
  ExecutionSessionRepository,
  RequestRepository,
  TaskRepository,
  WorkflowRepository,
  WorkflowRunRepository,
  WorkspaceRepository,
} from "@kancode/application";
import {
  Assignment,
  ExecutionSession,
  Request,
  Task,
  Workflow,
  WorkflowRun,
  Workspace,
} from "@kancode/domain";

// ── RequestRepository ────────────────────────────────────────────────────

export function requestRepositoryTests(createRepo: () => RequestRepository) {
  const label = "RequestRepository";

  return {
    async "save and getById round-trip preserves all fields"() {
      const repo = createRepo();
      const request = Request.submit({ id: "req-1", workspaceId: "ws-1", requestText: "Build it" });
      await repo.save(request);
      const loaded = await repo.getById("req-1");
      assert.ok(loaded);
      assert.equal(loaded.id, "req-1");
      assert.equal(loaded.workspaceId, "ws-1");
      assert.equal(loaded.requestText, "Build it");
      assert.equal(loaded.status, "submitted");
      assert.equal(loaded.version, 1);
    },

    async "getById returns null for non-existent id"() {
      const repo = createRepo();
      const result = await repo.getById("nonexistent");
      assert.equal(result, null);
    },

    async "save updates existing aggregate"() {
      const repo = createRepo();
      const request = Request.submit({ id: "req-2", workspaceId: "ws-1", requestText: "Initial" });
      await repo.save(request);

      request.markReadyForPlanning();
      await repo.save(request);

      const loaded = await repo.getById("req-2");
      assert.ok(loaded);
      assert.equal(loaded.status, "ready_for_planning");
      assert.equal(loaded.version, 2);
    },
  };
}

// ── WorkspaceRepository ──────────────────────────────────────────────────

export function workspaceRepositoryTests(createRepo: () => WorkspaceRepository) {
  return {
    async "save and getById round-trip preserves all fields"() {
      const repo = createRepo();
      const workspace = Workspace.create({ id: "ws-1", name: "Acme", slug: "acme" });
      await repo.save(workspace);
      const loaded = await repo.getById("ws-1");
      assert.ok(loaded);
      assert.equal(loaded.id, "ws-1");
      assert.equal(loaded.name, "Acme");
      assert.equal(loaded.slug, "acme");
      assert.equal(loaded.status, "active");
    },

    async "getById returns null for non-existent id"() {
      const repo = createRepo();
      assert.equal(await repo.getById("nonexistent"), null);
    },

    async "save preserves state transitions"() {
      const repo = createRepo();
      const ws = Workspace.create({ id: "ws-2", name: "Test", slug: "test" });
      await repo.save(ws);

      ws.suspend("maintenance");
      await repo.save(ws);

      const loaded = await repo.getById("ws-2");
      assert.ok(loaded);
      assert.equal(loaded.status, "suspended");
    },
  };
}

// ── WorkflowRepository ───────────────────────────────────────────────────

export function workflowRepositoryTests(createRepo: () => WorkflowRepository) {
  return {
    async "save and getById round-trip preserves all fields"() {
      const repo = createRepo();
      const wf = Workflow.create({ id: "wf-1", workspaceId: "ws-1", requestId: "req-1", title: "Test workflow" });
      await repo.save(wf);
      const loaded = await repo.getById("wf-1");
      assert.ok(loaded);
      assert.equal(loaded.id, "wf-1");
      assert.equal(loaded.title, "Test workflow");
      assert.equal(loaded.status, "draft");
    },

    async "getById returns null for non-existent id"() {
      assert.equal(await createRepo().getById("nonexistent"), null);
    },

    async "save after plan preserves planned state"() {
      const repo = createRepo();
      const wf = Workflow.create({ id: "wf-2", workspaceId: "ws-1", requestId: "req-1", title: "Plan test" });
      await repo.save(wf);
      wf.plan();
      await repo.save(wf);
      const loaded = await repo.getById("wf-2");
      assert.ok(loaded);
      assert.equal(loaded.status, "planned");
      assert.equal(loaded.version, 2);
    },
  };
}

// ── WorkflowRunRepository ────────────────────────────────────────────────

export function workflowRunRepositoryTests(createRepo: () => WorkflowRunRepository) {
  return {
    async "save and getById round-trip preserves all fields"() {
      const repo = createRepo();
      const run = WorkflowRun.create({ id: "run-1", workspaceId: "ws-1", workflowId: "wf-1", requestId: "req-1" });
      await repo.save(run);
      const loaded = await repo.getById("run-1");
      assert.ok(loaded);
      assert.equal(loaded.id, "run-1");
      assert.equal(loaded.workflowId, "wf-1");
      assert.equal(loaded.requestId, "req-1");
      assert.equal(loaded.status, "queued");
    },

    async "getById returns null for non-existent id"() {
      assert.equal(await createRepo().getById("nonexistent"), null);
    },

    async "save after lifecycle transition"() {
      const repo = createRepo();
      const run = WorkflowRun.create({ id: "run-2", workspaceId: "ws-1", workflowId: "wf-1", requestId: "req-1" });
      await repo.save(run);
      run.start();
      await repo.save(run);
      const loaded = await repo.getById("run-2");
      assert.ok(loaded);
      assert.equal(loaded.status, "running");
      assert.equal(loaded.version, 2);
    },
  };
}

// ── TaskRepository ───────────────────────────────────────────────────────

export function taskRepositoryTests(createRepo: () => TaskRepository) {
  return {
    async "save and getById round-trip preserves all fields"() {
      const repo = createRepo();
      const task = Task.create({ id: "task-1", workspaceId: "ws-1", workflowRunId: "run-1", title: "Setup CI", orderIndex: 0 });
      await repo.save(task);
      const loaded = await repo.getById("task-1");
      assert.ok(loaded);
      assert.equal(loaded.title, "Setup CI");
      assert.equal(loaded.orderIndex, 0);
      assert.equal(loaded.status, "open");
    },

    async "getById returns null for non-existent id"() {
      assert.equal(await createRepo().getById("nonexistent"), null);
    },

    async "save after assign and start"() {
      const repo = createRepo();
      const task = Task.create({ id: "task-2", workspaceId: "ws-1", workflowRunId: "run-1", title: "Test", orderIndex: 0 });
      await repo.save(task);
      task.assign("assign-1");
      task.start();
      await repo.save(task);
      const loaded = await repo.getById("task-2");
      assert.ok(loaded);
      assert.equal(loaded.status, "in_progress");
      assert.equal(loaded.version, 3);
    },
  };
}

// ── AssignmentRepository ─────────────────────────────────────────────────

export function assignmentRepositoryTests(createRepo: () => AssignmentRepository) {
  return {
    async "save and getById round-trip preserves all fields"() {
      const repo = createRepo();
      const assignment = Assignment.create({ id: "assign-1", workspaceId: "ws-1", taskId: "task-1" });
      await repo.save(assignment);
      const loaded = await repo.getById("assign-1");
      assert.ok(loaded);
      assert.equal(loaded.taskId, "task-1");
      assert.equal(loaded.status, "pending");
    },

    async "getById returns null for non-existent id"() {
      assert.equal(await createRepo().getById("nonexistent"), null);
    },

    async "save through full lifecycle"() {
      const repo = createRepo();
      const a = Assignment.create({ id: "assign-2", workspaceId: "ws-1", taskId: "task-1" });
      await repo.save(a);
      a.accept();
      await repo.save(a);
      a.start("es-1");
      await repo.save(a);
      const loaded = await repo.getById("assign-2");
      assert.ok(loaded);
      assert.equal(loaded.status, "executing");
      assert.equal(loaded.executionSessionId, "es-1");
      assert.equal(loaded.version, 3);
    },
  };
}

// ── ExecutionSessionRepository ───────────────────────────────────────────

export function executionSessionRepositoryTests(createRepo: () => ExecutionSessionRepository) {
  return {
    async "save and getById round-trip preserves all fields"() {
      const repo = createRepo();
      const es = ExecutionSession.create({ id: "es-1", workspaceId: "ws-1", assignmentId: "assign-1", runtimeName: "Claude Code" });
      await repo.save(es);
      const loaded = await repo.getById("es-1");
      assert.ok(loaded);
      assert.equal(loaded.assignmentId, "assign-1");
      assert.equal(loaded.runtimeName, "Claude Code");
      assert.equal(loaded.status, "created");
    },

    async "getById returns null for non-existent id"() {
      assert.equal(await createRepo().getById("nonexistent"), null);
    },

    async "save after start and complete"() {
      const repo = createRepo();
      const es = ExecutionSession.create({ id: "es-2", workspaceId: "ws-1", assignmentId: "assign-1", runtimeName: "Claude Code" });
      await repo.save(es);
      es.start();
      await repo.save(es);
      es.complete("done");
      await repo.save(es);
      const loaded = await repo.getById("es-2");
      assert.ok(loaded);
      assert.equal(loaded.status, "completed");
      assert.equal(loaded.version, 3);
    },
  };
}
