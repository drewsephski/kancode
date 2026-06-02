import assert from "node:assert/strict";
import test from "node:test";

import type { DomainEvent } from "@kancode/domain";
import type { UnitOfWork, DomainEventStore, OutboxRepository, CommandContext } from "@kancode/application";
import type { EventDispatcher } from "@kancode/events";
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
  FakeWorkflowRunProcessRepository,
  FakeTransitionAuditLog,
  FakeDeadLetterQueue,
  FakeMetricsRecorder,
  InMemorySubscriberRegistry,
} from "@kancode/testing";
import {
  SubmitRequestHandler,
  PlanWorkflowRunHandler,
  AssignTaskHandler,
  CreateExecutionSessionHandler,
  CompleteExecutionSessionHandler,
  OutboxBackedEventPublisher,
} from "@kancode/application";
import { DefaultWorkflowPlanner, WorkflowRunProcessManager } from "@kancode/orchestration";
import { TriggerDispatcher } from "@kancode/infrastructure";
import type { EventBridgePayload, SendEventFn } from "@kancode/infrastructure";
import { TriggerEventRouter } from "@kancode/infrastructure";

// ---------------------------------------------------------------------------
// Fake trigger sender — captures events sent by TriggerDispatcher so tests
// can inspect what was emitted and manually feed them through the router.
// ---------------------------------------------------------------------------
class FakeTriggerSender {
  readonly sent: EventBridgePayload[] = [];

  send: SendEventFn = async (payload: EventBridgePayload) => {
    this.sent.push(payload);
  };
}

// ---------------------------------------------------------------------------
// Helper: build the common set of fakes used across all trigger tests.
// ---------------------------------------------------------------------------
interface TestContext {
  idGenerator: FakeIdGenerator;
  clock: FakeClock;
  workspaceRepo: FakeWorkspaceRepository;
  requestRepo: FakeRequestRepository;
  workflowRepo: FakeWorkflowRepository;
  workflowRunRepo: FakeWorkflowRunRepository;
  taskRepo: FakeTaskRepository;
  assignmentRepo: FakeAssignmentRepository;
  executionSessionRepo: FakeExecutionSessionRepository;
  eventStore: DomainEventStore;
  outboxRepo: OutboxRepository;
  processRepo: FakeWorkflowRunProcessRepository;
  auditLog: FakeTransitionAuditLog;
  metrics: FakeMetricsRecorder;
  dlq: FakeDeadLetterQueue;
  eventPublisher: OutboxBackedEventPublisher;
  unitOfWork: UnitOfWork;
  submitHandler: SubmitRequestHandler;
  planHandler: PlanWorkflowRunHandler;
  assignHandler: AssignTaskHandler;
  createSessionHandler: CreateExecutionSessionHandler;
  completeHandler: CompleteExecutionSessionHandler;
  processManager: WorkflowRunProcessManager;
}

function buildTestContext(): TestContext {
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
  const processRepo = new FakeWorkflowRunProcessRepository();
  const auditLog = new FakeTransitionAuditLog();
  const metrics = new FakeMetricsRecorder();
  const dlq = new FakeDeadLetterQueue();

  const unitOfWork: UnitOfWork = { run: <T>(fn: () => Promise<T>) => fn() };
  const planner = new DefaultWorkflowPlanner(idGenerator);
  const eventPublisher = new OutboxBackedEventPublisher(
    eventStore, outboxRepo, idGenerator, "workspace-1",
  );

  const submitHandler = new SubmitRequestHandler(
    workspaceRepo, requestRepo, unitOfWork, idGenerator, clock, eventPublisher,
  );
  const planHandler = new PlanWorkflowRunHandler(
    requestRepo, workflowRepo, workflowRunRepo, taskRepo, unitOfWork, planner, eventPublisher,
  );
  const assignHandler = new AssignTaskHandler(
    taskRepo, assignmentRepo, unitOfWork, idGenerator, eventPublisher,
  );
  const createSessionHandler = new CreateExecutionSessionHandler(
    assignmentRepo, executionSessionRepo, unitOfWork, idGenerator, eventPublisher,
  );
  const completeHandler = new CompleteExecutionSessionHandler(
    executionSessionRepo, assignmentRepo, taskRepo, workflowRunRepo, requestRepo,
    unitOfWork, eventPublisher,
  );

  const processManager = new WorkflowRunProcessManager(
    processRepo, auditLog, metrics, idGenerator, clock,
    planHandler, assignHandler, createSessionHandler,
  );

  return {
    idGenerator, clock, workspaceRepo, requestRepo, workflowRepo, workflowRunRepo,
    taskRepo, assignmentRepo, executionSessionRepo, eventStore, outboxRepo,
    processRepo, auditLog, metrics, dlq, eventPublisher, unitOfWork,
    submitHandler, planHandler, assignHandler, createSessionHandler, completeHandler,
    processManager,
  };
}

// ---------------------------------------------------------------------------
// Helper: route captured events through the TriggerEventRouter.
//
// A stable processId is derived from the first event's payload (id field)
// so ALL events in the same batch are seen by the process manager as
// belonging to the same workflow run process.
// ---------------------------------------------------------------------------
let _routingProcessId: string | null = null;

async function routeCapturedEvents(
  payloads: EventBridgePayload[],
  router: TriggerEventRouter,
): Promise<void> {
  for (const p of payloads) {
    if (!_routingProcessId) {
      const pl = p.event.payload as Record<string, unknown>;
      _routingProcessId = `proc-${typeof pl.id === "string" ? pl.id : p.event.type}-${Date.now()}`;
    }
    const ctx: CommandContext = {
      workspaceId: p.metadata.workspaceId,
      actorId: "system",
      correlationId: _routingProcessId,
      idempotencyKey: `evt-${p.metadata.eventId}-${_routingProcessId}`,
    };
    await router.routeEvent(p.event, ctx);
  }
}

function resetRoutingProcessId(): void {
  _routingProcessId = null;
}

// ===========================================================================
// Test A — SubmitRequest → Outbox → Trigger Event → Router → ProcessManager
// ===========================================================================
test("Test A: full trigger flow from submit request through process manager", async () => {
  const ctx = buildTestContext();
  const fakeSender = new FakeTriggerSender();
  const router = new TriggerEventRouter(ctx.processManager);

  const dispatcher: EventDispatcher = new TriggerDispatcher(
    ctx.outboxRepo, ctx.dlq, ctx.idGenerator, ctx.clock,
    { sendEvent: fakeSender.send, maxRetries: 1 },
    ctx.metrics,
  );

  // Drain helper — dispatches pending outbox events and routes them
  async function cycle() {
    fakeSender.sent.length = 0;
    await dispatcher.dispatchPending();
    await routeCapturedEvents(fakeSender.sent, router);
  }

  // ── Step 1: Submit a request ─────────────────────────────────────────
  const { requestId } = await ctx.submitHandler.handle(
    { type: "request.submit", payload: { requestText: "Trigger integration test" } },
    { workspaceId: "workspace-1", actorId: "user-1", correlationId: "corr-a", idempotencyKey: "a1" },
  );

  const request = await ctx.requestRepo.getById(requestId);
  assert.equal(request?.status, "submitted");

  // ── Step 2: Dispatch + Route first batch ─────────────────────────────
  await cycle();

  // Verify events were sent to trigger
  const submittedPayload = fakeSender.sent.find((s) => s.eventType === "request.submitted");
  assert.ok(submittedPayload, "request.submitted event should be sent");

  // Verify metadata is preserved
  assert.equal(submittedPayload!.metadata.workspaceId, "workspace-1");
  assert.equal(submittedPayload!.metadata.aggregateType, "request");
  assert.ok(submittedPayload!.metadata.eventId.length > 0, "eventId should be present");
  assert.equal(submittedPayload!.metadata.version, 1, "event version should be 1");

  // ── Step 3: Continue cycling until outbox is drained ─────────────────
  for (let i = 0; i < 10; i++) {
    const pending = await ctx.outboxRepo.getPending();
    if (pending.length === 0) break;
    await cycle();
  }

  // ── Step 4: Verify workflow and workflow run were created ────────────
  const workflows = [...ctx.workflowRepo.store.values()];
  assert.equal(workflows.length, 1, "workflow should be created");
  assert.equal(workflows[0]!.status, "planned");

  const workflowRuns = [...ctx.workflowRunRepo.store.values()];
  assert.equal(workflowRuns.length, 1, "workflow run should be created");
  assert.equal(workflowRuns[0]!.status, "running");

  const tasks = [...ctx.taskRepo.store.values()];
  assert.equal(tasks.length, 1, "task should be created");
  // Task status depends on how far the state machine progressed:
  // "open" if just created, "in_progress" if assignment already happened
  assert.ok(
    tasks[0]!.status === "open" || tasks[0]!.status === "in_progress",
    `expected task status to be "open" or "in_progress", got "${tasks[0]!.status}"`,
  );
});

// ===========================================================================
// Test B — Task Created → Trigger Event → Router → AssignTaskHandler
// ===========================================================================
test("Test B: task.created event triggers assignment via process manager", async () => {
  const ctx = buildTestContext();
  const fakeSender = new FakeTriggerSender();
  const router = new TriggerEventRouter(ctx.processManager);

  const dispatcher: EventDispatcher = new TriggerDispatcher(
    ctx.outboxRepo, ctx.dlq, ctx.idGenerator, ctx.clock,
    { sendEvent: fakeSender.send, maxRetries: 1 },
    ctx.metrics,
  );

  async function cycle() {
    fakeSender.sent.length = 0;
    await dispatcher.dispatchPending();
    await routeCapturedEvents(fakeSender.sent, router);
  }

  // ── Step 1: Full setup through task creation ─────────────────────────
  await ctx.submitHandler.handle(
    { type: "request.submit", payload: { requestText: "Assignment test" } },
    { workspaceId: "workspace-1", actorId: "user-1", correlationId: "corr-b", idempotencyKey: "b1" },
  );

  // Drain the outbox through the full trigger pipeline
  for (let i = 0; i < 15; i++) {
    const pending = await ctx.outboxRepo.getPending();
    if (pending.length === 0) break;
    await cycle();
  }

  // ── Step 2: Verify task was created and assignment happened ──────────
  const tasks = [...ctx.taskRepo.store.values()];
  assert.ok(tasks.length >= 1, "at least one task should exist");

  const assignments = [...ctx.assignmentRepo.store.values()];
  assert.ok(assignments.length >= 1, "assignment should have been created for the task");
});

// ===========================================================================
// Test C — Execution Completed → Trigger Event → Router → ProcessManager
// ===========================================================================
test("Test C: completed execution routes through to request completion", async () => {
  const ctx = buildTestContext();
  const fakeSender = new FakeTriggerSender();
  const router = new TriggerEventRouter(ctx.processManager);

  const dispatcher: EventDispatcher = new TriggerDispatcher(
    ctx.outboxRepo, ctx.dlq, ctx.idGenerator, ctx.clock,
    { sendEvent: fakeSender.send, maxRetries: 1 },
    ctx.metrics,
  );

  async function cycle() {
    fakeSender.sent.length = 0;
    await dispatcher.dispatchPending();
    await routeCapturedEvents(fakeSender.sent, router);
  }

  // ── Step 1: Execute full flow to create execution session ──────────
  await ctx.submitHandler.handle(
    { type: "request.submit", payload: { requestText: "Completion test" } },
    { workspaceId: "workspace-1", actorId: "user-1", correlationId: "corr-c", idempotencyKey: "c1" },
  );

  // Drain the outbox through the full trigger pipeline until outbox is empty
  for (let i = 0; i < 15; i++) {
    const pending = await ctx.outboxRepo.getPending();
    if (pending.length === 0) break;
    await cycle();
  }

  // ── Step 2: Find an execution session to complete ──────────────────
  const sessions = [...ctx.executionSessionRepo.store.values()];
  assert.ok(sessions.length >= 1, "at least one execution session should exist");

  const session = sessions[0]!;
  await ctx.completeHandler.handle(
    { type: "execution_session.complete", payload: { executionSessionId: session.id, outputSummary: "done" } },
    { workspaceId: "workspace-1", actorId: "runtime", correlationId: "corr-c-complete", idempotencyKey: "c2" },
  );

  // ── Step 3: Dispatch and route the completion event ────────────────
  await cycle();

  const completedPayload = fakeSender.sent.find((s) => s.eventType === "execution_session.completed");
  assert.ok(completedPayload, "execution_session.completed event should be sent to Trigger.dev");

  // Drain remaining events (assignment.completed, task.completed, workflow_run.completed, request.completed)
  for (let i = 0; i < 10; i++) {
    const pending = await ctx.outboxRepo.getPending();
    if (pending.length === 0) break;
    await cycle();
  }

  // ── Step 4: Verify completion was processed ────────────────────────
  const completedSessions = [...ctx.executionSessionRepo.store.values()];
  assert.ok(completedSessions.every((s) => s.status === "completed"), "all sessions should be completed");

  // Verify the entire pipeline progressed through to completion
  const updatedRequest = await ctx.requestRepo.getById(
    [...ctx.requestRepo.store.keys()][0]!,
  );
  assert.equal(updatedRequest?.status, "completed", "request should be completed");
});

// ===========================================================================
// Test D — Dispatcher Failure → Retries → Dead Letter Queue
// ===========================================================================
test("Test D: dispatcher failure moves events to dead-letter queue", async () => {
  const outboxRepo = new FakeOutboxRepository();
  const dlq = new FakeDeadLetterQueue();
  const idGenerator = new FakeIdGenerator();
  const clock = new FakeClock();
  const metrics = new FakeMetricsRecorder();

  // Create a sender that always fails
  const failingSender: SendEventFn = async () => {
    throw new Error("Trigger.dev API unavailable");
  };

  const dispatcher = new TriggerDispatcher(
    outboxRepo, dlq, idGenerator, clock,
    { sendEvent: failingSender, maxRetries: 1 },
    metrics,
  );

  // Enqueue an event
  await outboxRepo.enqueue([{
    id: "o-dlq-1",
    workspaceId: "ws-1",
    event: { type: "test.trigger_fail", occurredAt: new Date(), payload: {}, version: 1 },
    status: "pending",
  }]);

  // Dispatch — should fail and move to DLQ
  await dispatcher.dispatchPending();

  // The event should be removed from outbox
  const pending = await outboxRepo.getPending();
  assert.equal(pending.length, 0, "event should be removed from outbox");

  // And should be in the dead-letter queue
  const deadLetters = await dlq.getAll();
  assert.equal(deadLetters.length, 1, "event should be in dead-letter queue");
  assert.equal(deadLetters[0]!.eventType, "test.trigger_fail");
  assert.equal(deadLetters[0]!.outboxId, "o-dlq-1");

  // Verify metrics were recorded
  assert.ok(
    metrics.increments.some((m) => m.metric === "trigger.events.failed"),
    "trigger.events.failed metric should be recorded",
  );
});

// ===========================================================================
// Test E — TriggerDispatcher handles empty outbox gracefully
// ===========================================================================
test("dispatcher with no pending entries is a no-op", async () => {
  const outboxRepo = new FakeOutboxRepository();
  const dlq = new FakeDeadLetterQueue();
  const idGenerator = new FakeIdGenerator();
  const clock = new FakeClock();

  const dispatcher = new TriggerDispatcher(outboxRepo, dlq, idGenerator, clock);
  await dispatcher.dispatchPending();
  // No error expected
});

// ===========================================================================
// Test F — Event metadata preservation
// ===========================================================================
test("trigger event metadata preserves all required fields", async () => {
  const outboxRepo = new FakeOutboxRepository();
  const dlq = new FakeDeadLetterQueue();
  const idGenerator = new FakeIdGenerator();
  const clock = new FakeClock();
  const fakeSender = new FakeTriggerSender();
  const metrics = new FakeMetricsRecorder();

  const dispatcher = new TriggerDispatcher(
    outboxRepo, dlq, idGenerator, clock,
    { sendEvent: fakeSender.send, maxRetries: 1 },
    metrics,
  );

  const testEvent: DomainEvent = {
    type: "workflow_run.created",
    occurredAt: new Date("2025-06-01T12:00:00Z"),
    payload: { id: "wf-run-123", workflowId: "wf-1" },
    version: 2,
  };

  await outboxRepo.enqueue([{
    id: "o-meta-1",
    workspaceId: "ws-42",
    event: testEvent,
    status: "pending",
  }]);

  await dispatcher.dispatchPending();

  assert.equal(fakeSender.sent.length, 1, "one event should be sent");

  const sent = fakeSender.sent[0]!;
  assert.equal(sent.eventType, "workflow_run.created");
  assert.equal(sent.event.type, "workflow_run.created");
  assert.equal(sent.metadata.eventId, "o-meta-1");
  assert.equal(sent.metadata.workspaceId, "ws-42");
  assert.equal(sent.metadata.correlationId, "workflow_run.created-o-meta-1");
  assert.equal(sent.metadata.causationId, "workflow_run.created-o-meta-1");
  assert.equal(sent.metadata.aggregateId, "wf-run-123");
  assert.equal(sent.metadata.aggregateType, "workflow_run");
  assert.equal(sent.metadata.version, 2);

  // Verify metrics
  assert.ok(
    metrics.increments.some((m) => m.metric === "trigger.events.sent"),
    "trigger.events.sent metric should be recorded",
  );
});
