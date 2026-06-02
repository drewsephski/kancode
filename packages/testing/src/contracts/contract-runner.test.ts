import test from "node:test";
import {
  FakeRequestRepository,
  FakeWorkspaceRepository,
  FakeWorkflowRepository,
  FakeWorkflowRunRepository,
  FakeTaskRepository,
  FakeAssignmentRepository,
  FakeExecutionSessionRepository,
  FakeDomainEventStore,
  FakeOutboxRepository,
  FakeIdempotencyStore,
  FakeWorkflowRunProcessRepository,
} from "../index.js";
import {
  requestRepositoryTests,
  workspaceRepositoryTests,
  workflowRepositoryTests,
  workflowRunRepositoryTests,
  taskRepositoryTests,
  assignmentRepositoryTests,
  executionSessionRepositoryTests,
  eventStoreContracts,
  outboxRepositoryContracts,
  idempotencyStoreContracts,
  workflowRunProcessRepositoryContracts,
} from "./index.js";

// ── Repository contracts (7 repos × 3 scenarios = 21) ───────────────────

test("FakeRequestRepository", async (t) => {
  const tests = requestRepositoryTests(() => new FakeRequestRepository());
  for (const [name, fn] of Object.entries(tests)) {
    await t.test(name, fn);
  }
});

test("FakeWorkspaceRepository", async (t) => {
  const tests = workspaceRepositoryTests(() => new FakeWorkspaceRepository());
  for (const [name, fn] of Object.entries(tests)) {
    await t.test(name, fn);
  }
});

test("FakeWorkflowRepository", async (t) => {
  const tests = workflowRepositoryTests(() => new FakeWorkflowRepository());
  for (const [name, fn] of Object.entries(tests)) {
    await t.test(name, fn);
  }
});

test("FakeWorkflowRunRepository", async (t) => {
  const tests = workflowRunRepositoryTests(() => new FakeWorkflowRunRepository());
  for (const [name, fn] of Object.entries(tests)) {
    await t.test(name, fn);
  }
});

test("FakeTaskRepository", async (t) => {
  const tests = taskRepositoryTests(() => new FakeTaskRepository());
  for (const [name, fn] of Object.entries(tests)) {
    await t.test(name, fn);
  }
});

test("FakeAssignmentRepository", async (t) => {
  const tests = assignmentRepositoryTests(() => new FakeAssignmentRepository());
  for (const [name, fn] of Object.entries(tests)) {
    await t.test(name, fn);
  }
});

test("FakeExecutionSessionRepository", async (t) => {
  const tests = executionSessionRepositoryTests(() => new FakeExecutionSessionRepository());
  for (const [name, fn] of Object.entries(tests)) {
    await t.test(name, fn);
  }
});

// ── Infrastructure contracts ────────────────────────────────────────────

test("FakeDomainEventStore", async (t) => {
  const tests = eventStoreContracts(() => new FakeDomainEventStore());
  for (const [name, fn] of Object.entries(tests)) {
    await t.test(name, fn);
  }
});

test("FakeOutboxRepository", async (t) => {
  const tests = outboxRepositoryContracts(() => new FakeOutboxRepository());
  for (const [name, fn] of Object.entries(tests)) {
    await t.test(name, fn);
  }
});

test("FakeIdempotencyStore", async (t) => {
  const tests = idempotencyStoreContracts(() => new FakeIdempotencyStore());
  for (const [name, fn] of Object.entries(tests)) {
    await t.test(name, fn);
  }
});

test("FakeWorkflowRunProcessRepository", async (t) => {
  const tests = workflowRunProcessRepositoryContracts(() => new FakeWorkflowRunProcessRepository());
  for (const [name, fn] of Object.entries(tests)) {
    await t.test(name, fn);
  }
});
