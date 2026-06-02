import type {
  CommandHandler,
  CommandContext,
  SubmitRequestCommand,
  WorkspaceRepository,
  RequestRepository,
  UnitOfWork,
  IdGenerator,
  Clock,
  EventPublisher,
} from "../index.js";
import { Workspace, Request } from "@kancode/domain";

export class SubmitRequestHandler implements CommandHandler<SubmitRequestCommand, { requestId: string }> {
  constructor(
    private readonly workspaceRepo: WorkspaceRepository,
    private readonly requestRepo: RequestRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly idGenerator: IdGenerator,
    private readonly clock: Clock,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async handle(command: SubmitRequestCommand, context: CommandContext): Promise<{ requestId: string }> {
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
