import type { Request, Workflow, WorkflowRun, Task } from "@kancode/domain";
import type { CommandHandler, CommandContext, PlanWorkflowRunCommand, RequestRepository, WorkflowRepository, WorkflowRunRepository, TaskRepository, UnitOfWork, EventPublisher } from "../index.js";
export interface PlanResult {
    workflow: Workflow;
    workflowRun: WorkflowRun;
    tasks: Task[];
}
export interface Planner {
    plan(request: Request): PlanResult;
}
export declare class PlanWorkflowRunHandler implements CommandHandler<PlanWorkflowRunCommand, {
    workflowId: string;
    workflowRunId: string;
}> {
    private readonly requestRepo;
    private readonly workflowRepo;
    private readonly workflowRunRepo;
    private readonly taskRepo;
    private readonly unitOfWork;
    private readonly planner;
    private readonly eventPublisher;
    constructor(requestRepo: RequestRepository, workflowRepo: WorkflowRepository, workflowRunRepo: WorkflowRunRepository, taskRepo: TaskRepository, unitOfWork: UnitOfWork, planner: Planner, eventPublisher: EventPublisher);
    handle(command: PlanWorkflowRunCommand, _context: CommandContext): Promise<{
        workflowId: string;
        workflowRunId: string;
    }>;
}
//# sourceMappingURL=plan-workflow-run.handler.d.ts.map