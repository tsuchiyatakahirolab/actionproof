# Official judging evidence map

The official WebMCP Challenge judging criteria are equally weighted. This map identifies concrete evidence rather than aspirational claims.

## 1. WebMCP Leverage

- **UI:** native badge reports exactly one context-matched tool; `WebMCP` action chip; visible separation of intent, invocation, result, and observed effect; explicit release decision is tied to that native write path.
- **Implementation:** `src/webmcp/bridge.ts` uses `registerTool`, `getTools`, and `executeTool`; tab changes abort the previous registration; exact enums bind arguments to visible intent; `exposedTo` is same-origin.
- **Test:** Playwright launches installed Chrome with `WebMCP,WebMCPTesting`, fails if native mode is absent, and asserts the discoverable tool changes from only `cancel_order` to only `change_user_role` with the visible context.
- **Video:** 17–34 seconds shows the registered action and successful native invocation; narration explains why effect verification wraps the page action boundary.
- **Human-agent UX:** the human declares the target in UI; the agent can invoke the page tool; the application-owned adapter verifies the result without trusting the return payload.

## 2. Execution

- **UI:** the 20-second screen makes the QA/release job, `ONLY`, `success: true`, `UNEXPECTED`, `REQUESTED 1 · CHANGED 2`, the split verdict, and `EFFECT GATE BLOCKED` visible at once.
- **Implementation:** official WebMCP type package, typed contract, exact-change-set semantics, deterministic diff, handler-side intent validation, aborting timeout/tool-failure distinction, required/unexpected/invariant checks, downloadable regression JSON.
- **Breadth without scope creep:** the same core runs order and permission workflows.
- **Verification:** TypeScript check, production build, 8 unit tests, 2 native Chrome E2E tests, console collection, secret scan, and deployment smoke test.
- **Video:** defect → detection → repair → identical PASS is completed on screen.

## 3. Potential Impact

- **User and decision:** a developer or QA engineer must decide whether a state-changing WebMCP tool can ship; a correct invocation alone does not establish the effect evidence needed for that decision.
- **Visible outcome:** a collateral mutation blocks the effect gate; the identical retained regression clears it after repair.
- **Measured evidence:** official Evals 0.0.3 matcher passed 2/2 correct calls, rejected 2/2 wrong-argument negative controls, while 2/2 seeded collateral defects remained. Four manual Playwright state assertions caught both. ActionProof generated the checks from two action bindings.
- **Honesty boundary:** the project claims no customers, incidents, universal adapters, demand, or production readiness.
- **Reusable direction:** explicit Effect Contracts become downloadable CI regression artifacts for action classes in owned SaaS staging environments.

## 4. Creativity & Ambition

- **Conceptual move:** turn visible pre-action intent into a falsifiable contract about post-action state, instead of treating a successful tool return as proof.
- **Inspectable artifact:** required effects, forbidden effects, state diff, and regression identity remain visible and challengeable.
- **Demo moment:** the agent/call can be right while the effect is wrong; the UI makes both simultaneously true rather than collapsing them into one score.
- **Ambition with constraint:** two domains demonstrate portability of the core without claiming zero-configuration universality.

## Judge path

1. Open the live app.
2. Click **Run seeded defect**.
3. Read the split verdict, unexpected row, and blocked effect gate.
4. Click **Run repaired version**.
5. Confirm `EFFECT GATE PASSED` and `IDENTICAL REGRESSION PASS`.
6. Switch to **Permission change** and repeat.
7. Review the controlled benchmark cards and linked report.
