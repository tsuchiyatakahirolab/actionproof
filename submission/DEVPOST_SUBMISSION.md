# Devpost submission copy

## Project name

ActionProof

## Tagline

Effect verification for WebMCP actions: correct call, wrong effect, caught.

## Short description

ActionProof generates an Effect Contract from visible human intent and pre-action state, executes the page's native WebMCP tool, independently observes the resulting state, and catches collateral changes that a correct tool call and successful return cannot prove away.

## Inspiration

WebMCP gives browser agents a structured way to act on websites. That makes tool selection and argument validation easier to inspect—but a correct invocation is not the same as a correct resulting state. A handler can accept the right target, return success, and still mutate an unselected record.

We wanted one failure to be understandable without background knowledge: **the agent did everything right; the result was still wrong.**

## What it does

The human selects one target in the application UI. Before the action, ActionProof turns that visible intent and the pre-action snapshot into an Effect Contract:

- the selected record must make the declared transition;
- every unselected record must remain unchanged;
- entity identity and count must remain stable.

The page then executes its registered native WebMCP tool. ActionProof does not trust `success: true`; it independently snapshots the post-action state and separates required changes from unexpected changes. A failed effect becomes a retained regression case. After the handler is repaired, the identical contract, tool arguments, and regression ID must pass.

The demo uses two fictional workflows—order cancellation and permission change—with the same verification core.

## Why this is a WebMCP use case

ActionProof wraps the page-exposed action boundary that WebMCP creates. It registers tools with `document.modelContext.registerTool()`, discovers them with `getTools()`, and invokes them with `executeTool()`. An agent can use those page tools; the deterministic Run control invokes the same native path for a stable judge demo.

Without WebMCP, ActionProof would be a conventional application-specific regression test. With WebMCP, the human's visible intent, the agent's structured page action, and the application's resulting state can be inspected as one proof chain.

## Better human-agent UX

The human does not write a test assertion or decode an agent trace. They select the intended target in the normal UI. ActionProof generates the effect boundary, shows the exact call, separates the tool result from observed state, highlights collateral changes, and preserves a regression that developers can rerun after a fix.

## How we built it

- React 19, TypeScript, and Vite
- Native imperative WebMCP registration and execution
- Typed Effect Contract generation from explicit selection and pre-state
- Deterministic snapshot diff for required, unexpected, and invariant changes
- Two in-memory fake-data action bindings with seeded defect/repair toggles
- Vitest unit coverage and Playwright native-Chrome E2E coverage
- Controlled comparison using the official `webmcp-evals` 0.0.3 trajectory matcher plus manual Playwright state assertions

## Controlled comparison

Across two deterministic native WebMCP workflows, the official Evals matcher passed 2/2 correct calls while collateral defects remained in 2/2 resulting states. Adding four concrete expected-state assertions in Playwright caught both defects and passed unchanged after repair. ActionProof caught both and passed both identical retained regressions using two reusable action bindings and zero per-record expected-state assertions in the scenario definitions.

This is a detection-coverage result, not a runtime-performance, universal-support, or customer-demand claim. ActionProof still requires an application-owned state adapter and an action binding for each action class.

## Challenges

The hardest design constraint was avoiding a dressed-up Playwright wrapper. The Effect Contract had to be generated from visible intent and pre-state, remain inspectable, work across two action classes, and demonstrate a measurable boundary from expected-call matching without exaggerating the comparison.

We also kept native and fallback evidence separate: the UI labels harness mode, while the browser suite requires a real Chrome WebMCP API.

## Accomplishments

- A 20-second silent proof of correct call / failed effect
- One verification core for order and permission workflows
- Deterministic defect → detection → repair → identical regression PASS
- A reproducible, source-visible Evals + Playwright comparison
- No credentials, external writes, private data, or invented customer evidence

## What we learned

An invocation trace answers “what did the agent ask the page to do?” An Effect Contract answers a different question: “what state was allowed to change?” Both are useful, and neither should be presented as a substitute for the other.

## What's next

A production-oriented version would add application-owned server-state adapters, bounded polling for delayed effects, normalization for volatile metadata, and authorization-aware contract scopes. Those extensions are intentionally outside this submission.

## Links

- Live app: `[INSERT AFTER DEPLOYMENT]`
- Public repository: `[INSERT AFTER PUBLICATION]`
- Public demo video: `[INSERT AFTER YOUTUBE UPLOAD]`
- Technical benchmark: `BENCHMARK_REPORT.md` in the repository

## Testing instructions for judges

1. Open the live app in a WebMCP-capable browser.
2. Confirm **Native WebMCP active** when the API is available.
3. Click **Run seeded defect** under Order cancellation.
4. Confirm `TOOL CALL PASSED`, `REAL-WORLD EFFECT FAILED`, and unselected Order #1043 marked `UNEXPECTED`.
5. Click **Run repaired version** and confirm `IDENTICAL REGRESSION PASS`.
6. Switch to Permission change and repeat.

All demo data is fictional and all failures are deliberately seeded.
