# ExactDelta top-10 release specification v0.6

2026-08-28 JST / TSUCHIYA LAB / **Current release scope**

This specification supersedes v0.5. It preserves the Effect Contract core and two-workflow scope while fixing the largest judging weakness: the external browser-agent call itself now enters the verification gate. The deterministic Run control remains a repeatable judge fallback, not the hero interaction.

## One-sentence product

> **ExactDelta turns the visible selected target into the only permitted application-state delta, gates the external WebMCP call when anything else changes, and retains that identical contract as the repair regression.**

## User, collaboration, and release decision

- **Human:** the developer or QA engineer owns the visible selection and the allowed state transition.
- **Agent:** the browser agent discovers and directly invokes the single context-matched native WebMCP tool.
- **Agent feedback:** the native response preserves the original action result and adds the independent `effectGate` status, verdict, unexpected-change count, and regression ID.
- **Application:** an owned state adapter exposes the independent pre/post snapshot; the tool's return payload is not treated as effect evidence.
- **Decision:** collateral state change blocks the write tool from release; the identical contract must pass after a developer-reviewed repair.

No customer, production incident, market size, paid demand, automatic repair, or universal integration is claimed.

## Locked proof chain

```text
visible selected target + pre-action state
→ generated required + all-unselected-unchanged Effect Contract
→ direct external native WebMCP invocation
→ success payload kept separate from application-owned post-state
→ required / unexpected / invariant diff
→ EFFECT GATE BLOCKED
→ gate verdict returned to the invoking browser client
→ downloadable exactdelta.regression.v1 artifact
→ identical regression after handler repair
→ EFFECT GATE PASSED
```

The direct external call and deterministic judge replay use the same registered tool and verifier. The UI must label which path produced the displayed proof.

## First-20-second contract

Without narration or the project description, the final blocked screen must simultaneously expose:

1. the staging/release user and decision;
2. the visible selected target and generated required/forbidden contract;
3. `EXTERNAL WEBMCP CALL · BROWSER CLIENT PATH`;
4. a correct tool, valid argument, and `success: true`;
5. one required and one unexpected state change;
6. `TOOL CALL PASSED`, `REAL-WORLD EFFECT FAILED`, and `EFFECT GATE BLOCKED`.

The repaired screen must show `EFFECT GATE PASSED` and `IDENTICAL REGRESSION PASS` with the same regression ID, contract, and tool arguments.

## Competitive claim boundary

- WebMCP Evals addresses model/tool selection.
- webmcpify is a broader integration and declared-result/UI verification pipeline.
- Postcept verifies selected external system-of-record outcomes and issues receipts.
- ExactDelta's demonstrated difference is the generated exact allowed-delta boundary around the page's native WebMCP write and the unchanged contract reused after repair.

Do not claim that ExactDelta replaces Evals, Playwright, webmcpify, Postcept, or conventional tests. Do not claim that those approaches cannot detect the seeded defects. See `COMPETITIVE_REVIEW.md`.

## Official judging evidence target

### WebMCP Leverage

- The page registers only the current native tool, constrains its schema to the visible target/value, and exposes it to the same origin.
- A Codex in-app browser call and an automated native Chrome E2E call both enter the registered tool from outside the deterministic replay control and produce the Effect Contract verdict.
- Removing WebMCP removes the structured agent-facing write boundary and reduces the demonstration to an application-specific test.

### Execution

- The external call, seeded defect, blocked gate, repaired handler, identical regression, and second workflow are runnable.
- Unit, type, build, native Chrome E2E, benchmark, media, console, dependency, secret, and held-release audits must all pass.
- The product remains bounded to two fake-data fixtures and one verifier core.

### Potential Impact

- The real audience and decision are visible: a developer or QA engineer deciding whether a state-changing WebMCP tool can ship.
- The concrete burden is collateral mutation despite a valid call and success return.
- The benchmark shows the narrow authoring difference without claiming market demand or universal coverage.

### Creativity & Ambition

- Human-visible intent becomes a generated falsifiable boundary over observed state rather than a trusted return payload or model score.
- The same artifact blocks release and survives as an identical repair regression.
- A second domain demonstrates verifier reuse without adding a generic dashboard or third workflow.

## Submission lock

Only correctness, judge comprehension, accessibility, release reliability, competitive accuracy, and evidence-integrity fixes may enter. Publication, deployment, repository push, YouTube upload, and final Devpost submission remain owner-gated.

`EXACTDELTA_TOP10_SCOPE_LOCKED`
