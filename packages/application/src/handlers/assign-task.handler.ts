import { Assignment } from "@kancode/domain";
import { NotFoundError } from "@kancode/shared";
import type {
  CommandHandler,
  CommandContext,
  AssignTaskCommand,
  TaskRepository,
  AssignmentRepository,
  UnitOfWork,
  IdGenerator,
  EventPublisher,
} from "../index.js";

export class AssignTaskHandler implements CommandHandler<AssignTaskCommand, { assignmentId: string }> {
  constructor(
    private readonly taskRepo: TaskRepository,
    private readonly assignmentRepo: AssignmentRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly idGenerator: IdGenerator,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async handle(command: AssignTaskCommand, context: CommandContext): Promise<{ assignmentId: string }> {
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
