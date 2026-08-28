# ExactDelta final top-10 review

2026-08-29 JST / internal adversarial scorecard / not an official judging result

## Verdict

ExactDelta is a strong top-10 contender rather than a replay-only technical proof. The external browser-client call itself enters the Effect Contract gate and returns both truths to the agent: the action payload says `success: true`, while `effectGate.status` says `blocked` because one unselected record changed. The revised first viewport now makes that contradiction visible as an Effect Trace before the judge scrolls, and both Chrome and ChatGPT's in-app browser reach the same write gate despite their current input-dialect difference.

No score or implementation can guarantee a top-10 result. The remaining mandatory work is objective release execution, not another product feature or a small subjective-feedback exercise. See `OBJECTIVE_ADVERSARIAL_REVIEW.md` for the current evidence hierarchy, falsification results, and defensible score bands.

## Internal judging score

| Official criterion | Internal score | Concrete evidence | Residual deduction |
|---|---:|---|---|
| WebMCP Leverage | 9.5–9.9 / 10 | Native context-matched registration/discovery/execution; direct in-app-browser call; one-write dialect-safe bridge; actual arguments recorded; independent gate verdict returned to the agent; two tool lifecycles | Demonstrated against two owned staging fixtures rather than a third-party production integration |
| Execution | 9.5–9.9 / 10 | First-viewport Effect Trace; coherent release decision; defect → block → repair → identical regression PASS; executable JSON CI artifact; 24 unit tests; 9 native E2E tests; zero automated WCAG A/AA violations; deterministic build/performance gates; audited video; five-image static judge path; social preview | Release promotion is deliberately owner-held; external-system persistence remains outside the bounded prototype |
| Potential Impact | 8.8–9.5 / 10 | Specific developer/QA release decision; standards-derived trust gap; measured manual-assertion baseline; executable regression; explicit human-agent collaboration and integration boundary | Demonstrated impact is bounded to two action classes and does not quantify production-scale efficiency |
| Creativity & Ambition | 9.1–9.7 / 10 | Visible selection becomes a generated exact allowed-delta boundary; all current unselected records gain unchanged obligations; ownable Effect Trace; same artifact returns to agent and survives as repair regression | Outcome, UI, stateful, and explicit assertion verification already exist separately in adjacent products |
| **Total** | **36.9–39.0 / 40** | **All controllable submission-readiness gates pass; strong top-10 evidence even if judges do not test the live app** | **Not a guaranteed official score or placement** |

## Controllable readiness gate

| Gate | Result |
|---|---|
| Native WebMCP is material and works in both judge clients | PASS |
| Correct-call/wrong-effect contradiction is visible without narration | PASS |
| Seeded defect → detection → repair → identical regression is reproducible | PASS |
| Same verifier operates across orders and permissions | PASS |
| Evals + Playwright comparison is measured and narrowly claimed | PASS |
| First viewport explains requested versus observed effect | PASS |
| 90-second media, narration pauses, thumbnail, and representative frames are audited | PASS |
| Build budget, cold-runtime metrics, WCAG, type, unit, browser, CI runner, dependency, secret, console, and held-preview checks pass | PASS |
| Public claims remain bounded to demonstrated evidence | PASS |
| Publication and final submission remain owner-gated | PASS |

**Internal controllable readiness: 10/10 gates PASS.** This is the meaningful “full marks” state the team can establish before judges score the entry.

## Mandatory gates

| Gate | Status | Evidence |
|---|---|---|
| Real pain and specific user | PASS | Developer/QA release decision; collateral write defect is concrete; no fabricated market claim |
| One-sentence difference | PASS | `COMPETITIVE_REVIEW.md` |
| WebMCP necessity | PASS | Browser agent discovers and invokes the page tool; direct native response includes the independent effect gate |
| Problem understood within 30 seconds | ARTIFACT PASS / SUBJECTIVE CHECK OPTIONAL | Full failure proof is visible by 15 seconds; an unfamiliar viewer may still expose copy/layout confusion but does not establish technical or market truth |
| Meaningful state change within 60–90 seconds | PASS | Two changed records become one; blocked gate becomes passed; identical regression is visible |
| Evidence for all four criteria | PASS | `submission/JUDGING_EVIDENCE.md` |

## Competitor conclusion

- **webmcpify** is the strongest direct developer-tool alternative and is broader at integration plus declared UI verification.
- **Postcept** is stronger for persistent system-of-record receipts and production connectors.
- **GoogleChromeLabs WebMCP Evals** is the relevant official tool-selection layer.
- **ExactDelta's defensible space** is the in-page, human-selected exact-delta release boundary: generated unchanged obligations, external WebMCP invocation, separate action/effect truths, and identical repair regression.

The submission must not claim that Playwright or these products cannot catch collateral effects. The measured claim is that ExactDelta generated the demonstrated record-level obligations from two action bindings rather than four manually authored per-record assertions.

## Stop conditions before publication

1. Re-run the public competitor/gallery search immediately before the release window.
2. Push and deploy only in the owner-approved window; verify native WebMCP, the `effectGate` response, both workflows, headers, and zero console errors on production.
3. Upload and watch the exact audited MP4, then update the public video URL.
4. Owner reviews the final Devpost preview and performs the final submit.

An unfamiliar-viewer test is supplementary UX evidence only. If run, it may justify a copy/layout revision; it is not a release, correctness, demand, or score gate.

`EXACTDELTA_TOP10_TECHNICAL_GATE_PASS`
