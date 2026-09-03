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
| 2026-09-03 | Concrete first-impression proof (`#1042 only` vs. `#1042 + #1043`), accessible one-shot motion, and synchronized gallery/thumbnail/video | Complete |
| 2026-09-03 | Public adapter API, typed ESM distribution, generic regression replay, and fresh-project packed-install audit | Complete |
| 2026-09-04 | Public repository, CI, Vercel promotion, production re-audit, and public YouTube release | Complete |
| 2026-09-04 | Devpost synchronization, preview, and final submission | Complete |

## Reproducible commands

```bash
npm ci
npm run check
npm test
npm run build
npm run test:ui
npm run audit:build
npm run audit:package
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

- 28/28 unit tests pass, including Chrome JSON-string and in-app-browser object input-mode detection, exactly-once application-write enforcement in both modes, artifact parsing, contract/identity-drift fail-before-write, JSON re-execution, repeated no-op rejection, post-mutation failure, client abort, snapshot identity/invariant, entity/field and identity-set delimiter collisions, actual external-argument capture, a consumer adapter independent of `ScenarioStore`, generic repaired-artifact replay, and consumer argument-drift rejection before write.
- The typed ESM SDK builds independently, remains below its 30 KB distribution gate, and passes a strict NodeNext consumer typecheck. The audit then packs and installs it into a fresh temporary project, where a third support-ticket adapter detects one collateral write and replays the identical artifact to `ACTION_PROVEN` after repair; `npm pack --dry-run` also passes.
- 9/9 native Chrome WebMCP E2E flows pass, including concrete requested/collateral target proof in both workflows, interactive target reselection and schema rebinding, direct and repeated external tool invocation, concurrent-call fail-closed behavior, 1280×720 judge-path layout, hero Effect Trace transitions, context tool lifecycle, the rule that regression `PASS` cannot render while verification is still running, and automated WCAG A/AA checks before and after the seeded failure.
- `npm run regression:ci:all` loads both committed JSON artifacts and executes each against the seeded defect and repaired implementation; all four expected verdicts and artifact-identity checks pass.
- Codex's in-app browser discovered and directly invoked `cancel_order` through its object-input native API; the UI replay path also completed defect block and identical repair PASS after the compatibility fix, with zero console warnings or errors.
- Official Evals 0.0.4 matcher: 2/2 correct calls matched; 2/2 wrong-argument controls rejected; 2/2 collateral defects remained.
- Manual Playwright: four concrete state assertions detect both defects and pass unchanged after repair.
- ExactDelta: two reusable action bindings, zero per-record expected-state assertions in scenario definitions, two defects detected, two identical regressions passed.
- Demo: 90.00 seconds, H.264 1440×900, AAC English `en-US-AndrewMultilingualNeural` narration. All 26 sentences are separate clips; every measured pause is at least 600 ms. The seeded effect failure is fully visible by 15 seconds. Final SHA-256 is recorded in `submission/FINAL_AUDIT.md`.
- Static judge path: five 1440×900 images reproduce the native hook, failure proof, identical repair, permission portability, and bounded comparison; generation fails on console errors and captions are fixed in `submission/GALLERY.md`.
- Final production deployment: native WebMCP, correct context-matched tool per workflow, external call entering the gate, executable regression returned, both seeded defects detected, both identical regressions passed, `tools=*`, valid social card, and zero console errors; see `submission/PRODUCTION_AUDIT.json`.
- Deterministic build audit: all emitted JS 70,536 gzip bytes, all CSS 5,942 gzip bytes, HTML 796 gzip bytes, no external runtime assets, no production source maps, complete social metadata, and a validated 1280×720 PNG social card.
- Final release-window three-run cold Chrome desktop lab gate at 40 ms latency / 10 Mbps down / 5 Mbps up / 1x CPU: worst TTFB 41.4 ms, FCP/LCP 1,564 ms, TBT 0 ms, CLS 0.0007, zero cross-origin runtime requests, zero automated WCAG A/AA violations, and zero console errors. This is bounded lab evidence, not field data or a Lighthouse score.
- Public-source review: official issue #45 and Chrome Evals guidance support the bounded trust-gap claim; webmcpify, Postcept, Playwright, Schemathesis, and AgentSynth cap broader novelty claims. Public challenge entries including SheetCanvas, VT, Redini-Atelier, 2D WebMCP, and MCPencil were re-reviewed on 2026-09-03; private and late entries remain unknowable. See `COMPETITIVE_REVIEW.md` and `OBJECTIVE_ADVERSARIAL_REVIEW.md`.
- Final release-window rerun: clean install PASS, typecheck PASS, unit 28/28, native E2E 9/9, packed fresh-project consumer plus dry-run distribution PASS, four JSON-driven regression executions PASS, build/budget PASS, cold-runtime quality PASS, benchmark PASS, media audit PASS, dependency audit 0 vulnerabilities, secret scan PASS, GitHub CI PASS, and production WebMCP audit PASS.

## Release status

The owner-approved release window completed on 2026-09-04 JST. The final source, live application, audited public YouTube demo, five-image gallery, testing instructions, and public Devpost page are synchronized. Devpost displayed `Project submitted!` and `SUBMITTED TO — The WebMCP Challenge` at 01:10 JST. Submission URL: `https://devpost.com/software/exactdelta`.
