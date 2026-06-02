import type { Assignment, ExecutionSession, Request, Task, Workflow, WorkflowRun, Workspace } from "@kancode/domain";
import type { DomainEvent } from "@kancode/domain";
export interface RequestRepository {
    getById(id: string): Promise<Request | null>;
    save(request: Request): Promise<void>;
}
export interface WorkspaceRepository {
    getById(id: string): Promise<Workspace | null>;
    save(workspace: Workspace): Promise<void>;
}
export interface WorkflowRepository {
    getById(id: string): Promise<Workflow | null>;
    save(workflow: Workflow): Promise<void>;
}
export interface WorkflowRunRepository {
    getById(id: string): Promise<WorkflowRun | null>;
    save(run: WorkflowRun): Promise<void>;
}
export interface TaskRepository {
    getById(id: string): Promise<Task | null>;
    save(task: Task): Promise<void>;
}
export interface AssignmentRepository {
    getById(id: string): Promise<Assignment | null>;
    save(assignment: Assignment): Promise<void>;
}
export interface ExecutionSessionRepository {
    getById(id: string): Promise<ExecutionSession | null>;
    save(session: ExecutionSession): Promise<void>;
}
export interface UnitOfWork {
    run<T>(work: () => Promise<T>): Promise<T>;
}
export interface EventPublisher {
    publish(events: DomainEvent[]): Promise<void>;
}
export interface EventSubscriber {
    subscribe<TEvent>(eventType: string, handler: (event: TEvent) => Promise<void>): void;
}
export interface Clock {
    now(): Date;
}
export interface IdGenerator {
    next(): string;
}
export type { IdempotencyStore } from "./idempotency-store.js";
export type { DomainEventStore } from "./event-store.js";
export type { OutboxRecord, OutboxRepository } from "./outbox.js";
export type { WorkflowRunProcess, WorkflowRunProcessState, WorkflowRunProcessRepository, } from "./workflow-run-process.js";
export type { TransitionAuditEntry, TransitionAuditLog } from "./transition-audit.js";
export type { DeadLetterEntry, DeadLetterQueue } from "./dead-letter-queue.js";
export type { MetricsRecorder } from "./metrics-recorder.js";
export type { BridgeCommandPublisher } from "./bridge-command-publisher.js";
//# sourceMappingURL=index.d.ts.map