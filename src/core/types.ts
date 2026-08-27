export type Scalar = string | number | boolean | null;

export type EntityRecord = {
  id: string;
  [field: string]: Scalar;
};
export type Snapshot = Record<string, EntityRecord>;

export type MutationIntent = {
  field: string;
  value: Scalar;
};

export type ExplicitIntent = {
  workflowId: string;
  resourceLabel: string;
  selectedIds: string[];
  summary: string;
  mutation: MutationIntent;
};

export type RequiredEffect = {
  entityId: string;
  field: string;
  before: Scalar;
  expected: Scalar;
};

export type ForbiddenEffect = {
  entityId: string;
  expectedUnchanged: EntityRecord;
};

export type EffectContract = {
  workflowId: string;
  source: "explicit-ui-selection+pre-action-state";
  required: RequiredEffect[];
  forbidden: ForbiddenEffect[];
  invariants: {
    entityIds: string[];
    entityCount: number;
    exactChangeSet: true;
  };
};

export type StateChange = {
  entityId: string;
  field: string;
  before: Scalar | undefined;
  after: Scalar | undefined;
};

export type ToolCallRecord = {
  name: string;
  arguments: Record<string, Scalar>;
  status: "PASSED" | "FAILED";
  result?: unknown;
  error?: string;
};

export type VerificationResult = {
  verdict: "ACTION_PROVEN" | "FAILED_EFFECT" | "TOOL_CALL_FAILED";
  effectStatus: "PASSED" | "FAILED" | "NOT_EVALUATED";
  toolCall: ToolCallRecord;
  contract: EffectContract;
  observedChanges: StateChange[];
  requiredSatisfied: RequiredEffect[];
  requiredMissing: RequiredEffect[];
  unexpectedChanges: StateChange[];
  invariantViolations: string[];
  regressionCase: {
    id: string;
    workflowId: string;
    intent: ExplicitIntent;
    toolName: string;
    arguments: Record<string, Scalar>;
    contract: EffectContract;
  };
};
