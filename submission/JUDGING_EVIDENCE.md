# Official judging evidence map

The official WebMCP Challenge judging criteria are equally weighted. This map identifies concrete evidence rather than aspirational claims.

## 1. WebMCP Leverage

- **UI:** native badge reports exactly one context-matched tool; the real-agent handoff prompt is visible; `EXTERNAL WEBMCP CALL · BROWSER CLIENT PATH` distinguishes a direct call from deterministic replay; intent, invocation, result, and observed effect remain separate.
- **Implementation:** `src/webmcp/bridge.ts` uses `registerTool`, `getTools`, and `executeTool`; a removed-before-use read-only probe safely resolves object versus JSON-string native inputs without retrying a write; tab changes abort the previous registration; exact enums bind arguments to visible intent; `exposedTo` is same-origin.
- **Test:** Playwright launches installed Chrome with `WebMCP,WebMCPTesting`, fails if native mode is absent, and proves a call issued through `document.modelContext.executeTool()`—without pressing the replay button—produces the blocked Effect Contract verdict plus a schema-versioned executable regression artifact in the same native response. It also asserts the discoverable tool changes from only `cancel_order` to only `change_user_role` with the visible context.
- **In-app browser evidence:** Codex's browser client discovered `cancel_order`, invoked it with `#1042`, and received both `{ success: true }` and `effectGate: { status: "blocked", unexpectedChanges: 1 }`; the held build additionally returns the complete `exactdelta.regression.v1` artifact beside that verdict. The same in-app runtime also used the visible controls to complete block → repair → identical PASS with zero console warnings or errors.
- **Video:** the opening third shows the real-agent prompt, registered action, external native invocation, and successful return before revealing the effect failure.
- **Static judging:** gallery image 01 contains native WebMCP, the external-call result, requested/observed counts, and release block in one frame; image 02 expands it into the full proof chain.
- **Human-agent UX:** the human declares the target in UI; the agent invokes the page tool; the application-owned adapter verifies the result without trusting the action payload; the same native response returns the separate gate verdict and executable regression so the agent can report the failure and preserve its proof for CI.

## 2. Execution

- **UI:** the first viewport now contains a dedicated Effect Trace with accepted `cancel_order(#1042)`, `success: true`, permitted `#1042 only`, observed `#1042 + #1043`, the collateral target visually isolated, and `RELEASE BLOCKED`; the same visual grammar adapts to `Alice only` versus `Alice + Bob`. The detailed 20-second screen adds the QA/release job, `ONLY`, `UNEXPECTED`, `REQUESTED 1 · CHANGED 2`, and split verdict.
- **Implementation:** official WebMCP type package, typed contract, exact-change-set semantics, deterministic diff, handler-side intent validation, aborting timeout/tool-failure distinction, required/unexpected/invariant checks, downloadable regression JSON, schema-validating JSON-driven CI runner, and a public application-owned adapter API.
- **Breadth without scope creep:** the same core runs order and permission workflows.
- **Verification:** TypeScript check, production build, 28 unit tests, four JSON-driven regression executions, 9 native Chrome E2E tests including real target/schema rebinding, both native input dialects with exactly-once application writes, repeated no-op rejection, identity/invariant and delimiter-collision controls, generic consumer execution/replay, argument-drift rejection before write, concurrent-call fail-closed, 1280×720 first-viewport behavior, no-premature-PASS timing, automated WCAG A/AA checks, console collection, secret scan, and held-build smoke test.
- **Package evidence:** typed ESM public API, zero runtime dependencies, 10,804-byte bundle, generated declarations, strict NodeNext consumer typecheck, and an actual tarball install into a fresh project. A third support-ticket adapter detects `FAILED_EFFECT` and then replays the identical artifact to `ACTION_PROVEN`; the dry-run package is 16.1 KB. The demo invokes the same public gate.
- **Delivery quality:** a deterministic build gate measures 70,536 gzip bytes of emitted JavaScript and 5,942 gzip bytes of CSS, rejects external runtime assets and source maps, and validates social metadata. Three declared-condition cold Chrome desktop runs passed with worst TTFB 18 ms, FCP/LCP 1,312 ms, TBT 0 ms, CLS 0.0007, zero cross-origin runtime requests, zero automated WCAG A/AA violations, and zero console errors. One-shot visual sequencing never lowers text opacity and respects reduced motion. These are bounded lab results, not field data or a Lighthouse score.
- **Video:** defect → detection → repair → identical PASS is completed on screen.
- **Static judging:** gallery images 02 and 03 form a before/after pair with the same order, contract, call, and regression identity.

## 3. Potential Impact

- **User and decision:** a developer or QA engineer must decide whether a state-changing WebMCP tool can ship; a correct invocation alone does not establish the effect evidence needed for that decision.
- **Standards-derived problem evidence:** WebMCP's security discussion states that declared intent is not guaranteed to match actual behavior and that agents cannot confirm real effects from tool descriptions; ExactDelta demonstrates the accidental collateral-mutation case rather than claiming to solve malicious-code containment or authorization.
- **Visible outcome:** a collateral mutation blocks the effect gate; the identical retained regression clears it after repair.
- **Measured evidence:** official Evals 0.0.4 matcher passed 2/2 correct calls, rejected 2/2 wrong-argument negative controls, while 2/2 seeded collateral defects remained. Four manual Playwright state assertions caught both. ExactDelta generated the checks from two action bindings.
- **Claim boundary:** the project does not claim production incidents, universal adapters, measured market demand, or production certification.
- **Reusable direction:** explicit Effect Contracts become downloadable, executable CI regression artifacts for action classes in owned SaaS staging environments.
- **Integration evidence:** a fresh-project consumer uses the installed SDK without the demo store; a third application supplies visible intent, an independent snapshot, and its action binding, then runs defect detection and identical repair replay.
- **Rules-required collaboration:** gallery and submission copy explicitly show the human declaring the allowed effect, the agent invoking the page action, the application independently observing state, and the developer reusing the retained regression.

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
