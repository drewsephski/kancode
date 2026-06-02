import { z } from "zod";

export interface BridgeRegistrationMessage {
  bridgeId: string;
  machineId: string;
  machineName: string;
  runtimeNames: string[];
}

export interface BridgeHeartbeatMessage {
  bridgeId: string;
  machineId: string;
  runtimeNames: string[];
}

export interface BridgeAssignmentAcceptedMessage {
  assignmentId: string;
}

export interface BridgeExecutionStartedMessage {
  executionSessionId: string;
}

export interface BridgeExecutionProgressMessage {
  executionSessionId: string;
  sequenceNumber: number;
  message: string;
}

export interface BridgeExecutionCompletedMessage {
  executionSessionId: string;
  outputSummary: string;
}

export interface BridgeExecutionFailedMessage {
  executionSessionId: string;
  errorMessage: string;
}

export type CloudToBridgeMessage =
  | {
      type: "bridge.assign_task";
      payload: {
        assignmentId: string;
        taskId: string;
        workflowRunId: string;
        workspaceId: string;
        requestText: string;
      };
    }
  | {
      type: "bridge.start_execution";
      payload: {
        executionSessionId: string;
        assignmentId: string;
        runtimeName: string;
      };
    }
  | {
      type: "bridge.cancel_execution";
      payload: {
        executionSessionId: string;
        reason: string;
      };
    };

export type BridgeToCloudMessage =
  | { type: "bridge.register"; payload: BridgeRegistrationMessage }
  | { type: "bridge.heartbeat"; payload: BridgeHeartbeatMessage }
  | { type: "bridge.assignment_accepted"; payload: BridgeAssignmentAcceptedMessage }
  | { type: "bridge.execution_started"; payload: BridgeExecutionStartedMessage }
  | { type: "bridge.execution_progress"; payload: BridgeExecutionProgressMessage }
  | { type: "bridge.execution_completed"; payload: BridgeExecutionCompletedMessage }
  | { type: "bridge.execution_failed"; payload: BridgeExecutionFailedMessage };

export interface BridgeAck {
  messageId: string;
  correlationId: string;
  sequenceNumber: number;
  accepted: boolean;
  errorCode?: string;
  errorMessage?: string;
}

export const bridgeAckSchema = z.object({
  messageId: z.string(),
  correlationId: z.string(),
  sequenceNumber: z.number().int().nonnegative(),
  accepted: z.boolean(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
});
