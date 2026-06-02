import assert from "node:assert/strict";
import test from "node:test";

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
import { OutboxDispatcher } from "@kancode/infrastructure";

test("metrics are recorded for process manager transitions", async () => {
  const metrics = new FakeMetricsRecorder();
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

  const planHandler = new PlanWorkflowRunHandler(requestRepo, workflowRepo, workflowRunRepo, taskRepo, unitOfWork, planner, eventPublisher);
  const assignHandler = new AssignTaskHandler(taskRepo, assignmentRepo, unitOfWork, idGenerator, eventPublisher);
  const createSessionHandler = new CreateExecutionSessionHandler(assignmentRepo, executionSessionRepo, unitOfWork, idGenerator, eventPublisher);
  const completeHandler = new CompleteExecutionSessionHandler(
    executionSessionRepo, assignmentRepo, taskRepo, workflowRunRepo, requestRepo, unitOfWork, eventPublisher,
  );

  const processManager = new WorkflowRunProcessManager(
    processRepo, auditLog, metrics, idGenerator, clock,
    planHandler, assignHandler, createSessionHandler,
  );

  let processId: string | null = null;
  const makeContext = (event: any): CommandContext => {
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

  const { requestId } = await (new SubmitRequestHandler(workspaceRepo, requestRepo, unitOfWork, idGenerator, clock, eventPublisher)).handle(
    { type: "request.submit", payload: { requestText: "Metrics test" } },
    { workspaceId: "workspace-1", actorId: "user-1", correlationId: "corr-submit", idempotencyKey: "s1" },
  );
  await drain();

  const sessions = [...executionSessionRepo.store.values()];
  if (sessions.length > 0) {
    await completeHandler.handle(
      { type: "execution_session.complete", payload: { executionSessionId: sessions[0]!.id, outputSummary: "done" } },
      { workspaceId: "workspace-1", actorId: "runtime", correlationId: "corr-complete", idempotencyKey: "c1" },
    );
  }
  await drain();

  // Verify metrics were recorded
  const transitionMetrics = metrics.increments.filter((i) => i.metric === "process_manager.transition");
  assert.ok(transitionMetrics.length >= 1, "should have transition metrics");

  const terminalMetrics = metrics.increments.filter((i) => i.metric === "process_manager.terminal");
  const hasCompleted = terminalMetrics.some((m) => m.tags?.state === "completed");
  assert.ok(hasCompleted, "should have recorded completed terminal state");
});
