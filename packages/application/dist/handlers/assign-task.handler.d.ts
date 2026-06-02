import type { CommandHandler, CommandContext, AssignTaskCommand, TaskRepository, AssignmentRepository, UnitOfWork, IdGenerator, EventPublisher } from "../index.js";
export declare class AssignTaskHandler implements CommandHandler<AssignTaskCommand, {
    assignmentId: string;
}> {
    private readonly taskRepo;
    private readonly assignmentRepo;
    private readonly unitOfWork;
    private readonly idGenerator;
    private readonly eventPublisher;
    constructor(taskRepo: TaskRepository, assignmentRepo: AssignmentRepository, unitOfWork: UnitOfWork, idGenerator: IdGenerator, eventPublisher: EventPublisher);
    handle(command: AssignTaskCommand, context: CommandContext): Promise<{
        assignmentId: string;
    }>;
}
//# sourceMappingURL=assign-task.handler.d.ts.map