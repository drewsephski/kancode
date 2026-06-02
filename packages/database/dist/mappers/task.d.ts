import { Task } from "@kancode/domain";
export interface TaskRow {
    id: string;
    workspace_id: string;
    workflow_run_id: string;
    title: string;
    description: string | null;
    order_index: number;
    status: string;
    version: number;
}
export declare function taskToRow(domain: Task): TaskRow;
export declare function rowToTask(row: TaskRow): Task;
//# sourceMappingURL=task.d.ts.map