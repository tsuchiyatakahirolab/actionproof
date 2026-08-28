# ExactDelta final top-10 review

2026-08-28 JST / internal adversarial scorecard / not an official judging result

## Verdict

ExactDelta is a credible top-10 contender rather than a replay-only technical proof. The decisive improvement is that the external browser-client call itself enters the Effect Contract gate and returns both truths to the agent: the action payload says `success: true`, while `effectGate.status` says `blocked` because one unselected record changed.

No score or implementation can guarantee a top-10 result. The remaining mandatory work is objective release execution, not another product feature or a small subjective-feedback exercise. See `OBJECTIVE_ADVERSARIAL_REVIEW.md` for the current evidence hierarchy, falsification results, and defensible score bands.

## Internal judging score

| Official criterion | Internal score | Concrete evidence | Residual deduction |
|---|---:|---|---|
| WebMCP Leverage | 9.0–9.5 / 10 | Native context-matched registration/discovery/execution; direct in-app-browser call; actual arguments recorded; independent gate verdict returned to the agent; two tool lifecycles | Two bounded staging fixtures, not a production SaaS integration |
| Execution | 8.2–9.0 / 10 | Coherent release decision; defect → block → repair → identical regression PASS; executable JSON CI artifact; 20 unit tests; 7 native E2E tests including real target rebinding, repeated no-op, concurrent-call fail-closed, and 1280×720 controls; audited 90-second demo | A polished prototype without a production connector or persistence; final build is deliberately held from deployment |
| Potential Impact | 7.4–8.4 / 10 | Specific developer/QA user and pre-release decision; official Chrome guidance supports deterministic effect testing; integration guide and retained regression show a plausible workflow | Market demand, time saved, integration cost, and production-scale use were not measured |
| Creativity & Ambition | 8.2–9.0 / 10 | Visible selection becomes a generated exact allowed-delta boundary; all current unselected records gain unchanged obligations; same artifact returns to agent and survives as repair regression | Outcome, UI, stateful, and explicit assertion verification already exist in adjacent products |
| **Total** | **32.8–35.9 / 40** | **Credible contender on objective evidence** | **Not full marks, a win probability, or a judge commitment** |

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
