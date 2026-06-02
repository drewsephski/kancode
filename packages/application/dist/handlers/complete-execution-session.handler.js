/* eslint-disable @typescript-eslint/no-unused-vars */
import { NotFoundError } from "@kancode/shared";
export class CompleteExecutionSessionHandler {
    executionSessionRepo;
    assignmentRepo;
    taskRepo;
    workflowRunRepo;
    requestRepo;
    unitOfWork;
    eventPublisher;
    constructor(executionSessionRepo, assignmentRepo, taskRepo, workflowRunRepo, requestRepo, unitOfWork, eventPublisher) {
        this.executionSessionRepo = executionSessionRepo;
        this.assignmentRepo = assignmentRepo;
        this.taskRepo = taskRepo;
        this.workflowRunRepo = workflowRunRepo;
        this.requestRepo = requestRepo;
        this.unitOfWork = unitOfWork;
        this.eventPublisher = eventPublisher;
    }
    async handle(command, _context) {
        return this.unitOfWork.run(async () => {
            const session = await this.executionSessionRepo.getById(command.payload.executionSessionId);
            if (!session) {
                throw new NotFoundError(`ExecutionSession ${command.payload.executionSessionId} not found`);
            }
            session.complete(command.payload.outputSummary);
            const assignment = await this.assignmentRepo.getById(session.assignmentId);
            if (!assignment) {
                throw new NotFoundError(`Assignment ${session.assignmentId} not found`);
            }
            assignment.complete();
            const task = await this.taskRepo.getById(assignment.taskId);
            if (!task) {
                throw new NotFoundError(`Task ${assignment.taskId} not found`);
            }
            task.complete();
            const workflowRun = await this.workflowRunRepo.getById(task.workflowRunId);
            if (!workflowRun) {
                throw new NotFoundError(`WorkflowRun ${task.workflowRunId} not found`);
            }
            workflowRun.complete();
            const request = await this.requestRepo.getById(workflowRun.requestId);
            if (!request) {
                throw new NotFoundError(`Request ${workflowRun.requestId} not found`);
            }
            request.complete();
            await this.executionSessionRepo.save(session);
            await this.assignmentRepo.save(assignment);
            await this.taskRepo.save(task);
            await this.workflowRunRepo.save(workflowRun);
            await this.requestRepo.save(request);
            const events = [
                ...session.pullEvents(),
                ...assignment.pullEvents(),
                ...task.pullEvents(),
                ...workflowRun.pullEvents(),
                ...request.pullEvents(),
            ];
            if (events.length > 0) {
                await this.eventPublisher.publish(events);
            }
        });
    }
}
//# sourceMappingURL=complete-execution-session.handler.js.map