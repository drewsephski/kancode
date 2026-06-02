import assert from "node:assert/strict";
import test from "node:test";
import { FakeClock, FakeIdGenerator, FakeRequestRepository, FakeWorkspaceRepository, FakeWorkflowRepository, FakeWorkflowRunRepository, FakeTaskRepository, FakeAssignmentRepository, FakeExecutionSessionRepository, FakeEventPublisher, } from "@kancode/testing";
import { SubmitRequestHandler, PlanWorkflowRunHandler, AssignTaskHandler, CreateExecutionSessionHandler, CompleteExecutionSessionHandler, } from "@kancode/application";
import { DefaultWorkflowPlanner } from "@kancode/orchestration";
test("request to completion end-to-end", async () => {
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
    const completeSessionHandler = new CompleteExecutionSessionHandler(executionSessionRepo, assignmentRepo, taskRepo, workflowRunRepo, requestRepo, unitOfWork, eventPublisher);
    const workspaceId = "workspace-1";
    const context = {
        workspaceId,
        actorId: "user-1",
        correlationId: "corr-1",
        idempotencyKey: "idem-1",
    };
    // ── Step 1: Submit Request ──────────────────────────────────────────────
    const { requestId } = await submitHandler.handle({ type: "request.submit", payload: { requestText: "Build Stripe subscriptions" } }, context);
    const workspace = await workspaceRepo.getById(workspaceId);
    assert.ok(workspace, "workspace should exist");
    assert.equal(workspace.status, "active");
    assert.equal(workspace.name, "Default");
    const request = await requestRepo.getById(requestId);
    assert.ok(request, "request should exist");
    assert.equal(request.status, "submitted");
    assert.equal(request.requestText, "Build Stripe subscriptions");
    assert.equal(request.version, 1);
    // ── Step 2: Plan Workflow Run ──────────────────────────────────────────
    const { workflowId, workflowRunId } = await planHandler.handle({ type: "workflow.plan", payload: { requestId } }, context);
    const workflow = await workflowRepo.getById(workflowId);
    assert.ok(workflow, "workflow should exist");
    assert.equal(workflow.status, "planned");
    const workflowRun = await workflowRunRepo.getById(workflowRunId);
    assert.ok(workflowRun, "workflow run should exist");
    assert.equal(workflowRun.status, "running");
    const plannedRequest = await requestRepo.getById(requestId);
    assert.ok(plannedRequest, "planned request should exist");
    assert.equal(plannedRequest.status, "planned");
    const tasks = [...taskRepo.store.values()];
    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].status, "open");
    assert.equal(tasks[0].workflowRunId, workflowRunId);
    const taskId = tasks[0].id;
    // ── Step 3: Assign Task ─────────────────────────────────────────────────
    const { assignmentId } = await assignHandler.handle({ type: "task.assign", payload: { taskId } }, context);
    const assignedTask = await taskRepo.getById(taskId);
    assert.ok(assignedTask, "assigned task should exist");
    assert.equal(assignedTask.status, "in_progress");
    const assignment = await assignmentRepo.getById(assignmentId);
    assert.ok(assignment, "assignment should exist");
    assert.equal(assignment.status, "accepted");
    // ── Step 4: Create Execution Session ────────────────────────────────────
    const { executionSessionId } = await createSessionHandler.handle({ type: "execution_session.create", payload: { assignmentId, runtimeName: "Claude Code" } }, context);
    const startedAssignment = await assignmentRepo.getById(assignmentId);
    assert.ok(startedAssignment, "started assignment should exist");
    assert.equal(startedAssignment.status, "executing");
    assert.equal(startedAssignment.executionSessionId, executionSessionId);
    const session = await executionSessionRepo.getById(executionSessionId);
    assert.ok(session, "execution session should exist");
    assert.equal(session.status, "started");
    // ── Step 5: Complete Execution Session ──────────────────────────────────
    await completeSessionHandler.handle({ type: "execution_session.complete", payload: { executionSessionId, outputSummary: "All done" } }, context);
    const completedSession = await executionSessionRepo.getById(executionSessionId);
    assert.ok(completedSession, "completed session should exist");
    assert.equal(completedSession.status, "completed");
    const completedAssignment = await assignmentRepo.getById(assignmentId);
    assert.ok(completedAssignment, "completed assignment should exist");
    assert.equal(completedAssignment.status, "completed");
    const completedTask = await taskRepo.getById(taskId);
    assert.ok(completedTask, "completed task should exist");
    assert.equal(completedTask.status, "completed");
    const completedWorkflowRun = await workflowRunRepo.getById(workflowRunId);
    assert.ok(completedWorkflowRun, "completed workflow run should exist");
    assert.equal(completedWorkflowRun.status, "completed");
    const completedRequest = await requestRepo.getById(requestId);
    assert.ok(completedRequest, "completed request should exist");
    assert.equal(completedRequest.status, "completed");
    // ── Verify All Events Were Emitted ──────────────────────────────────────
    const eventTypes = eventPublisher.publishedFlat.map((e) => e.type);
    const expectedEvents = [
        "workspace.created",
        "request.submitted",
        "workflow.created",
        "workflow.planned",
        "workflow_run.created",
        "workflow_run.started",
        "task.created",
        "request.ready_for_planning",
        "request.planned",
        "task.assigned",
        "task.started",
        "assignment.created",
        "assignment.accepted",
        "execution_session.created",
        "execution_session.started",
        "assignment.executing",
        "execution_session.completed",
        "assignment.completed",
        "task.completed",
        "workflow_run.completed",
        "request.completed",
    ];
    for (const expected of expectedEvents) {
        assert.ok(eventTypes.includes(expected), `expected event "${expected}" was not emitted (got [${eventTypes.join(", ")}])`);
    }
    assert.equal(eventTypes.length, expectedEvents.length, "unexpected number of events");
});
//# sourceMappingURL=request-to-completion.integration.test.js.map