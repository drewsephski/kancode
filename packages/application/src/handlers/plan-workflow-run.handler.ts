/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Request, Workflow, WorkflowRun, Task } from "@kancode/domain";
import { NotFoundError } from "@kancode/shared";
import type {
  CommandHandler,
  CommandContext,
  PlanWorkflowRunCommand,
  RequestRepository,
  WorkflowRepository,
  WorkflowRunRepository,
  TaskRepository,
  UnitOfWork,
  EventPublisher,
} from "../index.js";

export interface PlanResult {
  workflow: Workflow;
  workflowRun: WorkflowRun;
  tasks: Task[];
}

export interface Planner {
  plan(request: Request): PlanResult;
}

export class PlanWorkflowRunHandler implements CommandHandler<PlanWorkflowRunCommand, { workflowId: string; workflowRunId: string }> {
  constructor(
    private readonly requestRepo: RequestRepository,
    private readonly workflowRepo: WorkflowRepository,
    private readonly workflowRunRepo: WorkflowRunRepository,
    private readonly taskRepo: TaskRepository,
    private readonly unitOfWork: UnitOfWork,
    private readonly planner: Planner,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async handle(
    command: PlanWorkflowRunCommand,
    _context: CommandContext,
  ): Promise<{ workflowId: string; workflowRunId: string }> {
    return this.unitOfWork.run(async () => {
      const request = await this.requestRepo.getById(command.payload.requestId);
      if (!request) {
        throw new NotFoundError(`Request ${command.payload.requestId} not found`);
      }

      const { workflow, workflowRun, tasks } = this.planner.plan(request);

      await this.requestRepo.save(request);
      await this.workflowRepo.save(workflow);
      await this.workflowRunRepo.save(workflowRun);
      for (const task of tasks) {
        await this.taskRepo.save(task);
      }

      const events = [
        ...request.pullEvents(),
        ...workflow.pullEvents(),
        ...workflowRun.pullEvents(),
        ...tasks.flatMap((t) => t.pullEvents()),
      ];
      if (events.length > 0) {
        await this.eventPublisher.publish(events);
      }

      return { workflowId: workflow.id, workflowRunId: workflowRun.id };
    });
  }
}
