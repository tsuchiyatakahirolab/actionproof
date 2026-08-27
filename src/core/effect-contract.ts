import type {
  EffectContract,
  EntityRecord,
  ExplicitIntent,
  Scalar,
  Snapshot,
  StateChange,
  ToolCallRecord,
  VerificationResult,
} from "./types";

const cloneRecord = (record: EntityRecord): EntityRecord => ({ ...record });

export function cloneSnapshot(snapshot: Snapshot): Snapshot {
  return Object.fromEntries(
    Object.entries(snapshot).map(([id, record]) => [id, cloneRecord(record)]),
  );
}
export function generateEffectContract(
  intent: ExplicitIntent,
  before: Snapshot,
): EffectContract {
  if (intent.selectedIds.length === 0) {
    throw new Error("Effect contract requires an explicit UI selection.");
  }

  const selected = new Set(intent.selectedIds);
  const unknownId = intent.selectedIds.find((id) => !before[id]);
  if (unknownId) {
    throw new Error(`Selected entity ${unknownId} is not present in the pre-action state.`);
  }

  return {
    workflowId: intent.workflowId,
    source: "explicit-ui-selection+pre-action-state",
    required: intent.selectedIds.map((entityId) => ({
      entityId,
      field: intent.mutation.field,
      before: before[entityId][intent.mutation.field],
      expected: intent.mutation.value,
    })),
    forbidden: Object.values(before)
      .filter((record) => !selected.has(record.id))
      .map((record) => ({
        entityId: record.id,
        expectedUnchanged: cloneRecord(record),
      })),
    invariants: {
      entityIds: Object.keys(before).sort(),
      entityCount: Object.keys(before).length,
    },
  };
}

export function diffSnapshots(before: Snapshot, after: Snapshot): StateChange[] {
  const entityIds = new Set([...Object.keys(before), ...Object.keys(after)]);
  const changes: StateChange[] = [];

  for (const entityId of entityIds) {
    const previous = before[entityId];
    const next = after[entityId];
    const fields = new Set([
      ...Object.keys(previous ?? {}),
      ...Object.keys(next ?? {}),
    ]);

    for (const field of fields) {
      const previousValue = previous?.[field] as Scalar | undefined;
      const nextValue = next?.[field] as Scalar | undefined;
      if (!Object.is(previousValue, nextValue)) {
        changes.push({ entityId, field, before: previousValue, after: nextValue });
      }
    }
  }

  return changes;
}

function buildRegressionId(intent: ExplicitIntent): string {
  return `${intent.workflowId}__${intent.selectedIds.join("-")}__${intent.mutation.field}`;
}

export function verifyEffect(input: {
  intent: ExplicitIntent;
  contract: EffectContract;
  before: Snapshot;
  after: Snapshot;
  toolCall: ToolCallRecord;
}): VerificationResult {
  const { intent, contract, before, after, toolCall } = input;
  const observedChanges = diffSnapshots(before, after);

  const regressionCase = {
    id: buildRegressionId(intent),
    workflowId: intent.workflowId,
    intent,
    toolName: toolCall.name,
    arguments: toolCall.arguments,
    contract,
  };

  if (toolCall.status === "FAILED") {
    return {
      verdict: "TOOL_CALL_FAILED",
      effectStatus: "NOT_EVALUATED",
      toolCall,
      contract,
      observedChanges,
      requiredSatisfied: [],
      requiredMissing: contract.required,
      unexpectedChanges: observedChanges,
      invariantViolations: [],
      regressionCase,
    };
  }

  const requiredSatisfied = contract.required.filter(
    (effect) => after[effect.entityId]?.[effect.field] === effect.expected,
  );
  const requiredMissing = contract.required.filter(
    (effect) => after[effect.entityId]?.[effect.field] !== effect.expected,
  );

  const requiredKeys = new Set(
    contract.required.map((effect) => `${effect.entityId}:${effect.field}`),
  );
  const unexpectedChanges = observedChanges.filter(
    (change) => !requiredKeys.has(`${change.entityId}:${change.field}`),
  );

  const afterIds = Object.keys(after).sort();
  const invariantViolations: string[] = [];
  if (afterIds.length !== contract.invariants.entityCount) {
    invariantViolations.push(
      `Entity count changed from ${contract.invariants.entityCount} to ${afterIds.length}.`,
    );
  }
  if (afterIds.join("|") !== contract.invariants.entityIds.join("|")) {
    invariantViolations.push("Entity identity set changed.");
  }

  const passed =
    requiredMissing.length === 0 &&
    unexpectedChanges.length === 0 &&
    invariantViolations.length === 0;

  return {
    verdict: passed ? "ACTION_PROVEN" : "FAILED_EFFECT",
    effectStatus: passed ? "PASSED" : "FAILED",
    toolCall,
    contract,
    observedChanges,
    requiredSatisfied,
    requiredMissing,
    unexpectedChanges,
    invariantViolations,
    regressionCase,
  };
}
