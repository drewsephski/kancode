import type { AssignmentRepository, ExecutionSessionRepository, RequestRepository, TaskRepository, WorkflowRepository, WorkflowRunRepository, WorkspaceRepository } from "@kancode/application";
export declare function requestRepositoryTests(createRepo: () => RequestRepository): {
    "save and getById round-trip preserves all fields"(): Promise<void>;
    "getById returns null for non-existent id"(): Promise<void>;
    "save updates existing aggregate"(): Promise<void>;
};
export declare function workspaceRepositoryTests(createRepo: () => WorkspaceRepository): {
    "save and getById round-trip preserves all fields"(): Promise<void>;
    "getById returns null for non-existent id"(): Promise<void>;
    "save preserves state transitions"(): Promise<void>;
};
export declare function workflowRepositoryTests(createRepo: () => WorkflowRepository): {
    "save and getById round-trip preserves all fields"(): Promise<void>;
    "getById returns null for non-existent id"(): Promise<void>;
    "save after plan preserves planned state"(): Promise<void>;
};
export declare function workflowRunRepositoryTests(createRepo: () => WorkflowRunRepository): {
    "save and getById round-trip preserves all fields"(): Promise<void>;
    "getById returns null for non-existent id"(): Promise<void>;
    "save after lifecycle transition"(): Promise<void>;
};
export declare function taskRepositoryTests(createRepo: () => TaskRepository): {
    "save and getById round-trip preserves all fields"(): Promise<void>;
    "getById returns null for non-existent id"(): Promise<void>;
    "save after assign and start"(): Promise<void>;
};
export declare function assignmentRepositoryTests(createRepo: () => AssignmentRepository): {
    "save and getById round-trip preserves all fields"(): Promise<void>;
    "getById returns null for non-existent id"(): Promise<void>;
    "save through full lifecycle"(): Promise<void>;
};
export declare function executionSessionRepositoryTests(createRepo: () => ExecutionSessionRepository): {
    "save and getById round-trip preserves all fields"(): Promise<void>;
    "getById returns null for non-existent id"(): Promise<void>;
    "save after start and complete"(): Promise<void>;
};
//# sourceMappingURL=repository-contracts.d.ts.map