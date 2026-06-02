import { NotFoundError } from "@kancode/shared";
export class PlanWorkflowRunHandler {
    requestRepo;
    workflowRepo;
    workflowRunRepo;
    taskRepo;
    unitOfWork;
    planner;
    eventPublisher;
    constructor(requestRepo, workflowRepo, workflowRunRepo, taskRepo, unitOfWork, planner, eventPublisher) {
        this.requestRepo = requestRepo;
        this.workflowRepo = workflowRepo;
        this.workflowRunRepo = workflowRunRepo;
        this.taskRepo = taskRepo;
        this.unitOfWork = unitOfWork;
        this.planner = planner;
        this.eventPublisher = eventPublisher;
    }
    async handle(command, _context) {
        return this.unitOfWork.run(async () => {
            const request = await this.requestRepo.getById(command.payload.requestId);
            if (!request) {
                throw new NotFoundError(`Request ${command.payload.requestId} not found`);
            }
            const { workflow, workflowRun, tasks } = this.planner.plan(request);
            await this.requestRepo.save(request);
            await this.workflowRepo.save(workflow);
            await this.workflowRunRepo.save(workflowRun);
            for (const task of tasks) {
                await this.taskRepo.save(task);
            }
            const events = [
                ...request.pullEvents(),
                ...workflow.pullEvents(),
                ...workflowRun.pullEvents(),
                ...tasks.flatMap((t) => t.pullEvents()),
            ];
            if (events.length > 0) {
                await this.eventPublisher.publish(events);
            }
            return { workflowId: workflow.id, workflowRunId: workflowRun.id };
        });
    }
}
//# sourceMappingURL=plan-workflow-run.handler.js.map