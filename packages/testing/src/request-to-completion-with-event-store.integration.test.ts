import assert from "node:assert/strict";
import test from "node:test";

import type { UnitOfWork } from "@kancode/application";
import {
  FakeClock,
  FakeIdGenerator,
  FakeRequestRepository,
  FakeWorkspaceRepository,
  FakeWorkflowRepository,
  FakeWorkflowRunRepository,
  FakeTaskRepository,
  FakeAssignmentRepository,
  FakeExecutionSessionRepository,
  FakeEventPublisher,
} from "@kancode/testing";
import {
  SubmitRequestHandler,
  PlanWorkflowRunHandler,
  AssignTaskHandler,
  CreateExecutionSessionHandler,
  CompleteExecutionSessionHandler,
  IdempotentHandler,
} from "@kancode/application";
import { DefaultWorkflowPlanner } from "@kancode/orchestration";

test("request to completion with event store and outbox", async () => {
  const idGenerator = new FakeIdGenerator();
  const clock = new FakeClock();
  const workspaceRepo = new FakeWorkspaceRepository();
  const requestRepo = new FakeRequestRepository();
  const workflowRepo = new FakeWorkflowRepository();
  const workflowRunRepo = new FakeWorkflowRunRepository();
  const taskRepo = new FakeTaskRepository();
  const assignmentRepo = new FakeAssignmentRepository();
  const executionSessionRepo = new FakeExecutionSessionRepository();
  const eventPublisher = new FakeEventPublisher();

  // In-memory event store
  const storedEvents: import("@kancode/domain").DomainEvent[] = [];
  const eventStore = {
    async append(events: import("@kancode/domain").DomainEvent[]) {
      storedEvents.push(...events);
    },
    async getByAggregateId(aggregateId: string) {
      return storedEvents.filter((e) => {
        const payload = e.payload as Record<string, unknown>;
        return (
          payload.workspaceId === aggregateId ||
          (e.type.includes("request") && payload.requestId === aggregateId) ||
          (e.type.includes("workflow_run") && payload.workflowRunId === aggregateId) ||
          (e.type.includes("task") && payload.taskId === aggregateId) ||
          (e.type.includes("assignment") && payload.assignmentId === aggregateId) ||
          (e.type.includes("execution_session") && payload.executionSessionId === aggregateId)
        );
      });
    },
    async getAll() {
      return [...storedEvents];
    },
  };

  // In-memory outbox
  const outboxRecords: Array<{
    id: string;
    workspaceId: string;
    event: import("@kancode/domain").DomainEvent;
    status: string;
  }> = [];
  const outboxRepo = {
    async enqueue(records: Array<{ id: string; workspaceId: string; event: import("@kancode/domain").DomainEvent; status: string }>) {
      outboxRecords.push(...records);
    },
    async getPending() {
      return outboxRecords.filter((r) => r.status === "pending");
    },
    async markDispatched(ids: string[]) {
      for (const record of outboxRecords) {
        if (ids.includes(record.id)) {
          record.status = "dispatched";
        }
      }
    },
  };

  // Outbox-backed event publisher replaces the simple FakeEventPublisher
  const outboxEventPublisher = {
    async publish(events: import("@kancode/domain").DomainEvent[]) {
      if (events.length === 0) return;
      await eventStore.append(events);
      const records = events.map((event, i) => ({
        id: `outbox-${idGenerator.next()}`,
        workspaceId: "workspace-1",
        event,
        status: "pending" as const,
      }));
      await outboxRepo.enqueue(records);
    },
  };

  const unitOfWork: UnitOfWork = { run: <T>(fn: () => Promise<T>) => fn() };
  const planner = new DefaultWorkflowPlanner(idGenerator);

  const submitHandler = new SubmitRequestHandler(
    workspaceRepo, requestRepo, unitOfWork, idGenerator, clock, outboxEventPublisher,
  );
  const planHandler = new PlanWorkflowRunHandler(
    requestRepo, workflowRepo, workflowRunRepo, taskRepo, unitOfWork, planner, outboxEventPublisher,
  );
  const assignHandler = new AssignTaskHandler(
    taskRepo, assignmentRepo, unitOfWork, idGenerator, outboxEventPublisher,
  );
  const createSessionHandler = new CreateExecutionSessionHandler(
    assignmentRepo, executionSessionRepo, unitOfWork, idGenerator, outboxEventPublisher,
  );
  const completeHandler = new CompleteExecutionSessionHandler(
    executionSessionRepo, assignmentRepo, taskRepo, workflowRunRepo, requestRepo, unitOfWork, outboxEventPublisher,
  );

  const context = {
    workspaceId: "workspace-1",
    actorId: "user-1",
    correlationId: "corr-1",
    idempotencyKey: "flow-1",
  };

  // ── Run the full flow ──────────────────────────────────────────────────
  const { requestId } = await submitHandler.handle(
    { type: "request.submit" as const, payload: { requestText: "Build Stripe subscriptions" } },
    context,
  );
  const { workflowRunId } = await planHandler.handle(
    { type: "workflow.plan" as const, payload: { requestId } },
    context,
  );
  const tasks = [...taskRepo.store.values()].filter((t) => t.workflowRunId === workflowRunId);
  const { assignmentId } = await assignHandler.handle(
    { type: "task.assign" as const, payload: { taskId: tasks[0]!.id } },
    context,
  );
  const { executionSessionId } = await createSessionHandler.handle(
    { type: "execution_session.create" as const, payload: { assignmentId, runtimeName: "Claude Code" } },
    context,
  );
  await completeHandler.handle(
    { type: "execution_session.complete" as const, payload: { executionSessionId, outputSummary: "All done" } },
    context,
  );

  // ── Assertions ─────────────────────────────────────────────────────────

  // 1. All 21 domain events persisted in the event store
  const allEvents = await eventStore.getAll();
  assert.equal(allEvents.length, 21, "event store should contain all 21 domain events");

  const eventTypes = allEvents.map((e) => e.type);
  const expectedTypes = [
    "workspace.created",
    "request.submitted",
    "request.ready_for_planning",
    "request.planned",
    "workflow.created",
    "workflow.planned",
    "workflow_run.created",
    "workflow_run.started",
    "task.created",
    "task.assigned",
    "task.started",
    "assignment.created",
    "assignment.accepted",
    "assignment.executing",
    "execution_session.created",
    "execution_session.started",
    "execution_session.completed",
    "assignment.completed",
    "task.completed",
    "workflow_run.completed",
    "request.completed",
  ];
  assert.deepEqual(eventTypes, expectedTypes);

  // 2. All 21 outbox entries created
  assert.equal(outboxRecords.length, 21, "outbox should contain all 21 events");

  // 3. Outbox entries match event store entries
  for (let i = 0; i < allEvents.length; i++) {
    assert.equal(outboxRecords[i]!.event.type, allEvents[i]!.type);
    assert.equal(outboxRecords[i]!.event.version, allEvents[i]!.version);
  }

  // 4. All aggregate versions preserved (same as the version test)
  const request = await requestRepo.getById(requestId);
  assert.equal(request!.version, 4);

  const workflowRun = await workflowRunRepo.getById(workflowRunId);
  assert.equal(workflowRun!.version, 3);

  const task = await taskRepo.getById(tasks[0]!.id);
  assert.equal(task!.version, 4);

  const assignment = await assignmentRepo.getById(assignmentId);
  assert.equal(assignment!.version, 4);

  const session = await executionSessionRepo.getById(executionSessionId);
  assert.equal(session!.version, 3);

  // 5. Event stream replay is consistent — re-reading from store gives same order
  const replayedEvents = await eventStore.getAll();
  assert.deepEqual(
    replayedEvents.map((e) => ({ type: e.type, version: e.version })),
    allEvents.map((e) => ({ type: e.type, version: e.version })),
  );

  // 6. Version monotonicity is preserved in the event store
  const versionByPrefix = new Map<string, number[]>();
  for (const event of allEvents) {
    const prefix = event.type.split(".")[0]!;
    if (!versionByPrefix.has(prefix)) {
      versionByPrefix.set(prefix, []);
    }
    versionByPrefix.get(prefix)!.push(event.version);
  }
  for (const [prefix, versions] of versionByPrefix) {
    for (let i = 1; i < versions.length; i++) {
      assert.ok(
        versions[i]! > versions[i - 1]!,
        `${prefix} versions should be strictly increasing: got ${versions.join(" -> ")}`,
      );
    }
  }

  // 7. Aggregate statuses are correct (final state)
  assert.equal(request!.status, "completed");
  assert.equal(workflowRun!.status, "completed");
  assert.equal(task!.status, "completed");
  assert.equal(assignment!.status, "completed");
  assert.equal(session!.status, "completed");
});
