export {
  runEffectGate,
  type EffectGateAction,
  type EffectGateAdapter,
  type ToolExecutor,
} from "./core/gate.js";
export {
  buildRegressionId,
  cloneSnapshot,
  diffSnapshots,
  generateEffectContract,
  verifyEffect,
} from "./core/effect-contract.js";
export {
  createRegressionArtifact,
  parseRegressionArtifact,
  REGRESSION_SCHEMA_VERSION,
  runRegressionWithAdapter,
  sameRegressionValue,
  type RegressionArtifact,
  type RegressionReplayAdapter,
} from "./core/regression.js";
export type {
  EffectContract,
  EntityRecord,
  ExplicitIntent,
  ForbiddenEffect,
  MutationIntent,
  RequiredEffect,
  Scalar,
  Snapshot,
  StateChange,
  ToolCallRecord,
  VerificationResult,
} from "./core/types.js";
