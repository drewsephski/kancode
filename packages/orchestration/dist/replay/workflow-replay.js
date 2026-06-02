import { WorkflowRunStateMachine } from "../process-manager/workflow-run-state-machine.js";
export class WorkflowReplayService {
    eventStore;
    stateMachine;
    auditLog;
    constructor(eventStore, stateMachine, auditLog) {
        this.eventStore = eventStore;
        this.stateMachine = stateMachine;
        this.auditLog = auditLog;
    }
    async replay(processId) {
        const events = await this.eventStore.getAll();
        const processEvents = events.filter((e) => {
            const p = e.payload;
            return (p.id === processId ||
                p.requestId === processId ||
                p.workflowRunId === processId ||
                p.processId === processId);
        });
        let currentState = "pending";
        const transitions = [];
        for (const event of processEvents) {
            const eventType = event.type;
            const payload = event.payload;
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
    formatReplay(result) {
        const lines = [];
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
//# sourceMappingURL=workflow-replay.js.map