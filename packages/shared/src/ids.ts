import { randomUUID } from "node:crypto";

export type Brand<TName extends string, TValue = string> = TValue & {
  readonly __brand: TName;
};

export type SharedId = Brand<"SharedId">;
export type WorkspaceId = Brand<"WorkspaceId">;
export type RequestId = Brand<"RequestId">;
export type WorkflowId = Brand<"WorkflowId">;
export type WorkflowRunId = Brand<"WorkflowRunId">;
export type TaskId = Brand<"TaskId">;
export type AssignmentId = Brand<"AssignmentId">;
export type ExecutionSessionId = Brand<"ExecutionSessionId">;

export interface IdGenerator {
  next(): string;
}

export class UUIDGenerator implements IdGenerator {
  next(): string {
    return randomUUID();
  }
}

export const createId = <T extends string>(value: string) => value as Brand<T>;
