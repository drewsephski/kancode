import type { CommandHandler, CommandContext, CompleteExecutionSessionCommand, ExecutionSessionRepository, AssignmentRepository, TaskRepository, WorkflowRunRepository, RequestRepository, UnitOfWork, EventPublisher } from "../index.js";
export declare class CompleteExecutionSessionHandler implements CommandHandler<CompleteExecutionSessionCommand, void> {
    private readonly executionSessionRepo;
    private readonly assignmentRepo;
    private readonly taskRepo;
    private readonly workflowRunRepo;
    private readonly requestRepo;
    private readonly unitOfWork;
    private readonly eventPublisher;
    constructor(executionSessionRepo: ExecutionSessionRepository, assignmentRepo: AssignmentRepository, taskRepo: TaskRepository, workflowRunRepo: WorkflowRunRepository, requestRepo: RequestRepository, unitOfWork: UnitOfWork, eventPublisher: EventPublisher);
    handle(command: CompleteExecutionSessionCommand, _context: CommandContext): Promise<void>;
}
//# sourceMappingURL=complete-execution-session.handler.d.ts.map