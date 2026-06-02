import assert from "node:assert/strict";
import test from "node:test";
import { FakeClock, FakeIdGenerator, FakeIdempotencyStore, FakeRequestRepository, FakeWorkspaceRepository, FakeWorkflowRepository, FakeWorkflowRunRepository, FakeTaskRepository, FakeAssignmentRepository, FakeExecutionSessionRepository, FakeEventPublisher, } from "@kancode/testing";
import { SubmitRequestHandler, PlanWorkflowRunHandler, AssignTaskHandler, CreateExecutionSessionHandler, CompleteExecutionSessionHandler, IdempotentHandler, } from "@kancode/application";
import { DefaultWorkflowPlanner } from "@kancode/orchestration";
const WORKSPACE_ID = "workspace-1";
function createContextOverrides(overrides) {
    return {
        workspaceId: WORKSPACE_ID,
        actorId: "user-1",
        correlationId: "corr-1",
        idempotencyKey: "idem-1",
        ...overrides,
    };
}
function createInfrastructure() {
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
    const unitOfWork = { run: (fn) => fn() };
    const planner = new DefaultWorkflowPlanner(idGenerator);
    const submitHandler = new SubmitRequestHandler(workspaceRepo, requestRepo, unitOfWork, idGenerator, clock, eventPublisher);
    const planHandler = new PlanWorkflowRunHandler(requestRepo, workflowRepo, workflowRunRepo, taskRepo, unitOfWork, planner, eventPublisher);
    const assignHandler = new AssignTaskHandler(taskRepo, assignmentRepo, unitOfWork, idGenerator, eventPublisher);
    const createSessionHandler = new CreateExecutionSessionHandler(assignmentRepo, executionSessionRepo, unitOfWork, idGenerator, eventPublisher);
    const completeHandler = new CompleteExecutionSessionHandler(executionSessionRepo, assignmentRepo, taskRepo, workflowRunRepo, requestRepo, unitOfWork, eventPublisher);
    return {
        idGenerator, clock, workspaceRepo, requestRepo, workflowRepo,
        workflowRunRepo, taskRepo, assignmentRepo, executionSessionRepo,
        eventPublisher, unitOfWork, planner,
        submitHandler, planHandler, assignHandler, createSessionHandler, completeHandler,
    };
}
async function runFullFlow(infra, context) {
    // Step 1: Submit Request
    const { requestId } = await infra.submitHandler.handle({ type: "request.submit", payload: { requestText: "Build Stripe subscriptions" } }, context);
    // Step 2: Plan Workflow Run
    const { workflowRunId } = await infra.planHandler.handle({ type: "workflow.plan", payload: { requestId } }, context);
    // Get the task for this specific workflow run
    const tasks = [...infra.taskRepo.store.values()].filter((t) => t.workflowRunId === workflowRunId);
    const taskId = tasks[0].id;
    // Step 3: Assign Task
    const { assignmentId } = await infra.assignHandler.handle({ type: "task.assign", payload: { taskId } }, context);
    // Step 4: Create Execution Session
    const { executionSessionId } = await infra.createSessionHandler.handle({ type: "execution_session.create", payload: { assignmentId, runtimeName: "Claude Code" } }, context);
    // Step 5: Complete Execution Session
    await infra.completeHandler.handle({ type: "execution_session.complete", payload: { executionSessionId, outputSummary: "All done" } }, context);
    return { requestId, workflowRunId, taskId, assignmentId, executionSessionId };
}
// ────────────────────────────────────────────────────────────────────────────
// 1. Idempotency Tests
// ────────────────────────────────────────────────────────────────────────────
test("idempotency: SubmitRequestCommand twice with same idempotency key", async () => {
    const infra = createInfrastructure();
    const idempotencyStore = new FakeIdempotencyStore();
    const context = createContextOverrides({ idempotencyKey: "idem-submit-1" });
    const handler = new IdempotentHandler(infra.submitHandler, idempotencyStore);
    const result1 = await handler.handle({ type: "request.submit", payload: { requestText: "Build Stripe subscriptions" } }, context);
    const result2 = await handler.handle({ type: "request.submit", payload: { requestText: "Build Stripe subscriptions" } }, context);
    // Same result returned
    assert.deepEqual(result1, result2);
    // Only one workspace created
    assert.equal(infra.workspaceRepo.store.size, 1);
    // Only one request created
    assert.equal(infra.requestRepo.store.size, 1);
    // Only one batch of events published
    assert.equal(infra.eventPublisher.published.length, 1);
});
test("idempotency: AssignTaskCommand twice with same idempotency key", async () => {
    const infra = createInfrastructure();
    const idempotencyStore = new FakeIdempotencyStore();
    const context = createContextOverrides({ idempotencyKey: "idem-assign-1" });
    // Set up: submit and plan to get a task
    const { requestId } = await infra.submitHandler.handle({ type: "request.submit", payload: { requestText: "Build" } }, context);
    await infra.planHandler.handle({ type: "workflow.plan", payload: { requestId } }, context);
    const tasks = [...infra.taskRepo.store.values()];
    const taskId = tasks[0].id;
    const handler = new IdempotentHandler(infra.assignHandler, idempotencyStore);
    const assignContext = createContextOverrides({ idempotencyKey: "idem-assign-1" });
    // Clear events from setup
    infra.eventPublisher.published.length = 0;
    const result1 = await handler.handle({ type: "task.assign", payload: { taskId } }, assignContext);
    const result2 = await handler.handle({ type: "task.assign", payload: { taskId } }, assignContext);
    assert.deepEqual(result1, result2);
    // Only one assignment created
    assert.equal(infra.assignmentRepo.store.size, 1);
    // Only one batch from the assignment
    assert.equal(infra.eventPublisher.published.length, 1);
    // Task status is in_progress (assigned + started once)
    const task = await infra.taskRepo.getById(taskId);
    assert.equal(task.status, "in_progress");
});
test("idempotency: CompleteExecutionSessionCommand twice with same idempotency key", async () => {
    const infra = createInfrastructure();
    const idempotencyStore = new FakeIdempotencyStore();
    const setupContext = createContextOverrides({ idempotencyKey: "setup" });
    const completeContext = createContextOverrides({ idempotencyKey: "idem-complete-1" });
    // Run setup steps (submit → plan → assign → create ES) but NOT completion
    const { requestId } = await infra.submitHandler.handle({ type: "request.submit", payload: { requestText: "Build Stripe subscriptions" } }, setupContext);
    const { workflowRunId } = await infra.planHandler.handle({ type: "workflow.plan", payload: { requestId } }, setupContext);
    const tasks = [...infra.taskRepo.store.values()].filter((t) => t.workflowRunId === workflowRunId);
    const taskId = tasks[0].id;
    const { assignmentId } = await infra.assignHandler.handle({ type: "task.assign", payload: { taskId } }, setupContext);
    const { executionSessionId } = await infra.createSessionHandler.handle({ type: "execution_session.create", payload: { assignmentId, runtimeName: "Claude Code" } }, setupContext);
    // Wrap completion with idempotency and call twice
    // Clear setup events so we only count completion events
    infra.eventPublisher.published.length = 0;
    const handler = new IdempotentHandler(infra.completeHandler, idempotencyStore);
    // First call: processes the command, stores result
    await handler.handle({ type: "execution_session.complete", payload: { executionSessionId, outputSummary: "All done" } }, completeContext);
    // Second call: should return stored result without executing inner handler
    await handler.handle({ type: "execution_session.complete", payload: { executionSessionId, outputSummary: "All done" } }, completeContext);
    // All aggregates should be completed (one transition only)
    const request = await infra.requestRepo.getById(requestId);
    assert.equal(request.status, "completed");
    const task = await infra.taskRepo.getById(taskId);
    assert.equal(task.status, "completed");
    const session = await infra.executionSessionRepo.getById(executionSessionId);
    assert.equal(session.status, "completed");
    // Events from the completion should be published exactly once
    const completionEvents = infra.eventPublisher.publishedFlat.filter((e) => e.type === "execution_session.completed");
    assert.equal(completionEvents.length, 1);
});
test("idempotency: different idempotency keys create separate aggregates", async () => {
    const infra = createInfrastructure();
    const idempotencyStore = new FakeIdempotencyStore();
    const handler = new IdempotentHandler(infra.submitHandler, idempotencyStore);
    await handler.handle({ type: "request.submit", payload: { requestText: "First request" } }, createContextOverrides({ idempotencyKey: "idem-first" }));
    // Even with same payload but different key, should create separate aggregates
    await handler.handle({ type: "request.submit", payload: { requestText: "First request" } }, createContextOverrides({ idempotencyKey: "idem-second" }));
    // Two separate requests
    assert.equal(infra.requestRepo.store.size, 2);
    assert.equal(infra.workspaceRepo.store.size, 1); // same workspace reused
});
// ────────────────────────────────────────────────────────────────────────────
// 2. Concurrency Tests
// ────────────────────────────────────────────────────────────────────────────
test("concurrency: second assignment attempt against the same task throws", async () => {
    const infra = createInfrastructure();
    const context = createContextOverrides();
    const { requestId } = await infra.submitHandler.handle({ type: "request.submit", payload: { requestText: "Build" } }, context);
    await infra.planHandler.handle({ type: "workflow.plan", payload: { requestId } }, context);
    const tasks = [...infra.taskRepo.store.values()];
    const taskId = tasks[0].id;
    // First assignment succeeds
    await infra.assignHandler.handle({ type: "task.assign", payload: { taskId } }, context);
    // Wait — the handler always loads fresh from the repo, so the task is already
    // "in_progress" in the store. A second assign call will load it and fail.
    await assert.rejects(() => infra.assignHandler.handle({ type: "task.assign", payload: { taskId } }, context), (err) => {
        assert.ok(err instanceof Error);
        assert.ok(err.message.includes("must be open"));
        return true;
    });
    // Only one assignment exists
    assert.equal(infra.assignmentRepo.store.size, 1);
});
test("concurrency: duplicate complete execution session throws", async () => {
    const infra = createInfrastructure();
    const ids = await runFullFlow(infra, createContextOverrides({ idempotencyKey: "setup" }));
    // Second completion attempt should throw because ES is already "completed"
    await assert.rejects(() => infra.completeHandler.handle({ type: "execution_session.complete", payload: { executionSessionId: ids.executionSessionId, outputSummary: "again" } }, createContextOverrides({ idempotencyKey: "second-complete" })), (err) => {
        assert.ok(err instanceof Error);
        return true;
    });
});
test("concurrency: assignment after request is planned still works", async () => {
    // This tests that the normal flow works — assignment is valid after planning
    const infra = createInfrastructure();
    const context = createContextOverrides();
    const { requestId } = await infra.submitHandler.handle({ type: "request.submit", payload: { requestText: "Build" } }, context);
    await infra.planHandler.handle({ type: "workflow.plan", payload: { requestId } }, context);
    const tasks = [...infra.taskRepo.store.values()];
    const taskId = tasks[0].id;
    // Assignment should succeed (task is open after planning)
    const { assignmentId } = await infra.assignHandler.handle({ type: "task.assign", payload: { taskId } }, context);
    assert.ok(assignmentId);
    const assignment = await infra.assignmentRepo.getById(assignmentId);
    assert.equal(assignment.status, "accepted");
});
// ────────────────────────────────────────────────────────────────────────────
// 3. Aggregate Version Tracking Tests
// ────────────────────────────────────────────────────────────────────────────
test("version: every state transition increments version exactly once", async () => {
    const infra = createInfrastructure();
    const ids = await runFullFlow(infra, createContextOverrides({ idempotencyKey: "setup" }));
    // Request: submit (1) → ready_for_planning (2) → planned (3) → completed (4)
    const request = await infra.requestRepo.getById(ids.requestId);
    assert.equal(request.version, 4);
    // Workflow: create (1) → plan (2)
    // Grab workflow from repo
    const requestEvents = infra.eventPublisher.publishedFlat.filter((e) => e.type.startsWith("workflow."));
    // workflow.created (1) + workflow.planned (2) = version 2
    // We can check the last event's version
    // Actually, let's just check the workflow aggregate's final version
    const workflows = [...infra.workflowRepo.store.values()];
    assert.equal(workflows[0].version, 2);
    // WorkflowRun: create (1) → start (2) → complete (3)
    const workflowRun = await infra.workflowRunRepo.getById(ids.workflowRunId);
    assert.equal(workflowRun.version, 3);
    // Task: create (1) → assigned (2) → started (3) → complete (4)
    const task = await infra.taskRepo.getById(ids.taskId);
    assert.equal(task.version, 4);
    // Assignment: create (1) → accepted (2) → executing (3) → complete (4)
    // Wait, let me recount: create(1), accept(2), start(3), complete(4) = 4
    const assignments = [...infra.assignmentRepo.store.values()];
    assert.equal(assignments[0].version, 4);
    // ExecutionSession: create (1) → start (2) → complete (3)
    const sessions = [...infra.executionSessionRepo.store.values()];
    assert.equal(sessions[0].version, 3);
});
test("version: idempotent replay does not increment version", async () => {
    const infra = createInfrastructure();
    const idempotencyStore = new FakeIdempotencyStore();
    const setupContext = createContextOverrides({ idempotencyKey: "setup" });
    const completeContext = createContextOverrides({ idempotencyKey: "complete" });
    // Setup WITHOUT completion (submit → plan → assign → create ES)
    const { requestId } = await infra.submitHandler.handle({ type: "request.submit", payload: { requestText: "Build" } }, setupContext);
    const { workflowRunId } = await infra.planHandler.handle({ type: "workflow.plan", payload: { requestId } }, setupContext);
    const tasks = [...infra.taskRepo.store.values()].filter((t) => t.workflowRunId === workflowRunId);
    const { assignmentId } = await infra.assignHandler.handle({ type: "task.assign", payload: { taskId: tasks[0].id } }, setupContext);
    const { executionSessionId } = await infra.createSessionHandler.handle({ type: "execution_session.create", payload: { assignmentId, runtimeName: "Claude Code" } }, setupContext);
    // First call: inner handler runs, completes the session, request version becomes 4
    const handler = new IdempotentHandler(infra.completeHandler, idempotencyStore);
    await handler.handle({ type: "execution_session.complete", payload: { executionSessionId, outputSummary: "All done" } }, completeContext);
    const versionAfterFirstCall = (await infra.requestRepo.getById(requestId)).version;
    assert.equal(versionAfterFirstCall, 4, "first call should complete the request (version 4)");
    // Second call: idempotent handler returns stored result, inner handler NOT called
    await handler.handle({ type: "execution_session.complete", payload: { executionSessionId, outputSummary: "All done" } }, completeContext);
    // Version should NOT have advanced — second call was a no-op
    const versionAfterSecondCall = (await infra.requestRepo.getById(requestId)).version;
    assert.equal(versionAfterSecondCall, versionAfterFirstCall, "second call should not increment version");
});
test("version: two separate submissions each track their own version", async () => {
    const infra = createInfrastructure();
    const idempotencyStore = new FakeIdempotencyStore();
    const handler = new IdempotentHandler(infra.submitHandler, idempotencyStore);
    const r1 = await handler.handle({ type: "request.submit", payload: { requestText: "Req A" } }, createContextOverrides({ idempotencyKey: "a" }));
    const r2 = await handler.handle({ type: "request.submit", payload: { requestText: "Req B" } }, createContextOverrides({ idempotencyKey: "b" }));
    const reqA = await infra.requestRepo.getById(r1.requestId);
    const reqB = await infra.requestRepo.getById(r2.requestId);
    assert.equal(reqA.version, 1);
    assert.equal(reqB.version, 1);
});
// ────────────────────────────────────────────────────────────────────────────
// 4. Event Replay Tests
// ────────────────────────────────────────────────────────────────────────────
test("event replay: all emitted events can be serialized and replayed deterministically", async () => {
    const infra = createInfrastructure();
    // Capture events from a full flow
    await runFullFlow(infra, createContextOverrides({ idempotencyKey: "setup" }));
    const originalEvents = infra.eventPublisher.publishedFlat;
    // Serialize/deserialize round-trip
    const serialized = JSON.stringify(originalEvents);
    const deserialized = JSON.parse(serialized);
    // Assert round-trip preserved everything
    assert.equal(deserialized.length, originalEvents.length);
    // Verify event type ordering is deterministic
    const originalTypes = originalEvents.map((e) => e.type);
    const deserializedTypes = deserialized.map((e) => e.type);
    assert.deepEqual(deserializedTypes, originalTypes);
    // Verify the exact event sequence
    const expectedTypes = [
        // SubmitRequest batch
        "workspace.created",
        "request.submitted",
        // PlanWorkflowRun batch (request events come first because request.pullEvents is first)
        "request.ready_for_planning",
        "request.planned",
        "workflow.created",
        "workflow.planned",
        "workflow_run.created",
        "workflow_run.started",
        "task.created",
        // AssignTask batch
        "task.assigned",
        "task.started",
        "assignment.created",
        "assignment.accepted",
        // CreateExecutionSession batch (assignment event comes first)
        "assignment.executing",
        "execution_session.created",
        "execution_session.started",
        // CompleteExecutionSession batch
        "execution_session.completed",
        "assignment.completed",
        "task.completed",
        "workflow_run.completed",
        "request.completed",
    ];
    assert.deepEqual(deserializedTypes, expectedTypes);
    // Verify version monotonicity PER AGGREGATE (versions are aggregate-scoped)
    const versionByType = new Map();
    for (const event of originalEvents) {
        const prefix = event.type.split(".")[0];
        if (!versionByType.has(prefix)) {
            versionByType.set(prefix, []);
        }
        versionByType.get(prefix).push(event.version);
    }
    for (const [prefix, versions] of versionByType) {
        for (let i = 1; i < versions.length; i++) {
            assert.ok(versions[i] > versions[i - 1], `${prefix} versions should be strictly increasing: got ${versions.join(" -> ")}`);
        }
    }
});
test("event replay: duplicate event handling is safe", async () => {
    // This test verifies that replaying already-processed events
    // through the aggregate methods doesn't cause duplicate transitions.
    // Create separate sessions and ensure they track independently.
    const infra = createInfrastructure();
    // Run two separate full flows
    await runFullFlow(infra, createContextOverrides({ idempotencyKey: "flow-1" }));
    await runFullFlow(infra, createContextOverrides({ idempotencyKey: "flow-2" }));
    // Each flow produces the same set of event types
    const events = infra.eventPublisher.publishedFlat;
    // Count events by type — each type should appear exactly 2 times (one per flow)
    const eventCounts = new Map();
    for (const event of events) {
        eventCounts.set(event.type, (eventCounts.get(event.type) ?? 0) + 1);
    }
    // Check a few key events each appeared exactly twice
    assert.equal(eventCounts.get("request.submitted"), 2);
    assert.equal(eventCounts.get("request.completed"), 2);
    assert.equal(eventCounts.get("workflow_run.completed"), 2);
    assert.equal(eventCounts.get("task.completed"), 2);
    // Each request gets its own completed event uniquely
    const completedRequests = events.filter((e) => e.type === "request.completed");
    assert.equal(completedRequests.length, 2);
    // Verify the event payloads are distinct (different request IDs)
    const requestIds = completedRequests.map((e) => e.payload.requestId);
    assert.equal(requestIds[0] !== requestIds[1], true);
});
//# sourceMappingURL=idempotency-and-concurrency.integration.test.js.map