import { Assignment, ExecutionSession, Request, Task, Workflow, WorkflowRun, Workspace, } from "@kancode/domain";
export class FakeClock {
    #frozen;
    constructor(frozen) {
        this.#frozen = frozen ?? new Date("2025-01-01T00:00:00.000Z");
    }
    now() {
        return this.#frozen;
    }
}
export class FakeIdGenerator {
    #counter = 0;
    next() {
        this.#counter += 1;
        return `id-${this.#counter}`;
    }
}
export class FakeRequestRepository {
    store = new Map();
    async getById(id) {
        return this.store.get(id) ?? null;
    }
    async save(request) {
        this.store.set(request.id, request);
    }
}
export class FakeWorkspaceRepository {
    store = new Map();
    async getById(id) {
        return this.store.get(id) ?? null;
    }
    async save(workspace) {
        this.store.set(workspace.id, workspace);
    }
}
export class FakeWorkflowRepository {
    store = new Map();
    async getById(id) {
        return this.store.get(id) ?? null;
    }
    async save(workflow) {
        this.store.set(workflow.id, workflow);
    }
}
export class FakeWorkflowRunRepository {
    store = new Map();
    async getById(id) {
        return this.store.get(id) ?? null;
    }
    async save(run) {
        this.store.set(run.id, run);
    }
}
export class FakeTaskRepository {
    store = new Map();
    async getById(id) {
        return this.store.get(id) ?? null;
    }
    async save(task) {
        this.store.set(task.id, task);
    }
}
export class FakeAssignmentRepository {
    store = new Map();
    async getById(id) {
        return this.store.get(id) ?? null;
    }
    async save(assignment) {
        this.store.set(assignment.id, assignment);
    }
}
export class FakeExecutionSessionRepository {
    store = new Map();
    async getById(id) {
        return this.store.get(id) ?? null;
    }
    async save(session) {
        this.store.set(session.id, session);
    }
}
export class FakeEventPublisher {
    published = [];
    async publish(events) {
        this.published.push(events);
    }
    get publishedFlat() {
        return this.published.flat();
    }
}
export class FakeIdempotencyStore {
    store = new Map();
    async has(key) {
        return this.store.has(key);
    }
    async set(key, result) {
        this.store.set(key, result);
    }
    async get(key) {
        if (!this.store.has(key)) {
            return null;
        }
        return this.store.get(key);
    }
    get size() {
        return this.store.size;
    }
    clear() {
        this.store.clear();
    }
}
export class FakeDomainEventStore {
    events = [];
    async append(events) {
        this.events.push(...events);
    }
    async getByAggregateId(_aggregateId) {
        return [...this.events];
    }
    async getAll() {
        return [...this.events];
    }
}
export class FakeOutboxRepository {
    records = [];
    async enqueue(records) {
        this.records.push(...records);
    }
    async getPending() {
        return this.records.filter((r) => r.status === "pending");
    }
    async markDispatched(ids) {
        for (const record of this.records) {
            if (ids.includes(record.id)) {
                record.status = "dispatched";
            }
        }
    }
}
export class InMemorySubscriberRegistry {
    handlers = new Map();
    register(eventType, handler) {
        const existing = this.handlers.get(eventType) ?? [];
        existing.push(handler);
        this.handlers.set(eventType, existing);
    }
    getHandlers(eventType) {
        return this.handlers.get(eventType) ?? [];
    }
}
export class FakeWorkflowRunProcessRepository {
    store = new Map();
    async save(process) {
        this.store.set(process.id, { ...process });
    }
    async getById(id) {
        return this.store.get(id) ?? null;
    }
    async getByWorkflowRunId(workflowRunId) {
        for (const process of this.store.values()) {
            if (process.workflowRunId === workflowRunId)
                return { ...process };
        }
        return null;
    }
}
export class FakeTransitionAuditLog {
    entries = [];
    async record(entry) {
        this.entries.push({ ...entry });
    }
    async getByProcessId(processId) {
        return this.entries.filter((e) => e.processId === processId);
    }
}
export class FakeDeadLetterQueue {
    entries = [];
    async enqueue(outboxId, event, error, retryCount) {
        this.entries.push({
            id: `dlq-${outboxId}`,
            outboxId,
            eventType: event.type,
            eventPayload: event.payload,
            error: error.message,
            retryCount,
            failedAt: new Date(),
        });
    }
    async getAll() {
        return [...this.entries];
    }
}
export class FakeMetricsRecorder {
    increments = [];
    gauges = [];
    timings = [];
    async increment(metric, tags) {
        this.increments.push(tags ? { metric, tags } : { metric });
    }
    async gauge(metric, value, tags) {
        this.gauges.push(tags ? { metric, value, tags } : { metric, value });
    }
    async timing(metric, ms, tags) {
        this.timings.push(tags ? { metric, ms, tags } : { metric, ms });
    }
    countMetric(name) {
        return this.increments.filter((i) => i.metric === name).length;
    }
}
//# sourceMappingURL=index.js.map