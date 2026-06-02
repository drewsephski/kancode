import type { CommandHandler, CommandContext, CreateExecutionSessionCommand, AssignmentRepository, ExecutionSessionRepository, UnitOfWork, IdGenerator, EventPublisher } from "../index.js";
export declare class CreateExecutionSessionHandler implements CommandHandler<CreateExecutionSessionCommand, {
    executionSessionId: string;
}> {
    private readonly assignmentRepo;
    private readonly executionSessionRepo;
    private readonly unitOfWork;
    private readonly idGenerator;
    private readonly eventPublisher;
    constructor(assignmentRepo: AssignmentRepository, executionSessionRepo: ExecutionSessionRepository, unitOfWork: UnitOfWork, idGenerator: IdGenerator, eventPublisher: EventPublisher);
    handle(command: CreateExecutionSessionCommand, context: CommandContext): Promise<{
        executionSessionId: string;
    }>;
}
//# sourceMappingURL=create-execution-session.handler.d.ts.map