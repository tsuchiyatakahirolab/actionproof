# ExactDelta development record

This file is the compact implementation and release record for the WebMCP Challenge entry. The execution source of truth is [PLANS.md](PLANS.md).

## Product decision

ExactDelta is a pre-release effect gate for state-changing WebMCP tools. The human's visible selection and pre-action state generate an Effect Contract; a native WebMCP call is executed; application-owned post-state is observed independently of the return payload; the gate blocks on collateral change and clears only after the identical retained regression passes.

The product remains intentionally bounded to two disposable in-memory workflows: order cancellation and permission change. No production incident, external transaction, universal adapter, or automatic repair is represented.

## Milestones

| Date | Milestone | Status |
|---|---|---|
| 2026-08-27 | Effect Contract and native WebMCP lifecycle hardening | Complete |
| 2026-08-27 | Official Evals + Playwright controlled comparison | Complete |
| 2026-08-27 | Pre-release gate UI and versioned regression artifact | Complete |
| 2026-08-28 | JSON artifact parser/runner, CI enforcement, and interactive target rebinding | Complete |
| 2026-08-27 | 90-second English demo regeneration and media audit | Complete |
| 2026-08-27 | Held-build local production smoke audit | Complete |
| 2026-08-28 | ExactDelta brand, direct browser-client gate, public competitor review, and 15-second judge proof | Complete |
| 2026-08-28 | Objective adversarial review, no-op/post-failure hardening, and subjective-gate demotion | Complete |
| 2026-08-28 | Cross-browser native input compatibility, first-viewport Effect Trace, temporal verdict hardening, and media regeneration | Complete |
| 2026-08-28 | WCAG semantics/contrast repair plus deterministic build and three-run cold-browser quality gates | Complete |
| 2026-09-03 | Evals 0.0.4 refresh, identity-set collision repair, evidence-language tightening, and complete media regeneration | Complete |
| Release window | Push, promote, public YouTube, Devpost preview | Owner-controlled |

## Reproducible commands

```bash
npm ci
npm run check
npm test
npm run build
npm run test:ui
npm run audit:build
npm run audit:runtime
npm run benchmark
npm run audit:production
npm run demo:record
npm run demo:audit
npm run submission:images
npm audit --audit-level=high
```

The production audit accepts `PRODUCTION_URL` and `AUDIT_OUTPUT` environment variables so a held build can be audited without overwriting the previous public-revision record.

## Current evidence

- 25/25 unit tests pass, including Chrome JSON-string and in-app-browser object input-mode detection, exactly-once application-write enforcement in both modes, artifact parsing, contract/identity-drift fail-before-write, JSON re-execution, repeated no-op rejection, post-mutation failure, client abort, snapshot identity/invariant, entity/field and identity-set delimiter collisions, actual external-argument capture, and validation.
- 9/9 native Chrome WebMCP E2E flows pass, including interactive target reselection and schema rebinding, direct and repeated external tool invocation, concurrent-call fail-closed behavior, 1280×720 judge-path layout, hero Effect Trace transitions, context tool lifecycle, the rule that regression `PASS` cannot render while verification is still running, and automated WCAG A/AA checks before and after the seeded failure.
- `npm run regression:ci:all` loads both committed JSON artifacts and executes each against the seeded defect and repaired implementation; all four expected verdicts and artifact-identity checks pass.
- Codex's in-app browser discovered and directly invoked `cancel_order` through its object-input native API; the UI replay path also completed defect block and identical repair PASS after the compatibility fix, with zero console warnings or errors.
- Official Evals 0.0.4 matcher: 2/2 correct calls matched; 2/2 wrong-argument controls rejected; 2/2 collateral defects remained.
- Manual Playwright: four concrete state assertions detect both defects and pass unchanged after repair.
- ExactDelta: two reusable action bindings, zero per-record expected-state assertions in scenario definitions, two defects detected, two identical regressions passed.
- Demo: 90.00 seconds, H.264 1440×900, AAC English `en-US-AndrewMultilingualNeural` narration. All 26 sentences are separate clips; every measured pause is at least 600 ms. The seeded effect failure is fully visible by 15 seconds. Final SHA-256 is recorded in `submission/FINAL_AUDIT.md`.
- Static judge path: five 1440×900 images reproduce the native hook, failure proof, identical repair, permission portability, and bounded comparison; generation fails on console errors and captions are fixed in `submission/GALLERY.md`.
- Held local production preview: native WebMCP, correct context-matched tool per workflow, `tools=*`, zero console errors; see `submission/private/HELD_PRODUCTION_AUDIT.json` (ignored from public release).
- Deterministic build audit: all emitted JS 70,063 gzip bytes, all CSS 5,492 gzip bytes, HTML 795 gzip bytes, no external runtime assets, no production source maps, complete social metadata, and a validated 1280×720 PNG social card.
- Three cold Chrome desktop lab runs at 40 ms latency / 10 Mbps down / 5 Mbps up / 1x CPU: worst TTFB 28.6 ms, FCP/LCP 1,440 ms, TBT 3 ms, CLS 0.0007, zero cross-origin runtime requests, zero automated WCAG A/AA violations, and zero console errors. This is a bounded lab gate, not field data or a Lighthouse score; raw output is kept in the ignored `submission/private/RUNTIME_QUALITY_AUDIT.json`.
- Public-source review: official issue #45 and Chrome Evals guidance support the bounded trust-gap claim; webmcpify, Postcept, Playwright, Schemathesis, and AgentSynth cap broader novelty claims. The official gallery was still unpublished. See `OBJECTIVE_ADVERSARIAL_REVIEW.md`.
- Latest clean-install rerun plus compatibility regression: typecheck PASS, unit 25/25, native E2E 9/9, four JSON-driven regression executions PASS, build/budget PASS, cold-runtime quality PASS, benchmark PASS, media audit PASS, dependency audit 0 vulnerabilities, secret scan PASS, and held local production audit PASS.

## Release safety

The improved revision is deliberately held locally until the owner-approved release window. The release sequence is documented in `submission/FINAL_CHECKLIST.md`; Codex must stop before the final Devpost submit click.
