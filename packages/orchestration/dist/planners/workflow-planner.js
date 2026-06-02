import { Workflow, WorkflowRun, Task } from "@kancode/domain";
export class DefaultWorkflowPlanner {
    idGenerator;
    constructor(idGenerator) {
        this.idGenerator = idGenerator;
    }
    plan(request) {
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
//# sourceMappingURL=workflow-planner.js.map