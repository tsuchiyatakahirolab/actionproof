# Devpost submission copy

## Project name

ExactDelta

## Tagline

A pre-release effect gate for WebMCP writes: correct call, wrong effect, caught.

## Short description

ExactDelta turns the visible selected target into the only permitted application-state delta, gates the external WebMCP call when anything else changes, and retains that identical contract as the repair regression.

## Inspiration

WebMCP gives browser agents a structured way to act on websites. That makes tool selection and argument validation easier to inspect—but a developer or QA engineer deciding whether a write tool can ship still needs evidence about its actual state transition. A handler can accept the right target, return success, and still mutate an unselected record.

The WebMCP security discussion explicitly says a tool's declared intent is not guaranteed to match its behavior and that an agent cannot confirm the real effect from the description alone. Chrome's own Evals guidance recommends classic deterministic tests for UI updates and intentional side effects. ExactDelta makes that effect boundary generated, inspectable, and reusable instead of claiming to replace call evals or application tests.

We wanted one failure to be understandable without background knowledge: **the agent did everything right; the result was still wrong.**

## What it does

In an owned staging environment, the human selects one target in the application UI. Before the action, ExactDelta turns that visible intent and the pre-action snapshot into an Effect Contract:

- the selected record must make the declared transition;
- every unselected record must remain unchanged;
- entity identity and count must remain stable.

The browser agent then directly invokes the registered native WebMCP tool. The invocation itself enters ExactDelta's gate. ExactDelta does not trust `success: true`; it snapshots application-owned post-action state independently of that payload and separates required changes from unexpected changes. The native response preserves the action result and adds an independent `effectGate` verdict so the agent can accurately report whether the release gate passed. A collateral mutation blocks the gate and becomes a downloadable CI regression artifact. After the handler is repaired, the identical contract, tool arguments, and regression ID must pass before the gate clears.

The demo uses two fictional workflows—order cancellation and permission change—with the same verification core.

## Why this is a WebMCP use case

ExactDelta wraps the page-exposed action boundary that WebMCP creates. It registers only the tool relevant to the visible workflow with `document.modelContext.registerTool()`, disposes it when context changes, discovers it with `getTools()`, and invokes it with `executeTool()`. Exact schema enums bind the target and requested value to visible intent, while same-origin exposure narrows who can invoke it. A call from the browser client enters the verifier automatically; the deterministic Run control invokes the same native path as a stable judge fallback.

Without WebMCP, ExactDelta would be a conventional application-specific regression test. With WebMCP, it discovers and executes the same structured write boundary exposed to agents, so the human's visible intent, the agent-facing page action, and the application's resulting state can be inspected as one release proof chain.

## Better human-agent UX

The QA operator does not write a record-specific assertion or decode an agent trace. The visible selected target defines the authorized boundary; the browser agent discovers and invokes the corresponding tool. ExactDelta generates the effect boundary, shows the exact call, separates the tool result from observed state, highlights collateral changes, makes the release decision visible, and preserves a regression that developers can rerun after a fix.

## How we built it

- React 19, TypeScript, and Vite
- OpenAI Codex as the primary development environment; GPT-5.6 for architecture review, test design, and adversarial submission review
- Native imperative WebMCP registration and execution
- Context-matched tool lifecycle, exact visible-intent schemas, and same-origin exposure
- Typed Effect Contract generation from explicit selection and pre-state
- Deterministic snapshot diff for required, unexpected, and invariant changes
- Two in-memory fake-data action bindings with seeded defect/repair toggles
- Visible pre-release gate state and downloadable `exactdelta.regression.v1` CI artifact
- Vitest unit coverage and Playwright native-Chrome E2E coverage
- Controlled comparison using the official `webmcp-evals` 0.0.3 trajectory matcher plus manual Playwright state assertions

## Controlled comparison

Across two deterministic native WebMCP workflows, the official Evals matcher passed 2/2 correct calls, rejected 2/2 wrong-argument controls, and still left collateral defects in 2/2 resulting states. Adding four concrete expected-state assertions in Playwright caught both defects and passed unchanged after repair. ExactDelta caught both and passed both identical retained regressions using two reusable action bindings and zero per-record expected-state assertions in the scenario definitions.

This is a detection-coverage result, not a runtime-performance, universal-support, or customer-demand claim. ExactDelta still requires an application-owned state adapter and an action binding for each action class.

## Challenges

The hardest design constraint was avoiding a dressed-up Playwright wrapper. The Effect Contract had to be generated from visible intent and pre-state, remain inspectable, work across two action classes, and demonstrate a measurable boundary from expected-call matching without exaggerating the comparison.

We also kept native and fallback evidence separate: the UI labels harness mode, while the browser suite requires a real Chrome WebMCP API.

## Accomplishments

- A real browser-client WebMCP invocation that automatically enters the effect gate
- A 20-second silent proof of correct call / failed effect
- An explicit product decision: effect gate blocked on collateral change, passed after identical repair regression
- One verification core for order and permission workflows
- Deterministic defect → detection → repair → identical regression PASS
- A reproducible, source-visible Evals + Playwright comparison
- No credentials, external writes, private data, or invented customer evidence

## What we learned

An invocation trace answers “what did the agent ask the page to do?” An Effect Contract answers a different question: “what state was allowed to change?” Both are useful, and neither should be presented as a substitute for the other. Public tools such as webmcpify already perform competent real-browser result and declared UI-delta verification; ExactDelta's narrower contribution is generating the exact allowed delta and all-unselected-unchanged obligations from the current visible target and pre-state.

## What's next

A production-oriented version would add application-owned server-state adapters, bounded polling for delayed effects, normalization for volatile metadata, authorization-aware contract scopes, and CI enforcement around the retained artifact. Those extensions are intentionally outside this submission.

## Links

- Live app: `https://actionproof.vercel.app`
- Public repository: `https://github.com/tsuchiyatakahirolab/actionproof`
- Public demo video: `[INSERT AFTER YOUTUBE UPLOAD]`
- Technical benchmark: `BENCHMARK_REPORT.md` in the repository
- WebMCP trust-boundary discussion: `https://github.com/webmachinelearning/webmcp/issues/45`
- Chrome Evals guidance: `https://developer.chrome.com/docs/ai/webmcp/evals`

## Testing instructions for judges

1. Open the live app in ChatGPT's in-app browser or another WebMCP-capable browser.
2. Confirm **Native WebMCP · 1 context-matched tool**.
3. Ask the browser agent: `Cancel only the order selected on this page, then report whether the effect gate passes.`
4. Confirm `EXTERNAL WEBMCP CALL`, `TOOL CALL PASSED`, `REAL-WORLD EFFECT FAILED`, `EFFECT GATE BLOCKED`, and unselected Order #1043 marked `UNEXPECTED`.
5. If an agent is unavailable, click **Run seeded defect** to replay the same native path deterministically.
6. Click **Run repaired version** and confirm `EFFECT GATE PASSED` plus `IDENTICAL REGRESSION PASS`.
7. Switch to Permission change and repeat.

All demo data is fictional and all failures are deliberately seeded.
