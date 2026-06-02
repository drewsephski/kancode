import { ExecutionSession } from "@kancode/domain";
import { NotFoundError } from "@kancode/shared";
import type {
  CommandHandler,
  CommandContext,
  CreateExecutionSessionCommand,
  AssignmentRepository,
  ExecutionSessionRepository,
  UnitOfWork,
  IdGenerator,
  EventPublisher,
} from "../index.js";

export class CreateExecutionSessionHandler
  implements CommandHandler<CreateExecutionSessionCommand, { executionSessionId: string }>
{
  constructor(
    private readonly assignmentRepo: AssignmentRepository,
    private readonly executionSessionRepo: ExecutionSessionRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly idGenerator: IdGenerator,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async handle(
    command: CreateExecutionSessionCommand,
    context: CommandContext,
  ): Promise<{ executionSessionId: string }> {
    return this.unitOfWork.run(async () => {
      const assignment = await this.assignmentRepo.getById(command.payload.assignmentId);
      if (!assignment) {
        throw new NotFoundError(`Assignment ${command.payload.assignmentId} not found`);
      }

      const executionSessionId = this.idGenerator.next();
      const session = ExecutionSession.create({
        id: executionSessionId,
        workspaceId: context.workspaceId,
        assignmentId: assignment.id,
        runtimeName: command.payload.runtimeName,
      });
      session.start();

      assignment.start(executionSessionId);

      await this.assignmentRepo.save(assignment);
      await this.executionSessionRepo.save(session);

      const events = [...assignment.pullEvents(), ...session.pullEvents()];
      if (events.length > 0) {
        await this.eventPublisher.publish(events);
      }

      return { executionSessionId };
    });
  }
}
