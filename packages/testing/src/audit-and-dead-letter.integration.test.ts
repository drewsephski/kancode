import assert from "node:assert/strict";
import test from "node:test";

import type { DomainEvent } from "@kancode/domain";
import type { UnitOfWork, DomainEventStore, OutboxRepository, CommandContext } from "@kancode/application";
import type { SubscriberRegistry } from "@kancode/events";
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
import { OutboxDispatcher, TriggerDispatcher } from "@kancode/infrastructure";

test("audit trail records every process state transition", async () => {
  const idGenerator = new FakeIdGenerator();
  const clock = new FakeClock();
  const processRepo = new FakeWorkflowRunProcessRepository();
  const auditLog = new FakeTransitionAuditLog();
  const requestRepo = new FakeRequestRepository();
  const workspaceRepo = new FakeWorkspaceRepository();
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
  const eventPublisher = new OutboxBackedEventPublisher(eventStore, outboxRepo, idGenerator, "workspace-1");

  const submitHandler = new SubmitRequestHandler(workspaceRepo, requestRepo, unitOfWork, idGenerator, clock, eventPublisher);
  const planHandler = new PlanWorkflowRunHandler(requestRepo, workflowRepo, workflowRunRepo, taskRepo, unitOfWork, planner, eventPublisher);
  const assignHandler = new AssignTaskHandler(taskRepo, assignmentRepo, unitOfWork, idGenerator, eventPublisher);
  const createSessionHandler = new CreateExecutionSessionHandler(assignmentRepo, executionSessionRepo, unitOfWork, idGenerator, eventPublisher);
  const completeHandler = new CompleteExecutionSessionHandler(
    executionSessionRepo, assignmentRepo, taskRepo, workflowRunRepo, requestRepo, unitOfWork, eventPublisher,
  );

  const processManager = new WorkflowRunProcessManager(
    processRepo, auditLog, new FakeMetricsRecorder(), idGenerator, clock,
    planHandler, assignHandler, createSessionHandler,
  );

  let processId: string | null = null;
  const makeContext = (event: DomainEvent): CommandContext => {
    if (!processId) {
      const p = event.payload as Record<string, unknown>;
      processId = `proc-${typeof p.id === "string" ? p.id : event.type}`;
    }
    return { workspaceId: "workspace-1", actorId: "system", correlationId: processId!, idempotencyKey: `evt-${event.type}` };
  };

  for (const et of ["request.submitted", "workflow_run.created", "task.created", "task.assigned", "execution_session.started", "execution_session.completed", "request.completed"]) {
    registry.register(et, async (event) => { await processManager.handle(event, makeContext(event)); });
  }

  const dispatcher = new OutboxDispatcher(outboxRepo, registry);
  async function drain(times = 10) { for (let i = 0; i < times; i++) { const p = await outboxRepo.getPending(); if (p.length === 0) break; await dispatcher.dispatchPending(); } }

  const { requestId } = await submitHandler.handle(
    { type: "request.submit", payload: { requestText: "Audit test" } },
    { workspaceId: "workspace-1", actorId: "user-1", correlationId: "corr-submit", idempotencyKey: "s1" },
  );
  await drain();
  const pendingSessions = [...executionSessionRepo.store.values()];
  if (pendingSessions.length > 0) {
    await completeHandler.handle(
      { type: "execution_session.complete", payload: { executionSessionId: pendingSessions[0]!.id, outputSummary: "done" } },
      { workspaceId: "workspace-1", actorId: "runtime", correlationId: "corr-complete", idempotencyKey: "c1" },
    );
  }
  await drain();

  // Verify audit trail
  const trail = auditLog.entries;
  assert.ok(trail.length >= 1, "audit trail should have entries");

  // Verify the sequence of transitions
  const transitions = trail.map((e) => ({ from: e.fromState, to: e.toState, event: e.eventType }));
  assert.ok(transitions.some((t) => t.to === "completed"), "should end in completed");

  // Verify all entries have required fields
  for (const entry of trail) {
    assert.ok(entry.processId, "entry should have processId");
    assert.ok(entry.fromState, "entry should have fromState");
    assert.ok(entry.toState, "entry should have toState");
    assert.ok(entry.eventType, "entry should have eventType");
    assert.ok(entry.revision >= 1, "entry should have revision >= 1");
    assert.ok(entry.occurredAt instanceof Date, "entry should have occurredAt as Date");
  }

  // Verify we can retrieve by processId
  const retrieved = await auditLog.getByProcessId(trail[0]!.processId);
  assert.equal(retrieved.length, trail.length);
});

test("trigger dispatcher moves failed events to dead-letter queue after max retries", async () => {
  const outboxRepo = new FakeOutboxRepository();
  const dlq = new FakeDeadLetterQueue();
  const idGenerator = new FakeIdGenerator();
  const clock = new FakeClock();

  // Create a TriggerDispatcher with maxRetries=1 (fails after first failure)
  const dispatcher = new TriggerDispatcher(outboxRepo, dlq, idGenerator, clock, { maxRetries: 1 });

  // Enqueue an event
  await outboxRepo.enqueue([{
    id: "o-1",
    workspaceId: "ws-1",
    event: { type: "test.fail", occurredAt: new Date(), payload: {}, version: 1 },
    status: "pending",
  }]);

  // First dispatch: the sendToTrigger will fail (no API key configured)
  // With maxRetries=1, a single failure sends it to DLQ
  await dispatcher.dispatchPending();

  // The event should be dispatched (moved out of pending)
  const pending = await outboxRepo.getPending();
  assert.equal(pending.length, 0, "event should be removed from outbox");

  // And should be in the dead-letter queue
  const deadLetters = await dlq.getAll();
  assert.equal(deadLetters.length, 1, "event should be in dead-letter queue");
  assert.equal(deadLetters[0]!.eventType, "test.fail");
  assert.equal(deadLetters[0]!.outboxId, "o-1");
});

test("audit trail for out-of-order events is sparse but correct", async () => {
  const auditLog = new FakeTransitionAuditLog();
  const processRepo = new FakeWorkflowRunProcessRepository();
  const idGenerator = new FakeIdGenerator();
  const clock = new FakeClock();

  const nullHandler = { handle: async () => ({ workflowId: "", workflowRunId: "" }) };
  const nullAssign = { handle: async () => ({ assignmentId: "" }) };
  const nullCreate = { handle: async () => ({ executionSessionId: "" }) };

  const pm = new WorkflowRunProcessManager(
    processRepo, auditLog, new FakeMetricsRecorder(), idGenerator, clock,
    nullHandler, nullAssign, nullCreate,
  );

  const ctx = { workspaceId: "ws-1", actorId: "sys", correlationId: "proc-outoforder", idempotencyKey: "k" };

  // Send events in reverse order — only request.submitted should produce a transition
  await pm.handle({ type: "request.completed", occurredAt: new Date(), payload: { id: "x" }, version: 1 }, ctx);
  await pm.handle({ type: "execution_session.completed", occurredAt: new Date(), payload: { id: "x" }, version: 1 }, ctx);
  await pm.handle({ type: "request.submitted", occurredAt: new Date(), payload: { id: "req-1" }, version: 1 }, ctx);

  // Only one audit entry should exist (pending → planning from request.submitted)
  assert.equal(auditLog.entries.length, 1, "only request.submitted should produce an audit entry");
  assert.equal(auditLog.entries[0]!.fromState, "pending");
  assert.equal(auditLog.entries[0]!.toState, "planning");
});
