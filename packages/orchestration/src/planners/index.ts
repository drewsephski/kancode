import type { WorkflowPlannerInput, WorkflowPlannerOutput } from "../dto/index.js";

export interface WorkflowPlanner {
  plan(input: WorkflowPlannerInput): Promise<WorkflowPlannerOutput>;
}

export * from "./workflow-planner.js";
