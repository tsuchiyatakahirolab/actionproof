# ExactDelta final top-10 review

2026-08-28 JST / internal adversarial scorecard / not an official judging result

## Verdict

ExactDelta is now a credible top-10 contender rather than a replay-only technical proof. The decisive improvement is that the external browser-client call itself enters the Effect Contract gate and returns both truths to the agent: the action payload says `success: true`, while `effectGate.status` says `blocked` because one unselected record changed.

No score or implementation can guarantee a top-10 result. The remaining gates are human comprehension and release execution, not another product feature.

## Internal judging score

| Official criterion | Internal score | Concrete evidence | Residual deduction |
|---|---:|---|---|
| WebMCP Leverage | 9.4 / 10 | Native context-matched registration/discovery/execution; direct in-app-browser call; actual arguments recorded; independent gate verdict returned to the agent; two tool lifecycles | Two bounded staging fixtures, not a production SaaS integration |
| Execution | 9.2 / 10 | Coherent release decision; defect → block → repair → identical regression PASS; CI artifact; 9 unit tests; 5 native E2E tests including concurrent-call fail-closed and 1280×720 overflow controls; audited 90-second demo | Final build is deliberately held from public deployment; unfamiliar-human audit not yet recorded |
| Potential Impact | 8.3 / 10 | Specific developer/QA user and pre-release decision; official Chrome guidance supports deterministic effect testing; integration guide and retained regression show a plausible workflow | No customer deployment, demand study, time-saved measurement, or production incident—and none is claimed |
| Creativity & Ambition | 9.1 / 10 | Visible selection becomes a generated exact allowed-delta boundary; all current unselected records gain unchanged obligations; same artifact returns to agent and survives as repair regression | Outcome verification and explicit UI assertions already exist in adjacent products |
| **Total** | **36.0 / 40** | **Top-10-caliber internal threshold met** | **Not a win probability or judge commitment** |

## Mandatory gates

| Gate | Status | Evidence |
|---|---|---|
| Real pain and specific user | PASS | Developer/QA release decision; collateral write defect is concrete; no fabricated market claim |
| One-sentence difference | PASS | `COMPETITIVE_REVIEW.md` |
| WebMCP necessity | PASS | Browser agent discovers and invokes the page tool; direct native response includes the independent effect gate |
| Problem understood within 30 seconds | TECHNICALLY PASS / HUMAN PENDING | Full failure proof is visible by 15 seconds; unfamiliar reviewer still required |
| Meaningful state change within 60–90 seconds | PASS | Two changed records become one; blocked gate becomes passed; identical regression is visible |
| Evidence for all four criteria | PASS | `submission/JUDGING_EVIDENCE.md` |

## Competitor conclusion

- **webmcpify** is the strongest direct developer-tool alternative and is broader at integration plus declared UI verification.
- **Postcept** is stronger for persistent system-of-record receipts and production connectors.
- **GoogleChromeLabs WebMCP Evals** is the relevant official tool-selection layer.
- **ExactDelta's defensible space** is the in-page, human-selected exact-delta release boundary: generated unchanged obligations, external WebMCP invocation, separate action/effect truths, and identical repair regression.

The submission must not claim that Playwright or these products cannot catch collateral effects. The measured claim is that ExactDelta generated the demonstrated record-level obligations from two action bindings rather than four manually authored per-record assertions.

## Stop conditions before publication

1. An unfamiliar reviewer must pass the 20-second form without prior explanation.
2. Re-run the public competitor/gallery search immediately before the release window.
3. Push and deploy only in the owner-approved window; verify native WebMCP, the `effectGate` response, both workflows, headers, and zero console errors on production.
4. Upload and watch the exact audited MP4, then update the public video URL.
5. Owner reviews the final Devpost preview and performs the final submit.

`EXACTDELTA_TOP10_TECHNICAL_GATE_PASS`
