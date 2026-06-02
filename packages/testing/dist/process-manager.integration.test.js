import assert from "node:assert/strict";
import test from "node:test";
import { FakeClock, FakeIdGenerator, FakeRequestRepository, FakeWorkspaceRepository, FakeWorkflowRepository, FakeWorkflowRunRepository, FakeTaskRepository, FakeAssignmentRepository, FakeExecutionSessionRepository, FakeDomainEventStore, FakeOutboxRepository, FakeWorkflowRunProcessRepository, FakeTransitionAuditLog, FakeMetricsRecorder, InMemorySubscriberRegistry, } from "@kancode/testing";
import { SubmitRequestHandler, PlanWorkflowRunHandler, AssignTaskHandler, CreateExecutionSessionHandler, CompleteExecutionSessionHandler, OutboxBackedEventPublisher, } from "@kancode/application";
import { DefaultWorkflowPlanner, WorkflowRunProcessManager } from "@kancode/orchestration";
import { OutboxDispatcher } from "@kancode/infrastructure";
test("process manager drives full request-to-completion flow", async () => {
    // ── Infrastructure ─────────────────────────────────────────────────────
    const idGenerator = new FakeIdGenerator();
    const clock = new FakeClock();
    const workspaceRepo = new FakeWorkspaceRepository();
    const requestRepo = new FakeRequestRepository();
    const workflowRepo = new FakeWorkflowRepository();
    const workflowRunRepo = new FakeWorkflowRunRepository();
    const taskRepo = new FakeTaskRepository();
    const assignmentRepo = new FakeAssignmentRepository();
    const executionSessionRepo = new FakeExecutionSessionRepository();
    const processRepo = new FakeWorkflowRunProcessRepository();
    const auditLog = new FakeTransitionAuditLog();
    const eventStore = new FakeDomainEventStore();
    const outboxRepo = new FakeOutboxRepository();
    const registry = new InMemorySubscriberRegistry();
    const unitOfWork = { run: (fn) => fn() };
    const planner = new DefaultWorkflowPlanner(idGenerator);
    const eventPublisher = new OutboxBackedEventPublisher(eventStore, outboxRepo, idGenerator, "workspace-1");
    // ── Command handlers ───────────────────────────────────────────────────
    const submitHandler = new SubmitRequestHandler(workspaceRepo, requestRepo, unitOfWork, idGenerator, clock, eventPublisher);
    const planHandler = new PlanWorkflowRunHandler(requestRepo, workflowRepo, workflowRunRepo, taskRepo, unitOfWork, planner, eventPublisher);
    const assignHandler = new AssignTaskHandler(taskRepo, assignmentRepo, unitOfWork, idGenerator, eventPublisher);
    const createSessionHandler = new CreateExecutionSessionHandler(assignmentRepo, executionSessionRepo, unitOfWork, idGenerator, eventPublisher);
    const completeHandler = new CompleteExecutionSessionHandler(executionSessionRepo, assignmentRepo, taskRepo, workflowRunRepo, requestRepo, unitOfWork, eventPublisher);
    // ── Process Manager ────────────────────────────────────────────────────
    const processManager = new WorkflowRunProcessManager(processRepo, auditLog, new FakeMetricsRecorder(), idGenerator, clock, planHandler, assignHandler, createSessionHandler);
    // Register the process manager as subscriber for every event it handles.
    // All events share a single processId derived from the first event's request.
    let processId = null;
    const makeContext = (event) => {
        if (!processId) {
            const payload = event.payload;
            const id = typeof payload.id === "string" ? payload.id : `proc-${event.type}`;
            processId = `proc-${id}`;
        }
        return {
            workspaceId: "workspace-1",
            actorId: "system",
            correlationId: processId,
            idempotencyKey: `evt-${event.type}`,
        };
    };
    const relevantEvents = [
        "request.submitted",
        "workflow_run.created",
        "task.created",
        "task.assigned",
        "execution_session.started",
        "execution_session.completed",
        "request.completed",
    ];
    for (const eventType of relevantEvents) {
        registry.register(eventType, async (event) => {
            await processManager.handle(event, makeContext(event));
        });
    }
    const dispatcher = new OutboxDispatcher(outboxRepo, registry);
    // Helper: drain the outbox
    async function drainOutbox(times = 10) {
        for (let i = 0; i < times; i++) {
            const pending = await outboxRepo.getPending();
            if (pending.length === 0)
                break;
            await dispatcher.dispatchPending();
        }
    }
    // ── Submit Request ─────────────────────────────────────────────────────
    const { requestId } = await submitHandler.handle({ type: "request.submit", payload: { requestText: "Process-managed request" } }, {
        workspaceId: "workspace-1", actorId: "user-1",
        correlationId: "corr-submit", idempotencyKey: "submit-1",
    });
    // Drain the outbox — process manager advances to "executing" state
    await drainOutbox();
    // The process manager is now waiting in "executing" state for completion.
    // Simulate the external runtime completing the execution session.
    const pendingSessions = [...executionSessionRepo.store.values()];
    assert.ok(pendingSessions.length > 0, "should have an execution session");
    const sessionId = pendingSessions[0].id;
    // Verify session is in started state before completing
    const preCompleteSession = await executionSessionRepo.getById(sessionId);
    assert.equal(preCompleteSession?.status, "started", "session should be started before completion");
    await completeHandler.handle({ type: "execution_session.complete", payload: { executionSessionId: sessionId, outputSummary: "Completed by test" } }, { workspaceId: "workspace-1", actorId: "runtime", correlationId: "corr-complete", idempotencyKey: "runtime-complete-1" });
    // Verify handler persisted the completed state
    const postCompleteSession = await executionSessionRepo.getById(sessionId);
    assert.equal(postCompleteSession?.status, "completed", "session should be completed after handler");
    const postCompleteRequest = await requestRepo.getById(requestId);
    assert.equal(postCompleteRequest?.status, "completed", "request should be completed after handler");
    // Drain again — process manager handles execution_session.completed events
    await drainOutbox();
    // ── Final Assertions ───────────────────────────────────────────────────
    // Request
    const request = await requestRepo.getById(requestId);
    assert.ok(request);
    assert.equal(request.status, "completed");
    assert.equal(request.version, 4);
    // Workflow run
    const workflowRuns = [...workflowRunRepo.store.values()];
    assert.equal(workflowRuns.length, 1);
    assert.equal(workflowRuns[0].status, "completed");
    assert.equal(workflowRuns[0].version, 3);
    // Task
    const tasks = [...taskRepo.store.values()];
    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].status, "completed");
    assert.equal(tasks[0].version, 4);
    // Assignment
    const assignments = [...assignmentRepo.store.values()];
    assert.equal(assignments.length, 1);
    assert.equal(assignments[0].status, "completed");
    assert.equal(assignments[0].version, 4);
    // Execution session
    const sessions = [...executionSessionRepo.store.values()];
    assert.equal(sessions.length, 1);
    assert.equal(sessions[0].status, "completed");
    assert.equal(sessions[0].version, 3);
    // Process state
    const processes = [...processRepo.store.values()];
    assert.equal(processes.length, 1);
    const process = processes[0];
    assert.equal(process.state, "completed");
    assert.ok(process.revision >= 4, `process revision should advance: ${process.revision}`);
    // All events in event store
    const allEvents = await eventStore.getAll();
    assert.equal(allEvents.length, 21, "all 21 domain events should be present");
    // No pending outbox entries
    const pending = await outboxRepo.getPending();
    assert.equal(pending.length, 0);
});
test("process manager handles event out of order gracefully", async () => {
    const processRepo = new FakeWorkflowRunProcessRepository();
    const idGenerator = new FakeIdGenerator();
    const clock = new FakeClock();
    const unitOfWork = { run: (fn) => fn() };
    const planner = new DefaultWorkflowPlanner(idGenerator);
    const eventPublisher = { publish: async () => { } };
    const repo = () => ({ getById: async () => null, save: async () => { } });
    const pm = new WorkflowRunProcessManager(processRepo, new FakeTransitionAuditLog(), new FakeMetricsRecorder(), idGenerator, clock, {
        handle: async () => ({ workflowId: "", workflowRunId: "" }),
    }, {
        handle: async () => ({ assignmentId: "" }),
    }, {
        handle: async () => ({ executionSessionId: "" }),
    });
    // Send events in non-ideal order — process manager should not crash
    const ctx = { workspaceId: "ws-1", actorId: "system", correlationId: "test", idempotencyKey: "test" };
    await pm.handle({ type: "execution_session.completed", occurredAt: new Date(), payload: { id: "es-1" }, version: 1 }, ctx);
    await pm.handle({ type: "request.completed", occurredAt: new Date(), payload: { id: "req-1" }, version: 1 }, ctx);
    // No error expected — process manager returns early for events it can't process yet
    assert.ok(true);
});
//# sourceMappingURL=process-manager.integration.test.js.map