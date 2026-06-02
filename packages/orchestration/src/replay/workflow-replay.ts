import type { DomainEventStore, TransitionAuditLog } from "@kancode/application";
import { WorkflowRunStateMachine } from "../process-manager/workflow-run-state-machine.js";
import type { WorkflowRunState, WorkflowRunEventType, StateMachineCommand } from "../process-manager/workflow-run-state-machine.js";

export interface ReplayTransition {
  fromState: WorkflowRunState;
  toState: WorkflowRunState;
  eventType: WorkflowRunEventType;
  commands: StateMachineCommand[];
}

export interface ReplayResult {
  finalState: WorkflowRunState;
  transitions: ReplayTransition[];
}

export class WorkflowReplayService {
  constructor(
    private readonly eventStore: DomainEventStore,
    private readonly stateMachine: WorkflowRunStateMachine,
    private readonly auditLog?: TransitionAuditLog,
  ) {}

  async replay(processId: string): Promise<ReplayResult> {
    const events = await this.eventStore.getAll();
    const processEvents = events.filter((e) => {
      const p = e.payload as Record<string, unknown>;
      return (
        p.id === processId ||
        p.requestId === processId ||
        p.workflowRunId === processId ||
        p.processId === processId
      );
    });

    let currentState: WorkflowRunState = "pending";
    const transitions: ReplayTransition[] = [];

    for (const event of processEvents) {
      const eventType = event.type as WorkflowRunEventType;
      const payload = event.payload as Record<string, unknown>;

      const decision = this.stateMachine.transition(currentState, eventType, payload);

      // Record transition if state changes OR if commands are produced
      if (decision.nextState !== currentState || decision.commands.length > 0) {
        transitions.push({
          fromState: currentState,
          toState: decision.nextState,
          eventType,
          commands: decision.commands,
        });
        currentState = decision.nextState;
      }
    }

    // Reconstruct audit trail if logger provided
    if (this.auditLog) {
      for (const t of transitions) {
        await this.auditLog.record({
          processId,
          fromState: t.fromState,
          toState: t.toState,
          eventType: t.eventType,
          revision: transitions.indexOf(t) + 1,
          occurredAt: new Date(),
        });
      }
    }

    return { finalState: currentState, transitions };
  }

  formatReplay(result: ReplayResult): string {
    const lines: string[] = [];

    for (const t of result.transitions) {
      lines.push(`${t.fromState}`);
      lines.push(`  ${t.eventType}`);
      lines.push(`  → ${t.toState}`);
      if (t.commands.length > 0) {
        for (const cmd of t.commands) {
          lines.push(`    [command: ${cmd.type}]`);
        }
      }
      lines.push("");
    }

    lines.push(`final state: ${result.finalState}`);
    return lines.join("\n");
  }
}
