import { Assignment } from "@kancode/domain";
import { NotFoundError } from "@kancode/shared";
export class AssignTaskHandler {
    taskRepo;
    assignmentRepo;
    unitOfWork;
    idGenerator;
    eventPublisher;
    constructor(taskRepo, assignmentRepo, unitOfWork, idGenerator, eventPublisher) {
        this.taskRepo = taskRepo;
        this.assignmentRepo = assignmentRepo;
        this.unitOfWork = unitOfWork;
        this.idGenerator = idGenerator;
        this.eventPublisher = eventPublisher;
    }
    async handle(command, context) {
        return this.unitOfWork.run(async () => {
            const task = await this.taskRepo.getById(command.payload.taskId);
            if (!task) {
                throw new NotFoundError(`Task ${command.payload.taskId} not found`);
            }
            const assignmentId = this.idGenerator.next();
            const assignment = Assignment.create({
                id: assignmentId,
                workspaceId: context.workspaceId,
                taskId: task.id,
            });
            assignment.accept();
            task.assign(assignmentId);
            task.start();
            await this.taskRepo.save(task);
            await this.assignmentRepo.save(assignment);
            const events = [...task.pullEvents(), ...assignment.pullEvents()];
            if (events.length > 0) {
                await this.eventPublisher.publish(events);
            }
            return { assignmentId };
        });
    }
}
//# sourceMappingURL=assign-task.handler.js.map