import type { DomainEvent } from "@kancode/domain";
import type { WorkflowRunProcessRepository, TransitionAuditLog, MetricsRecorder, IdGenerator, Clock, CommandContext, BridgeCommandPublisher } from "@kancode/application";
import { WorkflowRunStateMachine } from "./workflow-run-state-machine.js";
export declare class WorkflowRunProcessManager {
    private readonly processRepo;
    private readonly auditLog;
    private readonly metrics;
    private readonly idGenerator;
    private readonly clock;
    private readonly planHandler;
    private readonly assignHandler;
    private readonly createSessionHandler;
    private readonly bridgePublisher?;
    private readonly stateMachine;
    constructor(processRepo: WorkflowRunProcessRepository, auditLog: TransitionAuditLog, metrics: MetricsRecorder, idGenerator: IdGenerator, clock: Clock, planHandler: {
        handle(command: {
            type: "workflow.plan";
            payload: {
                requestId: string;
            };
        }, context: CommandContext): Promise<{
            workflowId: string;
            workflowRunId: string;
        }>;
    }, assignHandler: {
        handle(command: {
            type: "task.assign";
            payload: {
                taskId: string;
            };
        }, context: CommandContext): Promise<{
            assignmentId: string;
        }>;
    }, createSessionHandler: {
        handle(command: {
            type: "execution_session.create";
            payload: {
                assignmentId: string;
                runtimeName: string;
            };
        }, context: CommandContext): Promise<{
            executionSessionId: string;
        }>;
    }, bridgePublisher?: BridgeCommandPublisher | undefined, stateMachine?: WorkflowRunStateMachine);
    handle(event: DomainEvent, context: CommandContext): Promise<void>;
}
//# sourceMappingURL=workflow-run-process-manager.d.ts.map