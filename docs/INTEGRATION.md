# Integrating the ExactDelta effect gate

ExactDelta is designed for a developer or QA engineer validating a state-changing WebMCP tool in an owned staging environment before release.

The application—not ExactDelta—must own authorization, tool semantics, and the state snapshot. ExactDelta supplies the contract expansion, independent diff, bounded verdict, and retained regression artifact.

## Minimum integration

The repository now builds a typed ESM distribution from `src/exactdelta.ts`. Before registry publication, it can be packed and installed directly from a checkout:

```bash
npm run audit:package
npm pack
npm install ./exactdelta-0.1.0.tgz
```

The package audit creates the tarball, installs it into a fresh temporary project, and runs a third support-ticket workflow through defect detection and identical repair replay. It is not a source-level demo import.
After the repository is public, Git-based installation also builds the SDK through the package `prepare` lifecycle. Registry publication remains an owner-controlled release decision.

Each write action needs four inputs:

1. **Visible intent:** the currently selected resource IDs and requested transition.
2. **Pre/post snapshot adapter:** an authorized, application-owned view of the relevant state.
3. **Action binding:** tool name, arguments, and the single intended field/value transition for that action class.
4. **Native WebMCP executor:** the registered page tool discovered with `getTools()` and invoked with `executeTool()`.

The public SDK flow used by the demo is equivalent to:

```ts
import { runEffectGate } from "exactdelta";

const result = await runEffectGate({
  adapter: {
    readIntent: () => ({
      workflowId: "orders",
      resourceLabel: "order",
      selectedIds: visibleSelection.orderIds,
      summary: "Cancel selected orders",
      mutation: { field: "status", value: "cancelled" },
    }),
    readSnapshot: () => stateAdapter.snapshot(),
  },
  action: {
    toolName: "cancel_order",
    arguments: { order_id: visibleSelection.orderIds[0] },
    execute: invokeNativeWebMcpTool,
  },
});

if (result.verdict !== "ACTION_PROVEN") {
  blockEffectGate(result.regressionCase);
}
```

In this repository, the UI's `runExactDelta()` is a thin demo adapter over this public function, while `createWebMcpBridge()` performs native registration, discovery, execution, timeout cancellation, and explicit fallback labeling.

## What is generated

Given selected Order `#1042` and the pre-action collection, the reusable binding expands into:

- required: `#1042.status` becomes `cancelled`;
- forbidden: every field on each unselected record remains unchanged;
- invariants: entity count and identity set remain unchanged;
- exact change set: no state change outside the required field is accepted.

The owner defines the action semantics once. Record-specific obligations come from the live selection and pre-state, not hand-authored assertions for `#1042`, `#1043`, Alice, or Bob.

## CI artifact

The downloadable `exactdelta.regression.v1` JSON preserves the workflow, explicit intent, tool arguments, and generated Effect Contract. `runRegressionArtifact()` validates that schema, selects the recorded target, rejects intent/argument/contract drift before invoking a write, executes the recorded tool arguments, and rejects any change in the resulting regression identity.

The repository runs both committed artifacts against the seeded and repaired implementations in GitHub Actions:

```bash
npm run regression:ci:all
```

To gate one exported artifact against an application adapter:

```bash
npm run regression:ci -- path/to/artifact.json --implementation repaired --expect ACTION_PROVEN
```

The SDK's `runRegressionWithAdapter()` accepts an application-owned replay adapter and applies the same fail-before-write validation. The included CLI maps the two demo workflow IDs to their `ScenarioStore` adapters. A real integration supplies the corresponding authorized adapter and executor while retaining the same parser and runner. The consumer test proves that this API operates without `ScenarioStore`; the UI demo separately proves that one loaded artifact fails against the seeded handler and passes after the only code-path difference—the reviewed repair.

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
