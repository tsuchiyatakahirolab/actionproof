# Official judging evidence map

The official WebMCP Challenge judging criteria are equally weighted. This map identifies concrete evidence rather than aspirational claims.

## 1. WebMCP Leverage

- **UI:** native badge reports exactly one context-matched tool; the real-agent handoff prompt is visible; `EXTERNAL WEBMCP CALL · BROWSER CLIENT PATH` distinguishes a direct call from deterministic replay; intent, invocation, result, and observed effect remain separate.
- **Implementation:** `src/webmcp/bridge.ts` uses `registerTool`, `getTools`, and `executeTool`; tab changes abort the previous registration; exact enums bind arguments to visible intent; `exposedTo` is same-origin.
- **Test:** Playwright launches installed Chrome with `WebMCP,WebMCPTesting`, fails if native mode is absent, and proves a call issued through `document.modelContext.executeTool()`—without pressing the replay button—produces the blocked Effect Contract verdict. It also asserts the discoverable tool changes from only `cancel_order` to only `change_user_role` with the visible context.
- **In-app browser evidence:** Codex's browser client discovered `cancel_order`, invoked it with `#1042`, and received both `{ success: true }` and `effectGate: { status: "blocked", unexpectedChanges: 1 }`; the UI independently displayed the external-call label, unexpected `#1043` mutation, and blocked gate. Screenshot: `submission/exactdelta-agent-proof.png`.
- **Video:** the opening third shows the real-agent prompt, registered action, external native invocation, and successful return before revealing the effect failure.
- **Human-agent UX:** the human declares the target in UI; the agent invokes the page tool; the application-owned adapter verifies the result without trusting the action payload; the same native response returns the separate gate verdict so the agent can report it.

## 2. Execution

- **UI:** the 20-second screen makes the QA/release job, `ONLY`, `success: true`, `UNEXPECTED`, `REQUESTED 1 · CHANGED 2`, the split verdict, and `EFFECT GATE BLOCKED` visible at once.
- **Implementation:** official WebMCP type package, typed contract, exact-change-set semantics, deterministic diff, handler-side intent validation, aborting timeout/tool-failure distinction, required/unexpected/invariant checks, downloadable regression JSON.
- **Breadth without scope creep:** the same core runs order and permission workflows.
- **Verification:** TypeScript check, production build, 15 unit tests, 6 native Chrome E2E tests including repeated no-op rejection, identity/invariant controls, concurrent-call fail-closed and 1280×720 overflow behavior, console collection, secret scan, and deployment smoke test.
- **Video:** defect → detection → repair → identical PASS is completed on screen.

## 3. Potential Impact

- **User and decision:** a developer or QA engineer must decide whether a state-changing WebMCP tool can ship; a correct invocation alone does not establish the effect evidence needed for that decision.
- **Standards-derived problem evidence:** WebMCP's security discussion states that declared intent is not guaranteed to match actual behavior and that agents cannot confirm real effects from tool descriptions; ExactDelta demonstrates the accidental collateral-mutation case rather than claiming to solve malicious-code containment or authorization.
- **Visible outcome:** a collateral mutation blocks the effect gate; the identical retained regression clears it after repair.
- **Measured evidence:** official Evals 0.0.3 matcher passed 2/2 correct calls, rejected 2/2 wrong-argument negative controls, while 2/2 seeded collateral defects remained. Four manual Playwright state assertions caught both. ExactDelta generated the checks from two action bindings.
- **Claim boundary:** the project does not claim production incidents, universal adapters, measured market demand, or production certification.
- **Reusable direction:** explicit Effect Contracts become downloadable CI regression artifacts for action classes in owned SaaS staging environments.

## 4. Creativity & Ambition

- **Conceptual move:** turn the visible selected target into a generated exact allowed-delta contract about post-action state, instead of treating a successful tool return as proof.
- **Inspectable artifact:** required effects, forbidden effects, state diff, and regression identity remain visible and challengeable.
- **Demo moment:** the agent/call can be right while the effect is wrong; the UI makes both simultaneously true rather than collapsing them into one score.
- **Ambition with constraint:** two domains demonstrate portability of the core without claiming zero-configuration universality.

## Judge path

1. Open the live app.
2. Use the visible prompt with the browser agent; confirm the external-call label.
3. Read the split verdict, unexpected row, and blocked effect gate.
4. Use **Run seeded defect** only as the deterministic fallback.
5. Click **Run repaired version**.
6. Confirm `EFFECT GATE PASSED` and `IDENTICAL REGRESSION PASS`.
7. Switch to **Permission change** and repeat.
8. Review the controlled benchmark cards, public-alternatives review, and linked report.
