# ExactDelta product-evidence specification v0.7

2026-09-03 JST / TSUCHIYA LAB / **Current release scope**

This specification supersedes v0.6 without changing the locked 90-second proof. It addresses the remaining Execution and Potential Impact weakness: the verifier is now a distribution-ready, typed ESM SDK that an application-owned adapter can consume outside the two demo stores.

## One-sentence product

> **ExactDelta turns visible human intent into the only permitted application-state delta, gates the native WebMCP write, and ships the failed contract as an identical repair regression.**

## Product evidence added

- `runEffectGate()` accepts a small application-owned `EffectGateAdapter` and action binding; it has no dependency on the demo `ScenarioStore`.
- `runRegressionWithAdapter()` validates schema, identity, intent, arguments, and regenerated contract before invoking a consumer write.
- `src/exactdelta.ts` is the documented public API and builds as a typed ESM package with no runtime dependencies.
- A package audit type-checks a NodeNext self-reference consumer, imports the built distribution from an external fixture, requires `ACTION_PROVEN`, enforces a 30 KB bundle ceiling, and runs `npm pack --dry-run`.
- The existing order and permission demos now consume the same public gate API rather than owning a separate verifier path.

## Why public real data is not the proof

ExactDelta verifies state-changing actions. Public datasets are normally read-only; copying one into a local mutable demo would add recognizable names but would not prove a real integration. A safe, credible product demonstration therefore uses disposable labeled fixtures and proves portability through an application-owned adapter, installable distribution, and executable consumer test. No external system is mutated and no production-readiness claim is made.

## Locked judge experience

The first viewport, two workflows, seeded defect, repair, identical regression, 90-second video, and five-image gallery remain unchanged except for a compact package-evidence rail below the controlled comparison. The new SDK evidence must not displace the correct-call/wrong-effect proof.

## Claim boundary

- Distribution-ready and consumer-tested does not mean published to npm, production-deployed, adopted, or commercially validated.
- The application still owns authorization, action semantics, snapshot authority, volatile-field normalization, and delayed-effect polling.
- ExactDelta is immediately inspectable and integrable from the public repository after release; registry publication remains an owner decision.

`EXACTDELTA_PRODUCT_EVIDENCE_SCOPE_LOCKED`
