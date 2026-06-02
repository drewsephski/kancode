import { Workspace, Request } from "@kancode/domain";
export class SubmitRequestHandler {
    workspaceRepo;
    requestRepo;
    unitOfWork;
    idGenerator;
    clock;
    eventPublisher;
    constructor(workspaceRepo, requestRepo, unitOfWork, idGenerator, clock, eventPublisher) {
        this.workspaceRepo = workspaceRepo;
        this.requestRepo = requestRepo;
        this.unitOfWork = unitOfWork;
        this.idGenerator = idGenerator;
        this.clock = clock;
        this.eventPublisher = eventPublisher;
    }
    async handle(command, context) {
        return this.unitOfWork.run(async () => {
            const requestId = this.idGenerator.next();
            const workspaceId = context.workspaceId;
            let workspace = await this.workspaceRepo.getById(workspaceId);
            if (!workspace) {
                workspace = Workspace.create({
                    id: workspaceId,
                    name: "Default",
                    slug: "default",
                });
            }
            const request = Request.submit({
                id: requestId,
                workspaceId,
                requestText: command.payload.requestText,
            });
            await this.workspaceRepo.save(workspace);
            await this.requestRepo.save(request);
            const events = [...workspace.pullEvents(), ...request.pullEvents()];
            if (events.length > 0) {
                await this.eventPublisher.publish(events);
            }
            return { requestId };
        });
    }
}
//# sourceMappingURL=submit-request.handler.js.map