import type { DomainEvent } from "@kancode/domain";
import type {
  WorkflowRunProcess,
  WorkflowRunProcessRepository,
  TransitionAuditLog,
  MetricsRecorder,
  IdGenerator,
  Clock,
  CommandContext,
  BridgeCommandPublisher,
} from "@kancode/application";
import { WorkflowRunStateMachine } from "./workflow-run-state-machine.js";

export class WorkflowRunProcessManager {
  constructor(
    private readonly processRepo: WorkflowRunProcessRepository,
    private readonly auditLog: TransitionAuditLog,
    private readonly metrics: MetricsRecorder,
    private readonly idGenerator: IdGenerator,
    private readonly clock: Clock,
    private readonly planHandler: {
      handle(command: { type: "workflow.plan"; payload: { requestId: string } }, context: CommandContext): Promise<{ workflowId: string; workflowRunId: string }>;
    },
    private readonly assignHandler: {
      handle(command: { type: "task.assign"; payload: { taskId: string } }, context: CommandContext): Promise<{ assignmentId: string }>;
    },
    private readonly createSessionHandler: {
      handle(command: { type: "execution_session.create"; payload: { assignmentId: string; runtimeName: string } }, context: CommandContext): Promise<{ executionSessionId: string }>;
    },
    private readonly bridgePublisher?: BridgeCommandPublisher,
    private readonly stateMachine = new WorkflowRunStateMachine(),
  ) {}

  async handle(event: DomainEvent, context: CommandContext): Promise<void> {
    const processId = context.correlationId;
    const payload = event.payload as Record<string, unknown>;

    // Create process on first event (request.submitted)
    if (event.type === "request.submitted") {
      const process: WorkflowRunProcess = {
        id: processId,
        workflowRunId: "",
        workspaceId: context.workspaceId,
        state: "pending",
        revision: 0,
        createdAt: this.clock.now(),
        updatedAt: this.clock.now(),
      };
      await this.processRepo.save(process);
    }

    const process = await this.processRepo.getById(processId);
    if (!process) return;

    const fromState = process.state;
    const decision = this.stateMachine.transition(
      process.state,
      event.type as any,
      payload,
    );

    // No transition matched — out-of-order event, safely ignore
    if (decision.nextState === process.state && decision.commands.length === 0) {
      return;
    }

    // Persist new state
    process.state = decision.nextState;
    process.revision += 1;
    process.updatedAt = this.clock.now();
    await this.processRepo.save(process);

    // Record metrics
    await this.metrics.increment("process_manager.transition", {
      from: fromState,
      to: decision.nextState,
      event: event.type,
    });
    if (this.stateMachine.isAccepting(decision.nextState)) {
      await this.metrics.increment("process_manager.terminal", {
        state: decision.nextState,
      });
    }

    // Record audit trail
    await this.auditLog.record({
      processId,
      fromState,
      toState: decision.nextState,
      eventType: event.type,
      revision: process.revision,
      occurredAt: this.clock.now(),
    });

    // Execute commands produced by the state machine
    for (const command of decision.commands) {
      switch (command.type) {
        case "plan": {
          const requestId = command.payload.requestId ?? "";
          await this.planHandler.handle(
            { type: "workflow.plan", payload: { requestId } },
            { ...context, idempotencyKey: `plan-${requestId}` },
          );
          break;
        }
        case "assign": {
          const taskId = command.payload.taskId ?? "";
          await this.assignHandler.handle(
            { type: "task.assign", payload: { taskId } },
            { ...context, idempotencyKey: `assign-${taskId}` },
          );
          break;
        }
        case "create_session": {
          const assignmentId = command.payload.assignmentId ?? "";
          await this.createSessionHandler.handle(
            { type: "execution_session.create", payload: { assignmentId, runtimeName: "Claude Code" } },
            { ...context, idempotencyKey: `execute-${assignmentId}` },
          );
          break;
        }
        case "publish_assignment": {
          if (this.bridgePublisher) {
            const assignmentId = command.payload.assignmentId ?? "";
            const taskId = command.payload.taskId ?? "";
            await this.bridgePublisher.publishAssignment({
              assignmentId,
              taskId,
              workflowRunId: (payload as Record<string, unknown>).workflowRunId as string ?? "",
              workspaceId: context.workspaceId,
            });
          }
          break;
        }
      }
    }
  }
}
