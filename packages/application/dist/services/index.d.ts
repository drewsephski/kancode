import type { MvpCommand } from "../commands/index.js";
import type { MvpQuery } from "../queries/index.js";
import type { CommandContext, QueryContext } from "../handlers/index.js";
export interface RequestIntakeService {
    submit(command: MvpCommand, context: CommandContext): Promise<{
        requestId: string;
    }>;
}
export interface WorkflowApplicationService {
    plan(command: MvpCommand, context: CommandContext): Promise<{
        workflowId: string;
        workflowRunId: string;
    }>;
}
export interface AssignmentApplicationService {
    assign(command: MvpCommand, context: CommandContext): Promise<{
        assignmentId: string;
    }>;
}
export interface ExecutionApplicationService {
    execute(command: MvpCommand, context: CommandContext): Promise<{
        executionSessionId: string;
    }>;
}
export interface QueryApplicationService {
    execute(query: MvpQuery, context: QueryContext): Promise<unknown>;
}
//# sourceMappingURL=index.d.ts.map