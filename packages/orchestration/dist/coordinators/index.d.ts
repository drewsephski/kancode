import type { AssignmentCoordinatorInput, AssignmentCoordinatorOutput, ExecutionCoordinatorCompleteInput, ExecutionCoordinatorStartInput, ExecutionCoordinatorStartOutput, WorkflowRunCoordinatorCompleteInput, WorkflowRunCoordinatorStartInput } from "../dto/index.js";
export interface WorkflowRunCoordinator {
    start(input: WorkflowRunCoordinatorStartInput): Promise<void>;
    complete(input: WorkflowRunCoordinatorCompleteInput): Promise<void>;
}
export interface AssignmentCoordinator {
    assign(input: AssignmentCoordinatorInput): Promise<AssignmentCoordinatorOutput>;
}
export interface ExecutionCoordinator {
    start(input: ExecutionCoordinatorStartInput): Promise<ExecutionCoordinatorStartOutput>;
    reportCompletion(input: ExecutionCoordinatorCompleteInput): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map