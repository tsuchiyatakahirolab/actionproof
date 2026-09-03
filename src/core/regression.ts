import { buildRegressionId, generateEffectContract } from "./effect-contract.js";
import {
  runEffectGate,
  type EffectGateAdapter,
  type ToolExecutor,
} from "./gate.js";
import type { ScenarioStore } from "./scenario.js";
import type {
  EffectContract,
  EntityRecord,
  ExplicitIntent,
  Scalar,
  VerificationResult,
} from "./types.js";

export const REGRESSION_SCHEMA_VERSION = "exactdelta.regression.v1" as const;

export type RegressionArtifact = {
  schemaVersion: typeof REGRESSION_SCHEMA_VERSION;
  generatedAt?: string;
  regressionCase: VerificationResult["regressionCase"];
};

export type RegressionReplayAdapter = EffectGateAdapter & {
  workflowId: string;
  toolName: string;
  prepare: (
    regressionCase: RegressionArtifact["regressionCase"],
  ) => void | Promise<void>;
  readToolArguments: () => Record<string, Scalar>;
  executeTool: ToolExecutor;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isScalar(value: unknown): value is Scalar {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Invalid ExactDelta regression artifact: ${message}`);
}

function validateEntityRecord(value: unknown, path: string): asserts value is EntityRecord {
  assert(isRecord(value), `${path} must be an object.`);
  assert(typeof value.id === "string" && value.id.length > 0, `${path}.id must be a non-empty string.`);
  for (const [field, scalar] of Object.entries(value)) {
    assert(isScalar(scalar), `${path}.${field} must be a JSON scalar.`);
  }
}

function validateIntent(value: unknown): asserts value is ExplicitIntent {
  assert(isRecord(value), "regressionCase.intent must be an object.");
  assert(typeof value.workflowId === "string" && value.workflowId.length > 0, "intent.workflowId is required.");
  assert(typeof value.resourceLabel === "string" && value.resourceLabel.length > 0, "intent.resourceLabel is required.");
  assert(Array.isArray(value.selectedIds) && value.selectedIds.length === 1, "intent.selectedIds must contain exactly one target.");
  assert(value.selectedIds.every((id) => typeof id === "string" && id.length > 0), "intent.selectedIds must contain strings.");
  assert(typeof value.summary === "string" && value.summary.length > 0, "intent.summary is required.");
  assert(isRecord(value.mutation), "intent.mutation must be an object.");
  assert(typeof value.mutation.field === "string" && value.mutation.field.length > 0, "intent.mutation.field is required.");
  assert(isScalar(value.mutation.value), "intent.mutation.value must be a JSON scalar.");
}

function validateContract(value: unknown): asserts value is EffectContract {
  assert(isRecord(value), "regressionCase.contract must be an object.");
  assert(typeof value.workflowId === "string" && value.workflowId.length > 0, "contract.workflowId is required.");
  assert(value.source === "explicit-ui-selection+pre-action-state", "contract.source is unsupported.");
  assert(Array.isArray(value.required) && value.required.length > 0, "contract.required must not be empty.");
  for (const [index, effect] of value.required.entries()) {
    assert(isRecord(effect), `contract.required[${index}] must be an object.`);
    assert(typeof effect.entityId === "string", `contract.required[${index}].entityId is required.`);
    assert(typeof effect.field === "string", `contract.required[${index}].field is required.`);
    assert(isScalar(effect.before) && isScalar(effect.expected), `contract.required[${index}] values must be JSON scalars.`);
  }
  assert(Array.isArray(value.forbidden), "contract.forbidden must be an array.");
  for (const [index, effect] of value.forbidden.entries()) {
    assert(isRecord(effect), `contract.forbidden[${index}] must be an object.`);
    assert(typeof effect.entityId === "string", `contract.forbidden[${index}].entityId is required.`);
    validateEntityRecord(effect.expectedUnchanged, `contract.forbidden[${index}].expectedUnchanged`);
  }
  assert(isRecord(value.invariants), "contract.invariants must be an object.");
  assert(Array.isArray(value.invariants.entityIds), "contract.invariants.entityIds must be an array.");
  assert(value.invariants.entityIds.every((id) => typeof id === "string"), "contract.invariants.entityIds must contain strings.");
  assert(Number.isInteger(value.invariants.entityCount) && (value.invariants.entityCount as number) >= 0, "contract.invariants.entityCount must be a non-negative integer.");
  assert(value.invariants.exactChangeSet === true, "contract.invariants.exactChangeSet must be true.");
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]),
  );
}

export function sameRegressionValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right));
}

export function createRegressionArtifact(
  result: VerificationResult,
  generatedAt = new Date().toISOString(),
): RegressionArtifact {
  return {
    schemaVersion: REGRESSION_SCHEMA_VERSION,
    generatedAt,
    regressionCase: structuredClone(result.regressionCase),
  };
}

export function parseRegressionArtifact(input: unknown): RegressionArtifact {
  const value = typeof input === "string" ? JSON.parse(input) as unknown : input;
  assert(isRecord(value), "root must be an object.");
  assert(value.schemaVersion === REGRESSION_SCHEMA_VERSION, `schemaVersion must be ${REGRESSION_SCHEMA_VERSION}.`);
  if (value.generatedAt !== undefined) {
    assert(typeof value.generatedAt === "string" && !Number.isNaN(Date.parse(value.generatedAt)), "generatedAt must be an ISO-compatible date string.");
  }
  assert(isRecord(value.regressionCase), "regressionCase must be an object.");
  const regressionCase = value.regressionCase;
  assert(typeof regressionCase.id === "string" && regressionCase.id.length > 0, "regressionCase.id is required.");
  assert(typeof regressionCase.workflowId === "string" && regressionCase.workflowId.length > 0, "regressionCase.workflowId is required.");
  validateIntent(regressionCase.intent);
  assert(typeof regressionCase.toolName === "string" && regressionCase.toolName.length > 0, "regressionCase.toolName is required.");
  assert(isRecord(regressionCase.arguments), "regressionCase.arguments must be an object.");
  for (const [name, argument] of Object.entries(regressionCase.arguments)) {
    assert(isScalar(argument), `regressionCase.arguments.${name} must be a JSON scalar.`);
  }
  validateContract(regressionCase.contract);
  assert(regressionCase.workflowId === regressionCase.intent.workflowId, "workflow IDs must agree.");
  assert(regressionCase.workflowId === regressionCase.contract.workflowId, "contract workflow ID must agree.");
  return structuredClone(value) as RegressionArtifact;
}

/**
 * Replays an exported regression against an application-owned adapter.
 * All identity, intent, argument and contract checks happen before the write.
 */
export async function runRegressionWithAdapter(input: {
  artifact: unknown;
  adapter: RegressionReplayAdapter;
  timeoutMs?: number;
}): Promise<VerificationResult> {
  const artifact = parseRegressionArtifact(input.artifact);
  const regression = artifact.regressionCase;
  const { adapter } = input;

  assert(
    regression.workflowId === adapter.workflowId,
    `workflow ${regression.workflowId} does not match adapter workflow ${adapter.workflowId}.`,
  );
  assert(
    regression.toolName === adapter.toolName,
    `tool ${regression.toolName} does not match ${adapter.toolName}.`,
  );

  await adapter.prepare(regression);
  const replayIntent = adapter.readIntent();
  const replayArguments = adapter.readToolArguments();
  assert(
    sameRegressionValue(regression.intent, replayIntent),
    "explicit intent no longer matches the artifact.",
  );
  assert(
    sameRegressionValue(regression.arguments, replayArguments),
    "tool arguments no longer match the artifact.",
  );
  assert(
    regression.id === buildRegressionId(regression.intent),
    "regression ID no longer matches the recorded intent.",
  );

  const before = await adapter.readSnapshot();
  const generatedContract = generateEffectContract(replayIntent, before);
  assert(
    sameRegressionValue(regression.contract, generatedContract),
    "generated Effect Contract no longer matches the artifact.",
  );

  const result = await runEffectGate({
    adapter,
    action: {
      toolName: adapter.toolName,
      arguments: replayArguments,
      execute: adapter.executeTool,
    },
    beforeSnapshot: before,
    timeoutMs: input.timeoutMs,
  });
  assert(
    sameRegressionValue(result.regressionCase, regression),
    "executed regression identity differs from the loaded artifact.",
  );
  return result;
}

export async function runRegressionArtifact(input: {
  artifact: unknown;
  store: ScenarioStore;
  executeTool: ToolExecutor;
  timeoutMs?: number;
}): Promise<VerificationResult> {
  const { store } = input;
  return runRegressionWithAdapter({
    artifact: input.artifact,
    adapter: {
      workflowId: store.definition.id,
      toolName: store.definition.toolName,
      prepare: (regression) => store.select(regression.intent.selectedIds[0]),
      readIntent: () => store.explicitIntent(),
      readToolArguments: () => store.toolArguments(),
      readSnapshot: () => store.snapshot(),
      executeTool: input.executeTool,
    },
    timeoutMs: input.timeoutMs,
  });
}
