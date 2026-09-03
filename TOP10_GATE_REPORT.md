# ExactDelta Top-10 gate report

2026-08-27 JST / Gate record

> **Status update:** the owner formally approved `EXACTDELTA_TOP10_GATE_PASS` on 2026-08-27. The historical gate findings below remain the scope baseline; the earlier implementation hold is superseded by `GO_DECISION.md`.

## Decision

ExactDelta can satisfy the four requested pre-implementation conditions with a small, inspectable architecture. The prototype is not a full product, deployment, market validation, or submission.

## Evidence by mandatory GO condition

### 1. WebMCP-native architecture — PASS

- Both write actions are registered with `document.modelContext.registerTool()` when the API is present.
- The native runner discovers the active page tool with `getTools()` and invokes it with `executeTool()`.
- Playwright launches installed Chrome 151 with `--enable-features=WebMCP,WebMCPTesting` and fails unless the UI reports `Native WebMCP · 1 context-matched tool`.
- Tool result and observed state are separate inputs to the verifier.
- The non-native harness is feature-detected and visibly labeled; it is not counted as native evidence.

Why this is not merely a Playwright wrapper: Playwright only drives and asserts the review UI in the automated test. The application itself registers and executes WebMCP tools, generates the effect contract, snapshots application state, and computes the verdict.

### 2. Effect-contract generation — PASS

- `generateEffectContract()` reads explicit selected IDs, the intended field/value transition, and the pre-action state.
- It creates required effects for selected records, unchanged-record obligations for unselected records, and ID/count invariants.
- No test or application code contains a hand-authored assertion that `#1043` or Bob must remain unchanged. Those entities are automatically included because they were unselected in the pre-state.
- The action binding is reusable metadata for a class of write, not a per-test expected-output script.

### 3. Generalization beyond orders — PASS

- Orders: select `#1042`; correct call; seeded handler also cancels `#1043`; same retained case passes after repair.
- Permissions: select Alice; correct call; seeded handler also promotes Bob; the identical contract generator, state diff, verdict function, WebMCP bridge, and UI detect it.
- Unit and browser tests exercise both flows.

### 4. 20-second silent comprehension — PASS for the implemented gate sequence

- The sequence uses fixed 4/4/3/4/5-second phases.
- Human intent, agent action, tool result, observed effect, and verdict are visually separate.
- The exact contrast appears without narration: `TOOL CALL PASSED` / `OBSERVED EFFECT FAILED`.
- The target row is checked and labeled `ONLY`; the adjacent row is unselected and later labeled `UNEXPECTED`.
- Browser tests assert the essential visible text and result states.

Important limit: this is an implementation/comprehension design pass, not the independent blind-human audit required before submission. No unfamiliar reviewer responses have been collected.

## Historical test evidence at gate time

| Command | Result |
|---|---|
| `npm run check` | PASS — TypeScript project check |
| `npm test` | PASS — 4 verifier tests |
| `npm run build` | PASS — Vite production build |
| `npm run test:ui` | PASS — 2 Chrome E2E tests, including native WebMCP mode and console-error collection |

The tests prove:

- a correct single-target mutation yields `ACTION_PROVEN`;
- a successful call with collateral mutation yields `FAILED_EFFECT`;
- a failed tool call yields `TOOL_CALL_FAILED` and `NOT_EVALUATED`, not a real-world-effect verdict;
- the permission workflow uses the same verifier;
- disabling the seeded defect makes the identical retained order regression pass;
- the main UI produces no console errors in the tested sequence.

Current release-hold evidence has superseded these counts: 25 unit tests, 9 native Chrome E2E tests including exactly-once native input-dialect handling, real target/schema rebinding, direct/repeated external-call gates, identity-set delimiter-collision protection, first-viewport Effect Trace, temporal verdict controls, and automated WCAG A/AA checks; four JSON-driven regression executions; official matcher negative controls; context-matched tool lifecycle assertions; deterministic build/cold-runtime gates; and the full controlled benchmark. See `submission/FINAL_AUDIT.md` and `benchmarks/results/latest.json` for the final record.

## Strongest argument against ExactDelta

> A competent team can add a few Playwright state assertions around official WebMCP Evals, so ExactDelta may be a thin convenience layer rather than a standalone product.

### Was it resolved?

**Partially, at the architecture level; not at the market/comparative level.**

The prototype resolves the narrow technical objection that every concrete state assertion must be manually authored: current selection and pre-state expand automatically into per-record required and unchanged checks, and the same mechanism generalizes to a second resource type. The effect artifact is also visible as the product's center, not hidden in test code.

It does not yet prove that this saves enough work over WebMCP Evals plus Playwright to justify a separate product. No fair authoring-time, maintenance, or detection benchmark was run. That is the strongest remaining objection and must stay in the owner decision.

## Residual risks

1. No independent blind 20-second reviewer audit has been recorded.
2. No fair baseline comparison with WebMCP Evals plus Playwright assertions has been measured.
3. The prototype observes an owned in-memory application state; production adapters, authorization, reset, data isolation, and server-side effects are outside the gate.
4. WebMCP remains experimental and the public deployment path may require an origin-trial configuration; local native testing used the official Chrome testing feature.
5. A second workflow demonstrates architecture portability, not universal zero-configuration support.
6. Paid demand and willingness to adopt are unverified.

## Quality and safety checks

- Deterministic fake orders/users only; no credentials or external writes.
- Seeded defect is labeled on-screen.
- Fix reruns the same selected target, tool arguments, generated contract, and regression ID.
- Native and harness modes are visibly distinct.
- Generated build and test artifacts are ignored.
- No deployment, outreach, submission, public repository, or full product build occurred.

## Final gate verdict

All four requested GO conditions passed for this bounded architecture and prototype. Full implementation was subsequently authorized in `GO_DECISION.md`.

`EXACTDELTA_TOP10_GATE_PASS`
