import type { AssignmentRepository, Clock, DeadLetterQueue, DomainEventStore, EventPublisher, ExecutionSessionRepository, IdGenerator, IdempotencyStore, MetricsRecorder, OutboxRepository, RequestRepository, TaskRepository, TransitionAuditLog, WorkflowRepository, WorkflowRunProcessRepository, WorkflowRunRepository, WorkspaceRepository } from "@kancode/application";
import type { DomainEvent } from "@kancode/domain";
import type { SubscriberRegistry } from "@kancode/events";
import { Assignment, ExecutionSession, Request, Task, Workflow, WorkflowRun, Workspace } from "@kancode/domain";
export declare class FakeClock implements Clock {
    #private;
    constructor(frozen?: Date);
    now(): Date;
}
export declare class FakeIdGenerator implements IdGenerator {
    #private;
    next(): string;
}
export declare class FakeRequestRepository implements RequestRepository {
    readonly store: Map<string, Request>;
    getById(id: string): Promise<Request | null>;
    save(request: Request): Promise<void>;
}
export declare class FakeWorkspaceRepository implements WorkspaceRepository {
    readonly store: Map<string, Workspace>;
    getById(id: string): Promise<Workspace | null>;
    save(workspace: Workspace): Promise<void>;
}
export declare class FakeWorkflowRepository implements WorkflowRepository {
    readonly store: Map<string, Workflow>;
    getById(id: string): Promise<Workflow | null>;
    save(workflow: Workflow): Promise<void>;
}
export declare class FakeWorkflowRunRepository implements WorkflowRunRepository {
    readonly store: Map<string, WorkflowRun>;
    getById(id: string): Promise<WorkflowRun | null>;
    save(run: WorkflowRun): Promise<void>;
}
export declare class FakeTaskRepository implements TaskRepository {
    readonly store: Map<string, Task>;
    getById(id: string): Promise<Task | null>;
    save(task: Task): Promise<void>;
}
export declare class FakeAssignmentRepository implements AssignmentRepository {
    readonly store: Map<string, Assignment>;
    getById(id: string): Promise<Assignment | null>;
    save(assignment: Assignment): Promise<void>;
}
export declare class FakeExecutionSessionRepository implements ExecutionSessionRepository {
    readonly store: Map<string, ExecutionSession>;
    getById(id: string): Promise<ExecutionSession | null>;
    save(session: ExecutionSession): Promise<void>;
}
export declare class FakeEventPublisher implements EventPublisher {
    readonly published: DomainEvent[][];
    publish(events: DomainEvent[]): Promise<void>;
    get publishedFlat(): DomainEvent[];
}
export declare class FakeIdempotencyStore implements IdempotencyStore {
    readonly store: Map<string, unknown>;
    has(key: string): Promise<boolean>;
    set(key: string, result: unknown): Promise<void>;
    get<T>(key: string): Promise<T | null>;
    get size(): number;
    clear(): void;
}
export declare class FakeDomainEventStore implements DomainEventStore {
    readonly events: import("@kancode/domain").DomainEvent[];
    append(events: import("@kancode/domain").DomainEvent[]): Promise<void>;
    getByAggregateId(_aggregateId: string): Promise<import("@kancode/domain").DomainEvent[]>;
    getAll(): Promise<import("@kancode/domain").DomainEvent[]>;
}
export declare class FakeOutboxRepository implements OutboxRepository {
    readonly records: Array<{
        id: string;
        workspaceId: string;
        event: import("@kancode/domain").DomainEvent;
        status: "pending" | "dispatched" | "failed";
    }>;
    enqueue(records: Array<{
        id: string;
        workspaceId: string;
        event: import("@kancode/domain").DomainEvent;
        status: "pending" | "dispatched" | "failed";
    }>): Promise<void>;
    getPending(): Promise<{
        id: string;
        workspaceId: string;
        event: import("@kancode/domain").DomainEvent;
        status: "pending" | "dispatched" | "failed";
    }[]>;
    markDispatched(ids: string[]): Promise<void>;
}
export declare class InMemorySubscriberRegistry implements SubscriberRegistry {
    private readonly handlers;
    register(eventType: string, handler: (event: DomainEvent) => Promise<void>): void;
    getHandlers(eventType: string): ReadonlyArray<(event: DomainEvent) => Promise<void>>;
}
export declare class FakeWorkflowRunProcessRepository implements WorkflowRunProcessRepository {
    readonly store: Map<string, import("@kancode/application").WorkflowRunProcess>;
    save(process: import("@kancode/application").WorkflowRunProcess): Promise<void>;
    getById(id: string): Promise<import("@kancode/application").WorkflowRunProcess | null>;
    getByWorkflowRunId(workflowRunId: string): Promise<import("@kancode/application").WorkflowRunProcess | null>;
}
export declare class FakeTransitionAuditLog implements TransitionAuditLog {
    readonly entries: import("@kancode/application").TransitionAuditEntry[];
    record(entry: import("@kancode/application").TransitionAuditEntry): Promise<void>;
    getByProcessId(processId: string): Promise<import("@kancode/application").TransitionAuditEntry[]>;
}
export declare class FakeDeadLetterQueue implements DeadLetterQueue {
    readonly entries: import("@kancode/application").DeadLetterEntry[];
    enqueue(outboxId: string, event: import("@kancode/domain").DomainEvent, error: Error, retryCount: number): Promise<void>;
    getAll(): Promise<import("@kancode/application").DeadLetterEntry[]>;
}
export declare class FakeMetricsRecorder implements MetricsRecorder {
    readonly increments: Array<{
        metric: string;
        tags?: Record<string, string>;
    }>;
    readonly gauges: Array<{
        metric: string;
        value: number;
        tags?: Record<string, string>;
    }>;
    readonly timings: Array<{
        metric: string;
        ms: number;
        tags?: Record<string, string>;
    }>;
    increment(metric: string, tags?: Record<string, string>): Promise<void>;
    gauge(metric: string, value: number, tags?: Record<string, string>): Promise<void>;
    timing(metric: string, ms: number, tags?: Record<string, string>): Promise<void>;
    countMetric(name: string): number;
}
//# sourceMappingURL=index.d.ts.map