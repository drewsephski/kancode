import type {
  AssignmentRepository,
  Clock,
  DeadLetterQueue,
  DomainEventStore,
  EventPublisher,
  ExecutionSessionRepository,
  IdGenerator,
  IdempotencyStore,
  MetricsRecorder,
  OutboxRepository,
  RequestRepository,
  TaskRepository,
  TransitionAuditLog,
  WorkflowRepository,
  WorkflowRunProcessRepository,
  WorkflowRunRepository,
  WorkspaceRepository,
} from "@kancode/application";
import type { DomainEvent } from "@kancode/domain";
import type { SubscriberRegistry } from "@kancode/events";
import {
  Assignment,
  ExecutionSession,
  Request,
  Task,
  Workflow,
  WorkflowRun,
  Workspace,
} from "@kancode/domain";

export class FakeClock implements Clock {
  #frozen: Date;

  constructor(frozen?: Date) {
    this.#frozen = frozen ?? new Date("2025-01-01T00:00:00.000Z");
  }

  now(): Date {
    return this.#frozen;
  }
}

export class FakeIdGenerator implements IdGenerator {
  #counter = 0;

  next(): string {
    this.#counter += 1;
    return `id-${this.#counter}`;
  }
}

export class FakeRequestRepository implements RequestRepository {
  readonly store = new Map<string, Request>();

  async getById(id: string): Promise<Request | null> {
    return this.store.get(id) ?? null;
  }

  async save(request: Request): Promise<void> {
    this.store.set(request.id, request);
  }
}

export class FakeWorkspaceRepository implements WorkspaceRepository {
  readonly store = new Map<string, Workspace>();

  async getById(id: string): Promise<Workspace | null> {
    return this.store.get(id) ?? null;
  }

  async save(workspace: Workspace): Promise<void> {
    this.store.set(workspace.id, workspace);
  }
}

export class FakeWorkflowRepository implements WorkflowRepository {
  readonly store = new Map<string, Workflow>();

  async getById(id: string): Promise<Workflow | null> {
    return this.store.get(id) ?? null;
  }

  async save(workflow: Workflow): Promise<void> {
    this.store.set(workflow.id, workflow);
  }
}

export class FakeWorkflowRunRepository implements WorkflowRunRepository {
  readonly store = new Map<string, WorkflowRun>();

  async getById(id: string): Promise<WorkflowRun | null> {
    return this.store.get(id) ?? null;
  }

  async save(run: WorkflowRun): Promise<void> {
    this.store.set(run.id, run);
  }
}

export class FakeTaskRepository implements TaskRepository {
  readonly store = new Map<string, Task>();

  async getById(id: string): Promise<Task | null> {
    return this.store.get(id) ?? null;
  }

  async save(task: Task): Promise<void> {
    this.store.set(task.id, task);
  }
}

export class FakeAssignmentRepository implements AssignmentRepository {
  readonly store = new Map<string, Assignment>();

  async getById(id: string): Promise<Assignment | null> {
    return this.store.get(id) ?? null;
  }

  async save(assignment: Assignment): Promise<void> {
    this.store.set(assignment.id, assignment);
  }
}

export class FakeExecutionSessionRepository implements ExecutionSessionRepository {
  readonly store = new Map<string, ExecutionSession>();

  async getById(id: string): Promise<ExecutionSession | null> {
    return this.store.get(id) ?? null;
  }

  async save(session: ExecutionSession): Promise<void> {
    this.store.set(session.id, session);
  }
}

export class FakeEventPublisher implements EventPublisher {
  readonly published: DomainEvent[][] = [];

  async publish(events: DomainEvent[]): Promise<void> {
    this.published.push(events);
  }

  get publishedFlat(): DomainEvent[] {
    return this.published.flat();
  }
}

export class FakeIdempotencyStore implements IdempotencyStore {
  readonly store = new Map<string, unknown>();

  async has(key: string): Promise<boolean> {
    return this.store.has(key);
  }

  async set(key: string, result: unknown): Promise<void> {
    this.store.set(key, result);
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.store.has(key)) {
      return null;
    }
    return this.store.get(key) as T;
  }

  get size(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }
}

export class FakeDomainEventStore implements DomainEventStore {
  readonly events: import("@kancode/domain").DomainEvent[] = [];

  async append(events: import("@kancode/domain").DomainEvent[]): Promise<void> {
    this.events.push(...events);
  }

  async getByAggregateId(_aggregateId: string): Promise<import("@kancode/domain").DomainEvent[]> {
    return [...this.events];
  }

  async getAll(): Promise<import("@kancode/domain").DomainEvent[]> {
    return [...this.events];
  }
}

export class FakeOutboxRepository implements OutboxRepository {
  readonly records: Array<{
    id: string;
    workspaceId: string;
    event: import("@kancode/domain").DomainEvent;
    status: "pending" | "dispatched" | "failed";
  }> = [];

  async enqueue(
    records: Array<{
      id: string;
      workspaceId: string;
      event: import("@kancode/domain").DomainEvent;
      status: "pending" | "dispatched" | "failed";
    }>,
  ): Promise<void> {
    this.records.push(...records);
  }

  async getPending() {
    return this.records.filter((r) => r.status === "pending");
  }

  async markDispatched(ids: string[]) {
    for (const record of this.records) {
      if (ids.includes(record.id)) {
        record.status = "dispatched";
      }
    }
  }
}

export class InMemorySubscriberRegistry implements SubscriberRegistry {
  private readonly handlers = new Map<string, Array<(event: DomainEvent) => Promise<void>>>();

  register(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
  }

  getHandlers(eventType: string): ReadonlyArray<(event: DomainEvent) => Promise<void>> {
    return this.handlers.get(eventType) ?? [];
  }
}

export class FakeWorkflowRunProcessRepository implements WorkflowRunProcessRepository {
  readonly store = new Map<string, import("@kancode/application").WorkflowRunProcess>();

  async save(process: import("@kancode/application").WorkflowRunProcess): Promise<void> {
    this.store.set(process.id, { ...process });
  }

  async getById(id: string): Promise<import("@kancode/application").WorkflowRunProcess | null> {
    return this.store.get(id) ?? null;
  }

  async getByWorkflowRunId(workflowRunId: string): Promise<import("@kancode/application").WorkflowRunProcess | null> {
    for (const process of this.store.values()) {
      if (process.workflowRunId === workflowRunId) return { ...process };
    }
    return null;
  }
}

export class FakeTransitionAuditLog implements TransitionAuditLog {
  readonly entries: import("@kancode/application").TransitionAuditEntry[] = [];

  async record(entry: import("@kancode/application").TransitionAuditEntry): Promise<void> {
    this.entries.push({ ...entry });
  }

  async getByProcessId(processId: string): Promise<import("@kancode/application").TransitionAuditEntry[]> {
    return this.entries.filter((e) => e.processId === processId);
  }
}

export class FakeDeadLetterQueue implements DeadLetterQueue {
  readonly entries: import("@kancode/application").DeadLetterEntry[] = [];

  async enqueue(
    outboxId: string,
    event: import("@kancode/domain").DomainEvent,
    error: Error,
    retryCount: number,
  ): Promise<void> {
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

  async getAll(): Promise<import("@kancode/application").DeadLetterEntry[]> {
    return [...this.entries];
  }
}

export class FakeMetricsRecorder implements MetricsRecorder {
  readonly increments: Array<{ metric: string; tags?: Record<string, string> }> = [];
  readonly gauges: Array<{ metric: string; value: number; tags?: Record<string, string> }> = [];
  readonly timings: Array<{ metric: string; ms: number; tags?: Record<string, string> }> = [];

  async increment(metric: string, tags?: Record<string, string>): Promise<void> {
    this.increments.push(tags ? { metric, tags } : { metric });
  }

  async gauge(metric: string, value: number, tags?: Record<string, string>): Promise<void> {
    this.gauges.push(tags ? { metric, value, tags } : { metric, value });
  }

  async timing(metric: string, ms: number, tags?: Record<string, string>): Promise<void> {
    this.timings.push(tags ? { metric, ms, tags } : { metric, ms });
  }

  countMetric(name: string): number {
    return this.increments.filter((i) => i.metric === name).length;
  }
}
