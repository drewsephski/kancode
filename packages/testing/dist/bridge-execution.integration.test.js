import assert from "node:assert/strict";
import test from "node:test";
import { FakeClock, FakeIdGenerator, FakeRequestRepository, FakeWorkspaceRepository, FakeWorkflowRepository, FakeWorkflowRunRepository, FakeTaskRepository, FakeAssignmentRepository, FakeExecutionSessionRepository, FakeDomainEventStore, FakeOutboxRepository, FakeWorkflowRunProcessRepository, FakeTransitionAuditLog, FakeDeadLetterQueue, FakeMetricsRecorder, } from "@kancode/testing";
import { SubmitRequestHandler, PlanWorkflowRunHandler, AssignTaskHandler, CreateExecutionSessionHandler, CompleteExecutionSessionHandler, OutboxBackedEventPublisher, } from "@kancode/application";
import { DefaultWorkflowPlanner, WorkflowRunProcessManager } from "@kancode/orchestration";
import { TriggerDispatcher, TriggerEventRouter } from "@kancode/infrastructure";
// ---------------------------------------------------------------------------
// Fake trigger sender
// ---------------------------------------------------------------------------
class FakeTriggerSender {
    sent = [];
    send = async (payload) => {
        this.sent.push(payload);
    };
}
// ---------------------------------------------------------------------------
// Fake BridgeCommandPublisher that captures calls
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
function buildTestContext() {
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
        processRepo, auditLog, metrics, dlq, eventPublisher, unitOfWork,
        bridgePublisher,
        submitHandler, planHandler, assignHandler, createSessionHandler, completeHandler,
        processManager,
    };
}
// ---------------------------------------------------------------------------
// Event router helper — routes a filtered set of events
// ---------------------------------------------------------------------------
let _routingProcessId = null;
async function routeEvents(payloads, router, filter) {
    const toRoute = filter ? payloads.filter(filter) : payloads;
    for (const p of toRoute) {
        if (!_routingProcessId) {
            const pl = p.event.payload;
            _routingProcessId = `proc-${typeof pl.id === "string" ? pl.id : p.event.type}-${Date.now()}`;
        }
        const ctx = {
            workspaceId: p.metadata.workspaceId,
            actorId: "system",
            correlationId: _routingProcessId,
            idempotencyKey: `evt-${p.metadata.eventId}-${_routingProcessId}`,
        };
        await router.routeEvent(p.event, ctx);
    }
}
function resetProcessId() {
    _routingProcessId = null;
}
// ===========================================================================
// Test 1: Full bridge-backed execution flow
//
// Workspace → Request → Workflow → WorkflowRun → Task → Assignment →
// Bridge Assignment Delivery → Bridge Execution Started →
// Progress → Completion → Request Completed
// ===========================================================================
test("bridge execution: full flow from request to completion via bridge path", async () => {
    const ctx = buildTestContext();
    const fakeSender = new FakeTriggerSender();
    const router = new TriggerEventRouter(ctx.processManager);
    const dispatcher = new TriggerDispatcher(ctx.outboxRepo, ctx.dlq, ctx.idGenerator, ctx.clock, { sendEvent: fakeSender.send, maxRetries: 1 }, ctx.metrics);
    async function cycle(filter) {
        fakeSender.sent.length = 0;
        await dispatcher.dispatchPending();
        await routeEvents(fakeSender.sent, router, filter);
    }
    // ── Step 1: Submit Request ──────────────────────────────────────────
    await ctx.submitHandler.handle({ type: "request.submit", payload: { requestText: "Bridge execution test" } }, { workspaceId: "workspace-1", actorId: "user-1", correlationId: "corr-be-1", idempotencyKey: "be1" });
    // ── Step 2: Drain through plan + assign phases ──────────────────────
    // Let all events flow except task.assigned, which would short-circuit
    // the bridge path by creating the execution session synchronously.
    const skipTaskAssigned = (p) => p.eventType !== "task.assigned";
    for (let i = 0; i < 15; i++) {
        const pending = await ctx.outboxRepo.getPending();
        if (pending.length === 0)
            break;
        await cycle(skipTaskAssigned);
    }
    // ── Step 3: Verify bridge assignment was published ──────────────────
    assert.equal(ctx.bridgePublisher.assignments.length, 1, "bridge should have received one assignment");
    const assignmentPub = ctx.bridgePublisher.assignments[0];
    assert.ok(assignmentPub.assignmentId.length > 0, "assignmentId should be present");
    assert.ok(assignmentPub.taskId.length > 0, "taskId should be present");
    assert.equal(assignmentPub.workspaceId, "workspace-1");
    // ── Step 4: Verify we are in awaiting_execution state ──────────────
    const processAfterBridge = await ctx.processRepo.getById(_routingProcessId);
    assert.equal(processAfterBridge?.state, "awaiting_execution", "process should be in awaiting_execution after bridge delivery");
    // ── Step 5: Verify no execution session was created yet (bridge hasn't started) ──
    const sessionsBeforeBridge = [...ctx.executionSessionRepo.store.values()];
    assert.equal(sessionsBeforeBridge.length, 0, "no execution session should exist before bridge starts execution");
    // ── Step 6: Simulate bridge starting execution ──────────────────────
    // The bridge would normally create and start the session.
    // We use the injected createSessionHandler to simulate this.
    const assignment = [...ctx.assignmentRepo.store.values()][0];
    const { executionSessionId } = await ctx.createSessionHandler.handle({ type: "execution_session.create", payload: { assignmentId: assignment.id, runtimeName: "Bridge Runtime" } }, { workspaceId: "workspace-1", actorId: "bridge", correlationId: "bridge-exec-start", idempotencyKey: `be-session-${assignment.id}` });
    assert.ok(executionSessionId, "execution session should be created by bridge");
    // ── Step 7: Route the execution_session.started event through the trigger pipeline ──
    // The createSessionHandler emitted events to the outbox.
    // Route them so the process manager sees execution_session.started.
    // Also route any assignment.executing events.
    for (let i = 0; i < 5; i++) {
        const pending = await ctx.outboxRepo.getPending();
        if (pending.length === 0)
            break;
        await cycle(skipTaskAssigned);
    }
    // ── Step 8: Verify process is in executing state ────────────────────
    const processAfterStart = await ctx.processRepo.getById(_routingProcessId);
    assert.equal(processAfterStart?.state, "executing", "process should be in executing after session start");
    // ── Step 9: Simulate bridge completing execution ────────────────────
    await ctx.completeHandler.handle({ type: "execution_session.complete", payload: { executionSessionId, outputSummary: "Bridge execution successful" } }, { workspaceId: "workspace-1", actorId: "bridge", correlationId: "bridge-exec-complete", idempotencyKey: `be-complete-${executionSessionId}` });
    // ── Step 10: Route completion events through the trigger pipeline ───
    for (let i = 0; i < 10; i++) {
        const pending = await ctx.outboxRepo.getPending();
        if (pending.length === 0)
            break;
        await cycle(skipTaskAssigned);
    }
    // ── Step 11: Verify everything completed ─────────────────────────────
    // Session completed
    const session = await ctx.executionSessionRepo.getById(executionSessionId);
    assert.equal(session?.status, "completed", "execution session should be completed");
    // Assignment completed
    const finalAssignment = await ctx.assignmentRepo.getById(assignment.id);
    assert.equal(finalAssignment?.status, "completed", "assignment should be completed");
    // Task completed
    const tasks = [...ctx.taskRepo.store.values()];
    assert.ok(tasks.every((t) => t.status === "completed"), "all tasks should be completed");
    // WorkflowRun completed
    const workflowRuns = [...ctx.workflowRunRepo.store.values()];
    assert.ok(workflowRuns.every((wr) => wr.status === "completed"), "all workflow runs should be completed");
    // Request completed
    const requests = [...ctx.requestRepo.store.values()];
    assert.ok(requests.every((r) => r.status === "completed"), "all requests should be completed");
    // Process completed
    const finalProcess = await ctx.processRepo.getById(_routingProcessId);
    assert.equal(finalProcess?.state, "completed", "process should be in completed state");
    // ── Step 12: Verify audit entries persisted ──────────────────────────
    const auditEntries = await ctx.auditLog.getByProcessId(_routingProcessId);
    assert.ok(auditEntries.length >= 1, "audit entries should exist");
    // ── Step 13: Verify no outbox backlog ───────────────────────────────
    const remainingPending = await ctx.outboxRepo.getPending();
    assert.equal(remainingPending.length, 0, "no pending outbox entries should remain");
    // ── Step 14: Verify no dead-letter entries ──────────────────────────
    const deadLetters = await ctx.dlq.getAll();
    assert.equal(deadLetters.length, 0, "no dead-letter entries should exist");
    // ── Step 15: Verify metrics were emitted ────────────────────────────
    assert.ok(ctx.metrics.increments.some((m) => m.metric === "process_manager.transition"), "process manager transition metrics should exist");
    assert.ok(ctx.metrics.increments.some((m) => m.metric === "process_manager.terminal"), "terminal state metric should be recorded");
});
// ===========================================================================
// Test 2: Bridge delivery path (assignment.created → publish_assignment)
// ===========================================================================
test("bridge delivery: assignment.created triggers publish_assignment command", async () => {
    const ctx = buildTestContext();
    const fakeSender = new FakeTriggerSender();
    const router = new TriggerEventRouter(ctx.processManager);
    const dispatcher = new TriggerDispatcher(ctx.outboxRepo, ctx.dlq, ctx.idGenerator, ctx.clock, { sendEvent: fakeSender.send, maxRetries: 1 }, ctx.metrics);
    const skipTaskAssigned = (p) => p.eventType !== "task.assigned";
    async function cycle() {
        fakeSender.sent.length = 0;
        await dispatcher.dispatchPending();
        // Filter out task.assigned to prevent short-circuit session creation
        const filtered = fakeSender.sent.filter(skipTaskAssigned);
        if (filtered.length > 0) {
            await routeEvents(filtered, router);
        }
    }
    // Submit request
    await ctx.submitHandler.handle({ type: "request.submit", payload: { requestText: "Bridge delivery test" } }, { workspaceId: "workspace-1", actorId: "user-1", correlationId: "corr-bd-1", idempotencyKey: "bd1" });
    // Drain — task.assigned is filtered at every cycle
    for (let i = 0; i < 10; i++) {
        const pending = await ctx.outboxRepo.getPending();
        if (pending.length === 0)
            break;
        await cycle();
    }
    // Verify bridge publisher was called (assignment.created → publish_assignment)
    assert.equal(ctx.bridgePublisher.assignments.length, 1, "bridge publisher should have been called");
    assert.ok(ctx.bridgePublisher.assignments[0].assignmentId.length > 0, "assignment id should be set");
    // Process should now be in awaiting_execution
    const process = await ctx.processRepo.getById(_routingProcessId);
    assert.equal(process?.state, "awaiting_execution", "process should be in awaiting_execution after bridge delivery");
});
// ===========================================================================
// Test 3: assignment.created is ignored AFTER task.assigned transitions
// ===========================================================================
test("bridge delivery: assignment.created is no-op when task.assigned already transitioned", async () => {
    const ctx = buildTestContext();
    const fakeSender = new FakeTriggerSender();
    const router = new TriggerEventRouter(ctx.processManager);
    const dispatcher = new TriggerDispatcher(ctx.outboxRepo, ctx.dlq, ctx.idGenerator, ctx.clock, { sendEvent: fakeSender.send, maxRetries: 1 }, ctx.metrics);
    async function cycle() {
        fakeSender.sent.length = 0;
        await dispatcher.dispatchPending();
        await routeEvents(fakeSender.sent, router);
    }
    // Submit and drain through all events (including task.assigned)
    await ctx.submitHandler.handle({ type: "request.submit", payload: { requestText: "Noop test" } }, { workspaceId: "workspace-1", actorId: "user-1", correlationId: "corr-noop", idempotencyKey: "noop1" });
    for (let i = 0; i < 10; i++) {
        const pending = await ctx.outboxRepo.getPending();
        if (pending.length === 0)
            break;
        await cycle();
    }
    // When task.assigned runs first, the bridge publisher should NOT be called
    // because assignment.created finds the state already at awaiting_execution
    assert.equal(ctx.bridgePublisher.assignments.length, 0, "bridge publisher should NOT be called when task.assigned short-circuits");
    // Verify execution session was created (short-circuit path)
    const sessions = [...ctx.executionSessionRepo.store.values()];
    assert.ok(sessions.length >= 1, "execution session should exist via short-circuit path");
});
//# sourceMappingURL=bridge-execution.integration.test.js.map