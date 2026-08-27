# ActionProof Top-10 gate specification v0.4

2026-08-27 JST / TSUCHIYA LAB / **Historical pre-implementation gate: PASS. Full implementation was later authorized in `GO_DECISION.md`.**

This version preserves [v0.3](WINNING_SPEC_v0.3.md) as the concept-selection history and replaces it only for the bounded ActionProof gate described here. The code in this folder is a fictional, disposable gate prototype, not a production product or a customer incident.

## 1. Final problem statement

An agent can invoke the intended WebMCP tool with the intended arguments, receive a successful result, and still leave the application in a state that diverges from the human's explicit intent.

ActionProof's proposition is:

> **ActionProof proves that a WebMCP action changed exactly what the human intended, and nothing else.**

The canonical seeded regression is deliberately narrow:

1. The human selects only Order `#1042`.
2. The agent correctly invokes `cancel_order({ order_id: "#1042" })` through WebMCP.
3. The tool returns `{ success: true }`.
4. The intentionally defective handler cancels both `#1042` and `#1043`.
5. ActionProof independently compares the observed post-action state with a contract generated before the call.
6. It reports one required change and one unexpected change.
7. The same retained regression case passes after the seeded defect is disabled.

No real order, merchant, customer, or model incident is represented.

## 2. Target user and bounded job

**Initial user:** a developer or QA engineer preparing a state-changing WebMCP tool for a SaaS staging environment.

**Job:** verify that the live WebMCP action produces only the state transition implied by the user's current, explicit UI selection.

The gate prototype does not claim proven paid demand, universal site support, production readiness, automated code repair, or complete application safety.

## 3. Competitive boundary

| Adjacent method | What it establishes | ActionProof's visible boundary |
|---|---|---|
| WebMCP Evals | Tool schema/calling and agent workflow evaluation; browser and smoke modes can execute expected calls | ActionProof generates an application-effect contract from the visible selection and pre-action state, then shows required and collateral state changes separately |
| Nekuda WebMCP Workbench | Tool inspection, execution, evaluation, logs, and replay according to its public materials | ActionProof's primary artifact is not a call log; it is the expected-vs-observed effect diff tied to human intent |
| Playwright assertions | A developer can manually encode arbitrary pre/post assertions | ActionProof expands one reusable action binding plus the current selection into per-record required, forbidden, and invariant checks for that run |
| Generic agent evaluation | Can score or compare model behavior | ActionProof does not score the model; it verifies the state transition produced by a live WebMCP write path |
| Generic pre/postcondition framework | Can express state rules for many systems | ActionProof is deliberately scoped to visible human intent, native WebMCP execution, and the resulting browser-application state |

This does **not** establish that adjacent tools are incapable of state assertions. The strongest unresolved product objection remains that WebMCP Evals plus a small Playwright assertion layer may be sufficient for many teams. A fair time/authoring/maintenance comparison is required before a standalone commercial product claim.

Sources inspected for the current boundary:

- [Chrome WebMCP Imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api)
- [Chrome WebMCP overview and local testing flag](https://developer.chrome.com/docs/ai/webmcp)
- [WebMCP Evals README](https://github.com/GoogleChromeLabs/webmcp-tools/tree/main/webmcp-evals)
- [Nekuda WebMCP Workbench listing](https://chromewebstore.google.com/detail/nekuda-webmcp-workbench/amochnnbmnkjjlblolhpddkokhnalkjp)

## 4. Why WebMCP is substantive

The prototype registers two imperative tools with `document.modelContext.registerTool()`. In a WebMCP-enabled Chrome session, the demo runner:

1. asks `document.modelContext.getTools()` for the page's active tools;
2. finds the named tool exposed by the current application;
3. invokes it with `document.modelContext.executeTool()`;
4. records the result separately from the independent observed state.

The automated browser test launches installed Chrome with `--enable-features=WebMCP,WebMCPTesting` and requires the UI to display `Native WebMCP · 1 context-matched tool`. A feature-detected local harness exists only so the visual prototype remains reviewable in browsers without the experimental API; it is explicitly labeled `WebMCP-compatible local harness` and is not presented as a native run.

Removing WebMCP materially changes the demonstrated job: a normal UI test can exercise the human button path, but it does not prove the separately exposed WebMCP write path. A direct JavaScript callback is not accepted as native evidence. At the same time, Playwright plus native WebMCP execution remains a competent implementation alternative; ActionProof's claim is reduced assertion authoring and an intent-first effect artifact, not exclusive detection capability.

## 5. Effect-contract definition

An effect contract is generated **before** tool execution from:

- the records explicitly selected in the visible UI;
- the pre-action snapshot of the relevant resource collection;
- one reusable action binding that declares the target argument and intended field/value transition.

For the order scenario, the action binding says:

```text
tool: cancel_order
target argument: order_id
effect: status -> cancelled
```

From the live selection `[#1042]`, the generator expands this into:

- **required:** `#1042.status` becomes `cancelled`;
- **forbidden/unexpected:** every field of unselected `#1043` remains equal to the pre-action snapshot;
- **invariants:** entity count and entity ID set remain unchanged.

The developer declares the action semantics once; they do not author a new assertion for `#1042`, `#1043`, Alice, or Bob. The target IDs and unchanged records come from current state. This is narrower and more inspectable than asking a model to invent a test oracle, and materially different from hand-writing each concrete Playwright expectation.

The prototype does not claim zero integration work. A real application would require an authorized state adapter and an owner-reviewed action binding for each class of write.

## 6. Minimal architecture

```text
Visible UI selection
        │
        ▼
ExplicitIntent + reusable ActionBinding
        │
        ▼
EffectContract generator ──────── Pre-action snapshot
        │                                  │
        ▼                                  │
Native WebMCP getTools/executeTool          │
        │                                  │
        ├──── Tool result (PASSED/FAILED)  │
        ▼                                  ▼
Application-owned post-action snapshot ── State diff (independent of return payload)
                                           │
                         ┌─────────────────┼──────────────────┐
                         ▼                 ▼                  ▼
                  required changes   unexpected changes   invariants
                         └─────────────────┼──────────────────┘
                                           ▼
                         ACTION_PROVEN / FAILED_EFFECT
                                           │
                                           ▼
                             retained regression case
```

The verifier never infers success from the tool return value. It distinguishes:

- `TOOL_CALL_FAILED`: invocation failed; successful effect is not evaluated;
- `FAILED_EFFECT`: invocation passed, but required/forbidden/invariant checks failed;
- `ACTION_PROVEN`: required changes occurred, no unexpected change occurred, and invariants held for this bounded contract.

`ACTION_PROVEN` is not a certification of the whole application.

## 7. Second-workflow proof

The permission workflow changes only fixture data and the reusable action binding:

```text
visible selection: Alice
tool: change_user_role
target argument: user_id
effect: role -> Editor
```

With the seeded defect, both Alice and Bob become Editors. The same `generateEffectContract()`, `diffSnapshots()`, `verifyEffect()`, `runActionProof()`, native bridge, UI panels, and regression format are used. There is no order- or permission-specific branch in the verification architecture.

## 8. Four mandatory GO conditions

| GO condition | Result | Concrete evidence |
|---|---:|---|
| 1. WebMCP-native architecture | **PASS** | `src/webmcp/bridge.ts`; Chrome E2E requires `Native WebMCP · 1 context-matched tool`; action is discovered and invoked with current `document.modelContext` APIs |
| 2. Effect-contract generation | **PASS** | `src/core/effect-contract.ts`; contract expands current selection and pre-state into required, unexpected, and invariant checks without per-record assertions |
| 3. Generalization beyond orders | **PASS** | Permission fixture plus unit/E2E tests uses the identical generator/verifier/bridge/UI |
| 4. 20-second silent comprehension | **PASS for the implemented gate sequence** | Five visibly separated panels and deterministic 4/4/3/4/5-second reveal; E2E asserts the exact silent labels and state transition |

Condition 4's implementation pass is not a substitute for the separate blind judge audit required by `AGENTS.md`. No unfamiliar human reviewer has yet supplied the four required answers. That remains a submission blocker, not a reason to pretend the implemented sequence is absent.

## 9. Gate decision and limits

The four requested architecture/prototype conditions are satisfied by the bounded implementation. The prototype demonstrates a distinct, comprehensible state-effect artifact rather than a generic dashboard or Playwright wrapper.

The gate does **not** establish standalone commercial superiority. Before authorizing a full build, the owner should decide whether the remaining Evals-plus-assertions objection is acceptable for the hackathon and schedule a blind 20-second audit. No outreach, deployment, account creation, or submission occurred in this gate.

`ACTIONPROOF_TOP10_GATE_PASS`
