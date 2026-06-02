import type { Request } from "@kancode/domain";
import { Workflow, WorkflowRun, Task } from "@kancode/domain";
import type { IdGenerator } from "@kancode/application";

export interface PlanResult {
  workflow: Workflow;
  workflowRun: WorkflowRun;
  tasks: Task[];
}

export class DefaultWorkflowPlanner {
  constructor(private readonly idGenerator: IdGenerator) {}

  plan(request: Request): PlanResult {
    const workflowId = this.idGenerator.next();
    const workflow = Workflow.create({
      id: workflowId,
      workspaceId: request.workspaceId,
      requestId: request.id,
      title: request.requestText,
    });
    workflow.plan();

    const workflowRunId = this.idGenerator.next();
    const workflowRun = WorkflowRun.create({
      id: workflowRunId,
      workspaceId: request.workspaceId,
      workflowId,
      requestId: request.id,
    });
    workflowRun.start();

    const taskId = this.idGenerator.next();
    const task = Task.create({
      id: taskId,
      workspaceId: request.workspaceId,
      workflowRunId,
      title: request.requestText,
      orderIndex: 0,
    });

    request.markReadyForPlanning();
    request.markPlanned();

    return { workflow, workflowRun, tasks: [task] };
  }
}
