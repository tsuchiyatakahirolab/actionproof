# ActionProof development record

This file is the compact implementation and release record for the WebMCP Challenge entry. The execution source of truth is [PLANS.md](PLANS.md).

## Product decision

ActionProof is a pre-release effect gate for state-changing WebMCP tools. The human's visible selection and pre-action state generate an Effect Contract; a native WebMCP call is executed; application-owned post-state is observed independently of the return payload; the gate blocks on collateral change and clears only after the identical retained regression passes.

The product remains intentionally bounded to two disposable in-memory workflows: order cancellation and permission change. No customer, production incident, external transaction, universal adapter, or automatic repair is represented.

## Milestones

| Date | Milestone | Status |
|---|---|---|
| 2026-08-27 | Effect Contract and native WebMCP lifecycle hardening | Complete |
| 2026-08-27 | Official Evals + Playwright controlled comparison | Complete |
| 2026-08-27 | Pre-release gate UI and CI regression artifact framing | Complete |
| 2026-08-27 | 90-second English demo regeneration and media audit | Complete |
| 2026-08-27 | Held-build local production smoke audit | Complete |
| Release window | Push, promote, public YouTube, Devpost preview | Owner-controlled |

## Reproducible commands

```bash
npm ci
npm run check
npm test
npm run build
npm run test:ui
npm run benchmark
npm run audit:production
npm run demo:record
npm run demo:audit
npm audit --audit-level=high
```

The production audit accepts `PRODUCTION_URL` and `AUDIT_OUTPUT` environment variables so a held build can be audited without overwriting the previous public-revision record.

## Current evidence

- 8/8 unit tests pass.
- 2/2 native Chrome WebMCP E2E flows pass, including context tool lifecycle and gate transitions.
- Official Evals matcher: 2/2 correct calls matched; 2/2 wrong-argument controls rejected; 2/2 collateral defects remained.
- Manual Playwright: four concrete state assertions detect both defects and pass unchanged after repair.
- ActionProof: two reusable action bindings, zero per-record expected-state assertions in scenario definitions, two defects detected, two identical regressions passed.
- Demo: 90.00 seconds, H.264 1440×900, AAC English `en-US-AvaMultilingualNeural` narration. All 25 sentences are separate clips; every measured pause is at least 500 ms. Final SHA-256 is recorded in `submission/FINAL_AUDIT.md`.
- Held local production preview: native WebMCP, correct context-matched tool per workflow, `tools=*`, zero console errors; see `submission/private/HELD_PRODUCTION_AUDIT.json` (ignored from public release).

## Release safety

The improved revision is deliberately held locally until the owner-approved release window. The release sequence is documented in `submission/FINAL_CHECKLIST.md`; Codex must stop before the final Devpost submit click.
