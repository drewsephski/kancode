export type WorkflowRunState =
  | "pending"
  | "planning"
  | "awaiting_assignment"
  | "awaiting_execution"
  | "executing"
  | "completing"
  | "completed"
  | "failed";

export type WorkflowRunEventType =
  | "request.submitted"
  | "workflow_run.created"
  | "task.created"
  | "task.assigned"
  | "assignment.created"
  | "execution_session.started"
  | "execution_session.completed"
  | "execution_session.failed"
  | "request.completed";

export interface StateMachineCommand {
  type: "plan" | "assign" | "create_session" | "publish_assignment";
  payload: Record<string, string>;
}

export interface StateMachineDecision {
  nextState: WorkflowRunState;
  commands: StateMachineCommand[];
}

interface TransitionRule {
  from: WorkflowRunState[];
  on: WorkflowRunEventType;
  to: WorkflowRunState;
  commands?: Array<(payload: Record<string, unknown>) => StateMachineCommand>;
}

const TRANSITIONS: TransitionRule[] = [
  {
    from: ["pending"],
    on: "request.submitted",
    to: "planning",
    commands: [(p) => ({ type: "plan", payload: { requestId: String(p.id ?? "") } })],
  },
  {
    from: ["planning"],
    on: "workflow_run.created",
    to: "awaiting_assignment",
  },
  {
    from: ["awaiting_assignment"],
    on: "task.created",
    to: "awaiting_assignment",
    commands: [(p) => ({ type: "assign", payload: { taskId: String(p.id ?? "") } })],
  },
  {
    from: ["awaiting_assignment"],
    on: "task.assigned",
    to: "awaiting_execution",
    commands: [(p) => ({
      type: "create_session",
      payload: { assignmentId: String(p.assignmentId ?? p.taskId ?? "") },
    })],
  },
  // Bridge delivery path: when assignment.created is picked up from the
  // outbox, publish to the bridge for external execution. This coexists
  // with the task.assigned path — whichever event arrives first "wins"
  // the transition to awaiting_execution, and the second event is safely
  // ignored (from-state no longer matches).
  {
    from: ["awaiting_assignment"],
    on: "assignment.created",
    to: "awaiting_execution",
    commands: [(p) => ({
      type: "publish_assignment",
      payload: { assignmentId: String(p.id ?? ""), taskId: String(p.taskId ?? "") },
    })],
  },
  {
    from: ["awaiting_execution"],
    on: "execution_session.started",
    to: "executing",
  },
  {
    from: ["executing"],
    on: "execution_session.completed",
    to: "completing",
  },
  {
    from: ["completing"],
    on: "request.completed",
    to: "completed",
  },

  // Failure paths
  {
    from: ["executing", "awaiting_execution"],
    on: "execution_session.failed",
    to: "failed",
  },
];

export class WorkflowRunStateMachine {
  transition(
    currentState: WorkflowRunState,
    eventType: WorkflowRunEventType,
    payload: Record<string, unknown>,
  ): StateMachineDecision {
    const rule = TRANSITIONS.find(
      (t) => t.from.includes(currentState) && t.on === eventType,
    );

    if (!rule) {
      return { nextState: currentState, commands: [] };
    }

    return {
      nextState: rule.to,
      commands: rule.commands ? rule.commands.map((fn) => fn(payload)) : [],
    };
  }

  getValidTransitions(state: WorkflowRunState): WorkflowRunEventType[] {
    return TRANSITIONS
      .filter((t) => t.from.includes(state))
      .map((t) => t.on);
  }

  isAccepting(state: WorkflowRunState): boolean {
    return state === "completed" || state === "failed";
  }
}
