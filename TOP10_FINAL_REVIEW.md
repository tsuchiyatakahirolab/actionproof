# ExactDelta final top-10 review

2026-09-03 JST / internal adversarial scorecard / not an official judging result

## Verdict

ExactDelta is a strong top-10 contender rather than a replay-only technical proof. The external browser-client call itself enters the Effect Contract gate and returns both truths to the agent: the action payload says `success: true`, while `effectGate.status` says `blocked` because one unselected record changed. That same response carries the complete executable regression artifact, closing the path from agent action to independent effect evidence to CI replay. The revised first viewport now makes that contradiction visible as an Effect Trace before the judge scrolls, and both Chrome and ChatGPT's in-app browser reach the same write gate despite their current input-dialect difference.

No score or implementation can guarantee a top-10 result. The remaining mandatory work is objective release execution, not another product feature or a small subjective-feedback exercise. See `OBJECTIVE_ADVERSARIAL_REVIEW.md` for the current evidence hierarchy, falsification results, and defensible score bands.

## Internal judging score

| Official criterion | Internal score | Concrete evidence | Residual deduction |
|---|---:|---|---|
| WebMCP Leverage | 9.6–10.0 / 10 | Native context-matched registration/discovery/execution; direct in-app-browser call; one-write dialect-safe bridge; actual arguments recorded; independent verdict and executable regression returned to the agent; two tool lifecycles | Demonstrated against two owned staging fixtures rather than a third-party production integration |
| Execution | 9.7–10.0 / 10 | First-viewport Effect Trace; coherent release decision; defect → block → repair → identical regression PASS; executable JSON CI artifact; typed zero-runtime-dependency SDK; fresh-project tarball install and third-workflow replay; 28 unit tests; 9 native E2E tests; zero automated WCAG A/AA violations; deterministic build/performance gates; audited video; five-image static judge path; social preview | Release promotion is deliberately owner-held; authenticated external-system persistence remains outside the bounded prototype |
| Potential Impact | 9.0–9.5 / 10 | Specific developer/QA release decision; standards-derived trust gap; measured manual-assertion baseline; executable regression; explicit human-agent collaboration; consumer-tested SDK and integration boundary | Live demonstrated impact is bounded to two action classes and does not quantify production-scale efficiency or adoption |
| Creativity & Ambition | 9.1–9.7 / 10 | Visible selection becomes a generated exact allowed-delta boundary; all current unselected records gain unchanged obligations; ownable Effect Trace; same artifact returns to agent and survives as repair regression | Outcome, UI, stateful, and explicit assertion verification already exist separately in adjacent products |
| **Total** | **37.4–39.2 / 40** | **All controllable submission-readiness gates pass; strong top-10 evidence even if judges do not test the live app** | **Not a guaranteed official score or placement** |

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
| WebMCP necessity | PASS | Browser agent discovers and invokes the page tool; direct native response includes the independent effect gate and its executable CI regression |
| Problem understood within 30 seconds | ARTIFACT PASS / SUBJECTIVE CHECK OPTIONAL | Full failure proof is visible by 15 seconds; an unfamiliar viewer may still expose copy/layout confusion but does not establish technical or market truth |
| Meaningful state change within 60–90 seconds | PASS | Two changed records become one; blocked gate becomes passed; identical regression is visible |
| Evidence for all four criteria | PASS | `submission/JUDGING_EVIDENCE.md` |

## Competitor conclusion

- **SheetCanvas** is stronger in broad daily-product depth: 26 tools, durable data work, connectors, activity trail, and rewind.
- **VT** is stronger in authenticated external-workspace integration and path/digest hardening.
- **Redini-Atelier** is stronger in pre-commit negotiation, visual delight, undo/redo, and test-count optics.
- **2D WebMCP** is stronger in a research-backed, emotionally legible human-impact case.
- **MCPencil** is stronger in immediate novelty, visual memorability, and multi-user live interaction.
- **ExactDelta's defensible space** is the post-call trust boundary none of those public descriptions demonstrates as its core: correct native call, independently observed wrong effect, human-selected exact allowed delta, automatic unchanged obligations, and the identical failed contract replayed after repair. The typed package and external consumer now make that a reusable product primitive rather than fixture-only source.

### Field-relative stress test

| Failure mode in judging | Best visible rival | ExactDelta response | Residual exposure |
|---|---|---|---|
| “This is not a complete product” | SheetCanvas / VT | Actual fresh-project tarball install, third-workflow defect/replay proof, application-owned adapter, CI artifact, polished live gate, docs, tests, and audited media | No authenticated third-party deployment or adoption evidence |
| “WebMCP is decorative” | SheetCanvas / MCPencil | External browser-client invocation enters the same effect gate and receives the independent verdict plus its executable regression; context changes rebind the one exposed tool | Core verifier can also operate outside WebMCP, so the submission must keep the native boundary visible |
| “Existing tests already do this” | Redini / Playwright / webmcpify | Controlled benchmark concedes manual assertions work, then demonstrates selected-only obligations generated from two bindings and retained as identical regressions | No measured authoring-time or maintenance reduction |
| “The impact is abstract” | 2D WebMCP / VT | One accepted order call visibly changes the wrong customer and stops a release; permission changes prove a second high-risk class | Synthetic staging data and no production-scale outcome measurement |
| “I will forget it after the video” | MCPencil / Redini | The one-frame contradiction—`success: true`, requested `1`, observed `2`, `RELEASE BLOCKED`—is repeated in thumbnail, hero, gallery, and narration | Developer-tool category is inherently less playful |

The submission must not claim that Playwright or these products cannot catch collateral effects. The measured claim is that ExactDelta generated the demonstrated record-level obligations from two action bindings rather than four manually authored per-record assertions.

## Stop conditions before publication

1. Re-run the public competitor/gallery search immediately before the release window.
2. Push and deploy only in the owner-approved window; verify native WebMCP, the `effectGate` response, both workflows, headers, and zero console errors on production.
3. Upload and watch the exact audited MP4, then update the public video URL.
4. Owner reviews the final Devpost preview and performs the final submit.

An unfamiliar-viewer test is supplementary UX evidence only. If run, it may justify a copy/layout revision; it is not a release, correctness, demand, or score gate.

`EXACTDELTA_TOP10_TECHNICAL_GATE_PASS`
