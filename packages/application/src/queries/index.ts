/* eslint-disable @typescript-eslint/no-empty-object-type */
export interface Query<TType extends string = string, TPayload = unknown> {
  type: TType;
  payload: TPayload;
}

export interface BaseQuery<TPayload = unknown> extends Query<string, TPayload> {}

export interface GetRequestQuery extends Query<"request.get", { requestId: string }> {}

export interface GetWorkflowRunQuery extends Query<"workflow_run.get", { workflowRunId: string }> {}

export interface ListTasksQuery extends Query<"task.list", { workflowRunId: string }> {}

export type MvpQuery = GetRequestQuery | GetWorkflowRunQuery | ListTasksQuery;
