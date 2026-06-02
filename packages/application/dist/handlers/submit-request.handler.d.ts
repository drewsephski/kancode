import type { CommandHandler, CommandContext, SubmitRequestCommand, WorkspaceRepository, RequestRepository, UnitOfWork, IdGenerator, Clock, EventPublisher } from "../index.js";
export declare class SubmitRequestHandler implements CommandHandler<SubmitRequestCommand, {
    requestId: string;
}> {
    private readonly workspaceRepo;
    private readonly requestRepo;
    private readonly unitOfWork;
    private readonly idGenerator;
    private readonly clock;
    private readonly eventPublisher;
    constructor(workspaceRepo: WorkspaceRepository, requestRepo: RequestRepository, unitOfWork: UnitOfWork, idGenerator: IdGenerator, clock: Clock, eventPublisher: EventPublisher);
    handle(command: SubmitRequestCommand, context: CommandContext): Promise<{
        requestId: string;
    }>;
}
//# sourceMappingURL=submit-request.handler.d.ts.map