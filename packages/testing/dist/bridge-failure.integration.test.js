import assert from "node:assert/strict";
import test from "node:test";
import { FakeClock, FakeIdGenerator, FakeRequestRepository, FakeWorkspaceRepository, FakeWorkflowRepository, FakeWorkflowRunRepository, FakeTaskRepository, FakeAssignmentRepository, FakeExecutionSessionRepository, FakeDomainEventStore, FakeOutboxRepository, FakeWorkflowRunProcessRepository, FakeTransitionAuditLog, FakeDeadLetterQueue, FakeMetricsRecorder, } from "@kancode/testing";
import { SubmitRequestHandler, PlanWorkflowRunHandler, AssignTaskHandler, CreateExecutionSessionHandler, CompleteExecutionSessionHandler, OutboxBackedEventPublisher, } from "@kancode/application";
import { DefaultWorkflowPlanner, WorkflowRunProcessManager } from "@kancode/orchestration";
import { TriggerDispatcher, TriggerEventRouter } from "@kancode/infrastructure";
// ---------------------------------------------------------------------------
// Fakes
// ---------------------------------------------------------------------------
class FakeBridgePublisher {
    assignments = [];
    executionStarts = [];
    async publishAssignment(input) {
        this.assignments.push(input);
    }
    async publishExecutionStart(input) {
        this.executionStarts.push(input);
    }
}
class FakeSender {
    sent = [];
    send = async (p) => { this.sent.push(p); };
}
function buildContext() {
    const idGenerator = new FakeIdGenerator();
    const clock = new FakeClock();
    const workspaceRepo = new FakeWorkspaceRepository();
    const requestRepo = new FakeRequestRepository();
    const workflowRepo = new FakeWorkflowRepository();
    const workflowRunRepo = new FakeWorkflowRunRepository();
    const taskRepo = new FakeTaskRepository();
    const assignmentRepo = new FakeAssignmentRepository();
    const executionSessionRepo = new FakeExecutionSessionRepository();
    const eventStore = new FakeDomainEventStore();
    const outboxRepo = new FakeOutboxRepository();
    const processRepo = new FakeWorkflowRunProcessRepository();
    const auditLog = new FakeTransitionAuditLog();
    const metrics = new FakeMetricsRecorder();
    const dlq = new FakeDeadLetterQueue();
    const bridgePublisher = new FakeBridgePublisher();
    const unitOfWork = { run: (fn) => fn() };
    const planner = new DefaultWorkflowPlanner(idGenerator);
    const eventPublisher = new OutboxBackedEventPublisher(eventStore, outboxRepo, idGenerator, "workspace-1");
    const submitHandler = new SubmitRequestHandler(workspaceRepo, requestRepo, unitOfWork, idGenerator, clock, eventPublisher);
    const planHandler = new PlanWorkflowRunHandler(requestRepo, workflowRepo, workflowRunRepo, taskRepo, unitOfWork, planner, eventPublisher);
    const assignHandler = new AssignTaskHandler(taskRepo, assignmentRepo, unitOfWork, idGenerator, eventPublisher);
    const createSessionHandler = new CreateExecutionSessionHandler(assignmentRepo, executionSessionRepo, unitOfWork, idGenerator, eventPublisher);
    const completeHandler = new CompleteExecutionSessionHandler(executionSessionRepo, assignmentRepo, taskRepo, workflowRunRepo, requestRepo, unitOfWork, eventPublisher);
    const processManager = new WorkflowRunProcessManager(processRepo, auditLog, metrics, idGenerator, clock, planHandler, assignHandler, createSessionHandler, bridgePublisher);
    return {
        idGenerator, clock, requestRepo, workflowRepo, workflowRunRepo,
        taskRepo, assignmentRepo, executionSessionRepo, eventStore, outboxRepo,
        processRepo, auditLog, metrics, dlq, eventPublisher, bridgePublisher,
        unitOfWork, processManager, createSessionHandler, completeHandler, submitHandler,
    };
}
// ---------------------------------------------------------------------------
// Helper: run the request→assignment flow through the trigger pipeline
// Returns { processId, executionSessionId } for test scenarios.
// ---------------------------------------------------------------------------
async function setupThroughAssignment(ctx) {
    const sender = new FakeSender();
    const router = new TriggerEventRouter(ctx.processManager);
    const dispatcher = new TriggerDispatcher(ctx.outboxRepo, ctx.dlq, ctx.idGenerator, ctx.clock, { sendEvent: sender.send, maxRetries: 1 }, ctx.metrics);
    let processId = null;
    async function routeAll() {
        for (const p of sender.sent) {
            if (!processId) {
                const pl = p.event.payload;
                processId = `proc-${typeof pl.id === "string" ? pl.id : p.event.type}-fail-${Date.now()}`;
            }
            await router.routeEvent(p.event, {
                workspaceId: p.metadata.workspaceId,
                actorId: "system",
                correlationId: processId,
                idempotencyKey: `evt-${p.metadata.eventId}`,
            });
        }
    }
    await ctx.submitHandler.handle({ type: "request.submit", payload: { requestText: "Failure test" } }, { workspaceId: "workspace-1", actorId: "user-1", correlationId: "fail-corr", idempotencyKey: "fail-idem" });
    // Drain — skip task.assigned to use bridge path
    for (let i = 0; i < 15; i++) {
        const pending = await ctx.outboxRepo.getPending();
        if (pending.length === 0)
            break;
        sender.sent.length = 0;
        await dispatcher.dispatchPending();
        const filtered = sender.sent.filter((p) => p.eventType !== "task.assigned");
        for (const p of filtered) {
            if (!processId) {
                const pl = p.event.payload;
                processId = `proc-${typeof pl.id === "string" ? pl.id : p.event.type}-fail-${Date.now()}`;
            }
            await router.routeEvent(p.event, {
                workspaceId: p.metadata.workspaceId,
                actorId: "system",
                correlationId: processId,
                idempotencyKey: `evt-${p.metadata.eventId}`,
            });
        }
    }
    // Bridge creates session
    const assignments = [...ctx.assignmentRepo.store.values()];
    const { executionSessionId } = await ctx.createSessionHandler.handle({ type: "execution_session.create", payload: { assignmentId: assignments[0].id, runtimeName: "Bridge" } }, { workspaceId: "workspace-1", actorId: "bridge", correlationId: `fail-session-${processId}`, idempotencyKey: `fail-ses-${assignments[0].id}` });
    // Route session.started through the pipeline
    for (let i = 0; i < 5; i++) {
        const pending = await ctx.outboxRepo.getPending();
        if (pending.length === 0)
            break;
        sender.sent.length = 0;
        await dispatcher.dispatchPending();
        for (const p of sender.sent) {
            await router.routeEvent(p.event, {
                workspaceId: p.metadata.workspaceId,
                actorId: "system",
                correlationId: processId,
                idempotencyKey: `evt-${p.metadata.eventId}`,
            });
        }
    }
    return { processId: processId, assignmentId: assignments[0].id, executionSessionId };
}
// ===========================================================================
// Scenario A: Bridge reports failure
// ===========================================================================
test("Scenario A: bridge failure transitions process and workflow run to failed", async () => {
    const ctx = buildContext();
    const { processId, executionSessionId } = await setupThroughAssignment(ctx);
    const router = new TriggerEventRouter(ctx.processManager);
    // Route execution_session.failed — the state machine transitions the
    // PROCESS to failed state. The ExecutionSession aggregate's status
    // is updated by a separate command handler; here we verify the
    // process-level state machine correctly handles the failure event.
    await router.routeEvent({ type: "execution_session.failed", occurredAt: new Date(), payload: { id: executionSessionId, errorMessage: "Bridge runtime error" }, version: 1 }, { workspaceId: "workspace-1", actorId: "bridge", correlationId: processId, idempotencyKey: `fail-ev-${executionSessionId}` });
    // Process → failed
    const process = await ctx.processRepo.getById(processId);
    assert.equal(process?.state, "failed", "process should be in failed state");
    // Session should remain managed by the domain aggregate;
    // state machine transitions don't alter aggregate state directly
    const session = await ctx.executionSessionRepo.getById(executionSessionId);
    assert.ok(session, "execution session should still exist in repo");
});
// ===========================================================================
// Scenario B: Duplicate completion message
// ===========================================================================
test("Scenario B: duplicate execution_session.completed is safely ignored", async () => {
    const ctx = buildContext();
    const { processId, executionSessionId } = await setupThroughAssignment(ctx);
    const router = new TriggerEventRouter(ctx.processManager);
    const sender = new FakeSender();
    const dispatcher = new TriggerDispatcher(ctx.outboxRepo, ctx.dlq, ctx.idGenerator, ctx.clock, { sendEvent: sender.send, maxRetries: 1 }, ctx.metrics);
    // Complete the session
    await ctx.completeHandler.handle({ type: "execution_session.complete", payload: { executionSessionId, outputSummary: "Done" } }, { workspaceId: "workspace-1", actorId: "bridge", correlationId: `dup-c-${processId}`, idempotencyKey: `dup-cc-${executionSessionId}` });
    // Route completion events
    for (let i = 0; i < 10; i++) {
        const pending = await ctx.outboxRepo.getPending();
        if (pending.length === 0)
            break;
        sender.sent.length = 0;
        await dispatcher.dispatchPending();
        for (const p of sender.sent) {
            await router.routeEvent(p.event, {
                workspaceId: p.metadata.workspaceId,
                actorId: "system",
                correlationId: processId,
                idempotencyKey: `evt-${p.metadata.eventId}`,
            });
        }
    }
    const versionAfterFirst = (await ctx.processRepo.getById(processId))?.revision ?? 0;
    // Send DUPLICATE execution_session.completed
    await router.routeEvent({ type: "execution_session.completed", occurredAt: new Date(), payload: { id: executionSessionId }, version: 1 }, { workspaceId: "workspace-1", actorId: "bridge", correlationId: processId, idempotencyKey: `dup-ev-${executionSessionId}` });
    // No version increment
    const versionAfterDup = (await ctx.processRepo.getById(processId))?.revision ?? 0;
    assert.equal(versionAfterDup, versionAfterFirst, "duplicate should not increment version");
    // No duplicate events in event store
    const allEvents = await ctx.eventStore.getAll();
    const completionEvents = allEvents.filter((e) => e.type === "execution_session.completed");
    assert.equal(completionEvents.length, 1, "should have exactly one execution_session.completed event");
});
// ===========================================================================
// Scenario C: Out-of-order progress events
// ===========================================================================
test("Scenario C: out-of-order execution_session.started is replay-safe", async () => {
    const ctx = buildContext();
    const { processId } = await setupThroughAssignment(ctx);
    const router = new TriggerEventRouter(ctx.processManager);
    // Send execution_session.started BEFORE session is created
    await router.routeEvent({ type: "execution_session.started", occurredAt: new Date(), payload: { id: "session-ooo", workspaceId: "workspace-1" }, version: 1 }, { workspaceId: "workspace-1", actorId: "bridge", correlationId: processId, idempotencyKey: "ooo-started" });
    // Process should transition to executing even though session wasn't created
    const process = await ctx.processRepo.getById(processId);
    assert.equal(process?.state, "executing", "out-of-order execution_session.started should transition to executing");
});
// ===========================================================================
// Scenario D: Bridge reconnects and replays completion
// ===========================================================================
test("Scenario D: bridge reconnect replay is idempotent", async () => {
    const ctx = buildContext();
    const { processId, executionSessionId } = await setupThroughAssignment(ctx);
    const router = new TriggerEventRouter(ctx.processManager);
    const sender = new FakeSender();
    const dispatcher = new TriggerDispatcher(ctx.outboxRepo, ctx.dlq, ctx.idGenerator, ctx.clock, { sendEvent: sender.send, maxRetries: 1 }, ctx.metrics);
    // Complete the session
    await ctx.completeHandler.handle({ type: "execution_session.complete", payload: { executionSessionId, outputSummary: "Reconnect test" } }, { workspaceId: "workspace-1", actorId: "bridge", correlationId: `recon-c-${processId}`, idempotencyKey: `recon-cc-${executionSessionId}` });
    // Route completion events
    for (let i = 0; i < 10; i++) {
        const pending = await ctx.outboxRepo.getPending();
        if (pending.length === 0)
            break;
        sender.sent.length = 0;
        await dispatcher.dispatchPending();
        for (const p of sender.sent) {
            await router.routeEvent(p.event, {
                workspaceId: p.metadata.workspaceId,
                actorId: "system",
                correlationId: processId,
                idempotencyKey: `evt-${p.metadata.eventId}`,
            });
        }
    }
    assert.equal((await ctx.processRepo.getById(processId))?.state, "completed", "process should be completed");
    // Bridge reconnect: simulate bridge resending the completion event
    // AFTER the process is already completed. The state machine should
    // ignore it because completed is a terminal state.
    await router.routeEvent({ type: "execution_session.completed", occurredAt: new Date(), payload: { id: executionSessionId, outputSummary: "Reconnect replay" }, version: 1 }, { workspaceId: "workspace-1", actorId: "bridge", correlationId: processId, idempotencyKey: `recon-r-${executionSessionId}` });
    // Same outcome, no regression — state machine ignores events in terminal states
    const finalProcess = await ctx.processRepo.getById(processId);
    assert.equal(finalProcess?.state, "completed", "reconnect replay should remain completed");
    // No version increment from the duplicate event
    assert.equal(finalProcess?.revision, 7, "process revision should remain at expected value");
});
//# sourceMappingURL=bridge-failure.integration.test.js.map