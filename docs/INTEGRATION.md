# Integrating the ExactDelta effect gate

ExactDelta is designed for a developer or QA engineer validating a state-changing WebMCP tool in an owned staging environment before release.

The application—not ExactDelta—must own authorization, tool semantics, and the state snapshot. ExactDelta supplies the contract expansion, independent diff, bounded verdict, and retained regression artifact.

## Minimum integration

Each write action needs four inputs:

1. **Visible intent:** the currently selected resource IDs and requested transition.
2. **Pre/post snapshot adapter:** an authorized, application-owned view of the relevant state.
3. **Action binding:** tool name, arguments, and the single intended field/value transition for that action class.
4. **Native WebMCP executor:** the registered page tool discovered with `getTools()` and invoked with `executeTool()`.

The core flow used by the demo is equivalent to:

```ts
const before = stateAdapter.snapshot();
const intent = {
  workflowId: "orders",
  resourceLabel: "order",
  selectedIds: visibleSelection.orderIds,
  summary: "Cancel selected orders",
  mutation: { field: "status", value: "cancelled" },
};

const contract = generateEffectContract(intent, before);

const toolCall = await invokeNativeWebMcpTool(
  "cancel_order",
  { order_id: visibleSelection.orderIds[0] },
);

const after = stateAdapter.snapshot();
const result = verifyEffect({ intent, contract, before, after, toolCall });

if (result.verdict !== "ACTION_PROVEN") {
  blockEffectGate(result.regressionCase);
}
```

In this repository, `runExactDelta()` composes the same steps around `ScenarioStore`, while `createWebMcpBridge()` performs native registration, discovery, execution, timeout cancellation, and explicit fallback labeling.

## What is generated

Given selected Order `#1042` and the pre-action collection, the reusable binding expands into:

- required: `#1042.status` becomes `cancelled`;
- forbidden: every field on each unselected record remains unchanged;
- invariants: entity count and identity set remain unchanged;
- exact change set: no state change outside the required field is accepted.

The owner defines the action semantics once. Record-specific obligations come from the live selection and pre-state, not hand-authored assertions for `#1042`, `#1043`, Alice, or Bob.

## CI artifact

The downloadable `exactdelta.regression.v1` JSON preserves the workflow, explicit intent, tool arguments, and generated Effect Contract. The demo proves that the same artifact identity and contract fail against the seeded handler and pass after the only code-path difference—the reviewed repair.

The artifact is evidence for this bounded effect contract. It is not an application-wide security certificate.

## Production requirements outside this prototype

Before applying this pattern to a real system, the site owner must add:

- authenticated, authorization-aware server-state adapters;
- data isolation and disposable staging fixtures;
- bounded polling for delayed or eventually consistent effects;
- normalization or exclusions for volatile metadata such as timestamps;
- audit retention and access controls appropriate to the application;
- review of every action binding and every state surface considered authoritative.

The hackathon demo intentionally keeps those concerns outside scope and makes no production-readiness or zero-configuration claim.
