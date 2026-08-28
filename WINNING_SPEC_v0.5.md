# ExactDelta top-award release specification v0.5

2026-08-27 JST / TSUCHIYA LAB / **Current release scope**

This specification keeps the Effect Contract and verification core approved in v0.4. It narrows the product story around one concrete user, moment, and decision so ExactDelta is judged as a coherent product rather than a technical proof of concept.

## One-sentence product

> **ExactDelta is a pre-release effect gate that proves a state-changing WebMCP tool changed exactly what the human authorized—and nothing else.**

## User, moment, and decision

- **User:** developer or QA engineer responsible for an owned SaaS staging environment.
- **Moment:** immediately before a state-changing WebMCP tool is cleared for release.
- **Decision:** can this write tool ship with evidence that its observed application-state transition matches the explicit human intent?
- **Failure burden demonstrated:** a correct tool and correct arguments can return success while an unselected order or user is changed.
- **Product outcome:** collateral change blocks the effect gate; the identical retained regression must pass after repair before the gate clears.

No production incident, market size, measured demand, or universal integration is claimed.

## Locked proof chain

```text
visible human selection + pre-action state
→ generated Effect Contract
→ one context-matched native WebMCP write
→ tool result kept separate from application-owned post-state
→ required / unexpected / invariant diff
→ EFFECT GATE BLOCKED or EFFECT GATE PASSED
→ downloadable exactdelta.regression.v1 CI artifact
→ identical regression after developer-reviewed repair
```

The verifier core, two fixtures, and benchmark remain unchanged. Product framing must not introduce an automatic repair agent, generic test dashboard, model score, production certification, or third workflow.

## First-20-second contract

Without narration or prior description, the screen must expose all of the following:

1. `STAGING QA` and `Release decision: can this WebMCP write tool ship?`
2. a single human-selected target and generated required/forbidden contract;
3. a correct WebMCP tool and schema-bound target;
4. `success: true` kept separate from observed state;
5. one required and one unexpected state change;
6. `TOOL CALL PASSED`, `REAL-WORLD EFFECT FAILED`, and `EFFECT GATE BLOCKED` simultaneously.

The repaired run must visibly switch to `EFFECT GATE PASSED` and preserve the same regression identity, arguments, and contract.

## Official judging evidence target

### WebMCP Leverage

- Native `registerTool()`, `getTools()`, and `executeTool()` are the action boundary under test.
- Only the active visible-context tool is registered; exact enums bind visible target/value; same-origin exposure and cancellation are explicit.
- Removing WebMCP turns the workflow into an ordinary application test and removes the structured page action boundary ExactDelta is designed to gate.

### Execution

- The experience ends in a concrete release decision, not only a diagnostic.
- Two workflows use the same verifier and artifact format.
- The integration guide states the minimum adapter/binding contract and production exclusions.
- Unit, native Chrome E2E, comparison, console, dependency, secret, media, and production checks are reproducible.

### Potential Impact

- The audience and release moment are specific and visible.
- The official Chrome guidance explicitly requires classic deterministic testing for UI updates and intentional side effects before production; ExactDelta demonstrates a generated, inspectable form of that effect test.
- The controlled benchmark proves the narrow gap: correct-call matching succeeds while both seeded state defects remain, and ExactDelta catches both from reusable action bindings.

### Creativity & Ambition

- Visible human intent becomes a falsifiable post-action state contract rather than a model score or trusted success payload.
- The same artifact separates invocation truth from effect truth, blocks a gate, and survives as an identical regression.
- The concept is ambitious in verification semantics while bounded in claims and implementation scope.

## Submission lock

Only changes that improve correctness, judge comprehension, accessibility, release reliability, or evidence integrity may enter after this specification. New product features are deferred.

`EXACTDELTA_TOP_AWARD_SCOPE_LOCKED`
