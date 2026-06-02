import type { Request } from "@kancode/domain";
import { Workflow, WorkflowRun, Task } from "@kancode/domain";
import type { IdGenerator } from "@kancode/application";
export interface PlanResult {
    workflow: Workflow;
    workflowRun: WorkflowRun;
    tasks: Task[];
}
export declare class DefaultWorkflowPlanner {
    private readonly idGenerator;
    constructor(idGenerator: IdGenerator);
    plan(request: Request): PlanResult;
}
//# sourceMappingURL=workflow-planner.d.ts.map