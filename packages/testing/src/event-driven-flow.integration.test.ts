import assert from "node:assert/strict";
import test from "node:test";

import type { UnitOfWork, DomainEventStore, OutboxRepository } from "@kancode/application";
import type { SubscriberRegistry, EventDispatcher } from "@kancode/events";
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
  FakeDomainEventStore,
  FakeOutboxRepository,
  InMemorySubscriberRegistry,
} from "@kancode/testing";
import {
  SubmitRequestHandler,
  PlanWorkflowRunHandler,
  OutboxBackedEventPublisher,
} from "@kancode/application";
import { DefaultWorkflowPlanner } from "@kancode/orchestration";
import { OutboxDispatcher } from "@kancode/infrastructure";

test("event-driven flow: request.submitted triggers workflow planning via outbox", async () => {
  // ── Setup ──────────────────────────────────────────────────────────────
  const idGenerator = new FakeIdGenerator();
  const clock = new FakeClock();
  const workspaceRepo = new FakeWorkspaceRepository();
  const requestRepo = new FakeRequestRepository();
  const workflowRepo = new FakeWorkflowRepository();
  const workflowRunRepo = new FakeWorkflowRunRepository();
  const taskRepo = new FakeTaskRepository();
  const assignmentRepo = new FakeAssignmentRepository();
  const executionSessionRepo = new FakeExecutionSessionRepository();
  const eventStore: DomainEventStore = new FakeDomainEventStore();
  const outboxRepo: OutboxRepository = new FakeOutboxRepository();
  const registry: SubscriberRegistry = new InMemorySubscriberRegistry();

  const unitOfWork: UnitOfWork = { run: <T>(fn: () => Promise<T>) => fn() };
  const planner = new DefaultWorkflowPlanner(idGenerator);

  // Event publisher that writes to event store + outbox
  const eventPublisher = new OutboxBackedEventPublisher(
    eventStore,
    outboxRepo,
    idGenerator,
    "workspace-1",
  );

  // Handlers
  const submitHandler = new SubmitRequestHandler(
    workspaceRepo, requestRepo, unitOfWork, idGenerator, clock, eventPublisher,
  );
  const planHandler = new PlanWorkflowRunHandler(
    requestRepo, workflowRepo, workflowRunRepo, taskRepo, unitOfWork, planner, eventPublisher,
  );

  // Register the subscriber: request.submitted → PlanWorkflowRunHandler
  registry.register("request.submitted", async (event) => {
    const payload = event.payload as { id: string };
    await planHandler.handle(
      { type: "workflow.plan", payload: { requestId: payload.id } },
      {
        workspaceId: "workspace-1",
        actorId: "system",
        correlationId: `evt-${event.type}-${event.version}`,
        idempotencyKey: `evt-${event.type}-${payload.id}`,
      },
    );
  });

  // Dispatcher
  const dispatcher: EventDispatcher = new OutboxDispatcher(outboxRepo, registry);

  // ── Execute SubmitRequest ──────────────────────────────────────────────
  const { requestId } = await submitHandler.handle(
    { type: "request.submit", payload: { requestText: "Event-driven workflow" } },
    {
      workspaceId: "workspace-1",
      actorId: "user-1",
      correlationId: "corr-1",
      idempotencyKey: "submit-1",
    },
  );

  // Verify: request is submitted, but no workflow yet
  const request = await requestRepo.getById(requestId);
  assert.equal(request?.status, "submitted");
  assert.equal(request?.version, 1);

  // Outbox should have the workspace.created and request.submitted events
  const pendingAfterSubmit = await outboxRepo.getPending();
  assert.equal(pendingAfterSubmit.length, 2);

  // ── Dispatch outbox ────────────────────────────────────────────────────
  // First dispatch: handles workspace.created and request.submitted
  await dispatcher.dispatchPending();

  // Second dispatch: drains events emitted by the subscriber's handler
  await dispatcher.dispatchPending();

  // ── Verify: workflow was created by the subscriber ─────────────────────
  const workflows = [...workflowRepo.store.values()];
  assert.equal(workflows.length, 1, "workflow should be created by subscriber");
  assert.equal(workflows[0]!.status, "planned");

  const workflowRun = [...workflowRunRepo.store.values()];
  assert.equal(workflowRun.length, 1, "workflow run should be created");
  assert.equal(workflowRun[0]!.status, "running");

  const tasks = [...taskRepo.store.values()];
  assert.equal(tasks.length, 1, "task should be created");
  assert.equal(tasks[0]!.status, "open");

  // Request should be updated to planned (submit=1, ready_for_planning=2, planned=3)
  const updatedRequest = await requestRepo.getById(requestId);
  assert.equal(updatedRequest?.status, "planned");
  assert.equal(updatedRequest?.version, 3);

  // ── Outbox after dispatch ──────────────────────────────────────────────
  const remainingPending = await outboxRepo.getPending();
  assert.equal(remainingPending.length, 0, "all outbox entries should be dispatched");

  // ── Event store ────────────────────────────────────────────────────────
  const allEvents = await eventStore.getAll();
  assert.equal(allEvents.length, 9, "should have 9 events across both handler calls");
});

test("dispatcher with no pending entries is a no-op", async () => {
  const outboxRepo = new FakeOutboxRepository();
  const registry = new InMemorySubscriberRegistry();
  const dispatcher = new OutboxDispatcher(outboxRepo, registry);

  await dispatcher.dispatchPending();
  // No error expected
});

test("dispatcher routes events to the correct subscriber", async () => {
  const outboxRepo = new FakeOutboxRepository();
  const registry = new InMemorySubscriberRegistry();

  const handled: string[] = [];
  registry.register("event.alpha", async (e) => { handled.push(`alpha:${e.type}`); });
  registry.register("event.beta", async (e) => { handled.push(`beta:${e.type}`); });

  await outboxRepo.enqueue([
    {
      id: "o-1", workspaceId: "ws-1",
      event: { type: "event.alpha", occurredAt: new Date(), payload: {}, version: 1 },
      status: "pending",
    },
    {
      id: "o-2", workspaceId: "ws-1",
      event: { type: "event.beta", occurredAt: new Date(), payload: {}, version: 1 },
      status: "pending",
    },
  ]);

  const dispatcher = new OutboxDispatcher(outboxRepo, registry);
  await dispatcher.dispatchPending();

  assert.deepEqual(handled, ["alpha:event.alpha", "beta:event.beta"]);
  assert.equal((await outboxRepo.getPending()).length, 0);
});
