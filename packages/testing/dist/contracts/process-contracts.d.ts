import type { WorkflowRunProcessRepository } from "@kancode/application";
export declare function workflowRunProcessRepositoryContracts(createRepo: () => WorkflowRunProcessRepository): {
    "save and getById round-trip"(): Promise<void>;
    "getById returns null for non-existent"(): Promise<void>;
    "getByWorkflowRunId returns the correct process"(): Promise<void>;
    "save updates existing process"(): Promise<void>;
};
//# sourceMappingURL=process-contracts.d.ts.map