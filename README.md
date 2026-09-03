# ExactDelta

> **The agent did everything right. The result was still wrong.**

**ExactDelta turns the visible selected target into the only permitted application-state delta, blocks release when the external WebMCP call changes anything else, and retains that identical contract as the repair regression.**

The verifier is also built as a typed, zero-runtime-dependency ESM SDK. Its public `runEffectGate()` API accepts an application-owned intent/snapshot adapter and action binding; `runRegressionWithAdapter()` replays the exported JSON against a consumer adapter with identity and contract validation before the write. The package audit type-checks a NodeNext consumer, imports the built distribution from a separate support-ticket fixture, and requires `ACTION_PROVEN`.

This is an active WebMCP trust boundary, not an invented incident. The standards repository explicitly discusses the gap between a tool's declared intent and its actual behavior, while Chrome's Evals guidance separately recommends deterministic testing of UI updates and intentional side effects. ExactDelta turns that necessary effect test into an inspectable, generated contract that can be rerun after repair.

The deterministic staging demo registers native WebMCP write tools for two fictional workflows. In each one, the tool name and arguments are correct and the tool returns success, but a seeded handler defect also changes an unselected neighboring record. ExactDelta generates the required and forbidden effects from the visible selection and pre-action state, observes the resulting state, blocks the effect gate, exports a versioned regression artifact, and re-executes that exact JSON in CI against the defect and repair.

## Try it

- **Live demo:** [https://actionproof.vercel.app](https://actionproof.vercel.app)
- **Public repository:** [github.com/tsuchiyatakahirolab/actionproof](https://github.com/tsuchiyatakahirolab/actionproof)
- **Real agent path:** ask the in-app browser agent, `Cancel only the order selected on this page, then report whether the effect gate passes.` The direct tool call must be labeled **EXTERNAL WEBMCP CALL** and the seeded collateral effect must block the gate.
- **20-second proof:** open the demo, keep **Order cancellation** selected, and click **Run seeded defect**; the effect gate must block the write tool
- **Repair proof:** click **Run repaired version**; the same regression ID, contract, and tool arguments must pass and clear the gate
- **Selection proof:** select the other row; the visible intent, generated contract, tool schema enum, call arguments, and regression ID must all follow that target
- **Second workflow:** switch to **Permission change** and repeat

All records are fake, all defects are deliberately seeded, and no transaction leaves the browser fixture.

## Why WebMCP

A browser agent can choose the correct WebMCP tool, supply valid arguments, receive `success: true`, and still leave the application in the wrong state. Tool-call matching evaluates the invocation. ExactDelta adds an application-owned effect boundary around the invocation:

```text
visible human selection + pre-action state
→ generated Effect Contract
→ native WebMCP tool execution
→ application-owned post-action snapshot, independent of the tool return
→ required / unexpected / invariant diff
→ inspectable verdict + retained regression
```

The page registers the one tool relevant to the visible workflow with `document.modelContext.registerTool()`, unregisters it on a workflow change, discovers it with `getTools()`, and invokes it through `executeTool()`. Its schema constrains the target and requested value to the visible human intent, and `exposedTo` limits access to the same origin. A read-only startup probe resolves the current Chrome JSON-string and in-app-browser object input dialects before any application write is exposed; the selected write is then invoked exactly once. A direct call from the browser client enters the Effect Contract gate automatically and returns the original action payload plus an independent `effectGate` verdict, so the agent can report the release result instead of trusting `success: true`. The Run button uses the same native boundary as a deterministic judge replay. Without WebMCP there is no structured page-exposed write boundary for a browser agent to discover and invoke; it becomes an ordinary application-specific test.

## Human and agent roles

- The human declares the action by selecting the target in the application UI.
- ExactDelta turns that visible intent and the pre-action snapshot into an Effect Contract.
- The agent invokes the registered WebMCP tool.
- The application exposes an owned post-action state adapter.
- ExactDelta compares declared and observed effects; it does not infer intent from the tool result.
- A developer repairs the handler and reruns the retained regression unchanged before clearing the write tool for release.

## One core, two workflows

| Workflow | Required effect | Automatically protected neighbor | Seeded collateral effect |
|---|---|---|---|
| Order cancellation | `#1042.status → cancelled` | Order `#1043` | `#1043` also becomes cancelled |
| Permission change | `Alice.role → Editor` | User `Bob` | Bob also becomes Editor |

Both scenarios use the same `generateEffectContract()`, `diffSnapshots()`, `verifyEffect()`, `runExactDelta()`, WebMCP bridge, and UI. Scenario definitions provide only the application-owned action binding and state shape.

## Measured comparison

The repository includes a plain WebMCP fixture, official WebMCP Evals `0.0.4` trajectory matching, and a manual Playwright baseline. The controlled measurement uses the same two native Chrome WebMCP calls and the same seeded defects.

| Layer | Measured result |
|---|---|
| Official Evals call matcher | 2/2 correct calls PASS; 2/2 deliberately wrong-argument controls FAIL; collateral defects remained in 2/2 resulting states |
| Evals + manual Playwright | 4 concrete expected-state assertions detected both defects; identical assertions PASS after repair |
| ExactDelta | 2 reusable action bindings; 0 per-record expected-state assertions in scenario definitions; both generated regressions detect the defect and PASS after repair |

This comparison measures detection coverage only. ExactDelta still requires an application-owned state adapter and one binding per action class. See [the technical benchmark report](BENCHMARK_REPORT.md) and [the machine-readable result](benchmarks/results/latest.json).

## Public alternatives and precise difference

The strongest public adjacent approaches are not strawmen. [GoogleChromeLabs WebMCP Evals](https://github.com/GoogleChromeLabs/webmcp-tools/) tests model/tool selection. [webmcpify](https://github.com/TueJon/webmcpify) provides a broader integration pipeline and real-browser result/UI-delta verification. [Postcept](https://github.com/postcept/mcp) verifies selected outcomes against external systems of record and returns receipts. Conventional Playwright assertions can also catch both seeded defects.

ExactDelta's narrower demonstrated difference is that it generates the exact allowed state delta—including unchanged obligations for every current unselected record—from the visible target and pre-state, gates the direct page WebMCP invocation, and reuses the identical artifact after repair. See the dated [competitive review](COMPETITIVE_REVIEW.md) for the comparison and search limits.

## Integration boundary

ExactDelta is not zero-configuration magic. A site owner supplies two narrow, reviewable pieces: an authorized snapshot adapter for the state that matters, and one action binding that declares the intended field transition. The core then expands the current visible selection into concrete required, forbidden, and invariant checks for each run.

See [the integration guide](docs/INTEGRATION.md) for the minimum adapter, binding, native execution, CI artifact, and production caveats.

Primary context: [WebMCP privacy/security discussion #45](https://github.com/webmachinelearning/webmcp/issues/45) and [Chrome's Evals for WebMCP guidance](https://developer.chrome.com/docs/ai/webmcp/evals).

## Build Week usage

OpenAI Codex was the primary development environment for the implementation, native Chrome tests, benchmark harness, UI review, and release audit. GPT-5.6 was used for the architecture review, adversarial judging pass, test design, and submission materials. The runtime demo is deterministic and does not call a model or claim that an AI repaired the seeded handler.

Run the measurement:

```bash
npm run benchmark
```

Re-execute the committed `exactdelta.regression.v1` JSON fixtures through the same verifier:

```bash
npm run regression:ci:all
# or one exported artifact:
npm run regression:ci -- path/to/artifact.json --implementation repaired --expect ACTION_PROVEN
```

Build and smoke-test the distributable package:

```bash
npm run audit:package
# Produces a dry-run package manifest and runs examples/package-consumer.mjs
```

The package is distribution-ready but intentionally not published to a registry before the owner-approved release window. That is packaging evidence, not adoption or production-readiness evidence.

## Local setup

Requirements: Node.js 20+ and Chrome 149+.

```bash
npm install
npm run dev
```

Open the printed URL. Useful deterministic demo parameters:

- `?speed=0.05` — accelerate each visual phase
- `?autoplay=defect` — automatically run the seeded defect
- `?autoplay=repair` — automatically run the repaired handler
- `?autoplay=both` — run defect then repair
- `?timing=demo` — fixed submission-recording cadence (long order proof, accelerated repair/second workflow)

### Native WebMCP

For a local Chrome build with WebMCP testing enabled:

1. Open `chrome://flags/#enable-webmcp-testing` and enable the flag, or launch Chrome with `--enable-features=WebMCP,WebMCPTesting`.
2. Reload the app.
3. Confirm the top badge says **Native WebMCP · 1 context-matched tool**.

If the API is absent, ExactDelta uses an explicitly labeled **WebMCP-compatible local harness** for UI review. Harness output is never counted as native evidence.

## Verification

```bash
npm run check       # TypeScript project check
npm test            # Effect Contract unit tests
npm run build       # Production Vite build
npm run test:ui     # Native Chrome WebMCP + UI/E2E + console checks
npm run benchmark   # Evals matcher + manual Playwright + ExactDelta comparison
npm run regression:ci:all # Load and execute both versioned JSON regressions against defect + repair
npm run audit:build # Build-size, external-asset, source-map, metadata, and social-card gate
npm run audit:runtime # Three cold desktop runs; set RUNTIME_AUDIT_URL when preview is not on :4173
npm run submission:images # Regenerate five native-Chrome Devpost gallery images
```

Current deterministic suite:

- 28 unit tests pass, including both native `executeTool()` input dialects, exactly-once application-write enforcement in each dialect, artifact schema/contract/identity drift rejection, JSON re-execution, repeated no-op rejection, post-mutation failure, client abort, snapshot identity/invariant, entity/field and identity-set delimiter collisions, external-argument, wrong-value, timeout controls, a consumer adapter independent of `ScenarioStore`, generic repaired-artifact replay, and consumer argument-drift rejection before write.
- 9 native Chrome UI/E2E tests pass, including real target reselection with context-matched tool-schema rebinding, direct and repeated external WebMCP invocations, concurrent-call fail-closed behavior, a 1280×720 judge-path overflow control, hero Effect Trace state, a temporal guard that forbids regression `PASS` before verification completes, and automated WCAG A/AA checks in both initial and blocked states.
- Four CI runner executions pass: each committed JSON detects its seeded defect and proves its repaired implementation with identical identity, intent, arguments, and contract.
- Both workflows reproduce defect → detection → repair → identical regression PASS.
- Console errors are collected in the primary order flow and must remain empty.
- The expected failing manual-Playwright defect run is captured as benchmark evidence; the unchanged suite passes after repair.
- The deterministic production-build gate keeps all emitted JavaScript at 70,524 gzip bytes and CSS at 5,942 gzip bytes, loads no cross-origin runtime assets, emits no source maps, and verifies the 1280×720 PNG social card and metadata.
- The held local build passes three cold Chrome desktop lab runs under declared 40 ms / 10 Mbps conditions; worst-run TTFB is 31.2 ms, FCP and LCP are 1,444 ms, TBT is 0 ms, CLS is 0.0007, and automated WCAG A/AA violations, cross-origin runtime requests, and console errors are all zero. These are bounded lab results, not field data or a Lighthouse score.

### Rebuild the submission video

Video generation additionally requires Python 3 and network access for the pinned [`edge-tts` 7.2.8](https://github.com/rany2/edge-tts) build tool. It is used only to render the narration asset; it is not a product runtime dependency. The timeline renders every sentence as a separate `en-US-AndrewMultilingualNeural` clip and rejects the build unless every measured inter-sentence pause is at least 600 ms.

```bash
npm run demo:record  # build, neural narration, pause audit, browser recording, mux
npm run demo:audit   # narration timing plus final H.264/AAC media audit
```

## Repository map

- `src/core/effect-contract.ts` — contract generation, state diff, verification, retained regression
- `src/core/gate.ts` / `src/exactdelta.ts` — application-owned adapter boundary and public package API
- `src/core/regression.ts` — versioned artifact validation, identity checks, and JSON-driven re-execution
- `src/core/scenario.ts` — two fictional application bindings and deterministic defect/repair handlers
- `src/webmcp/bridge.ts` — native imperative WebMCP lifecycle/execution, safe object/JSON-string input-mode detection, same-origin exposure, and labeled local fallback
- `src/App.tsx` — judge-first proof UI
- `docs/INTEGRATION.md` — bounded path from the fixture to an application-owned release gate
- `baseline.html` — plain WebMCP comparison fixture without ExactDelta
- `benchmarks/` — official matcher inputs, manual Playwright baseline, raw and summarized results
- `tests/browser/` — native Chrome end-to-end proof
- `scripts/narration-timeline.json` — sentence-level neural voice and deterministic timing source
- `scripts/run-regression.ts` / `regressions/` — CI runner and committed versioned fixtures
- `examples/package-consumer.mjs` / `scripts/audit-package.mjs` — built-package consumer and distribution gate
- `scripts/audit-build.mjs` / `scripts/audit-runtime.mjs` — deterministic distribution budget and bounded cold-browser quality gates
- `submission/` — final video script, Devpost copy, evidence map, and owner checklist
- `submission/GALLERY.md` — deterministic Devpost image order, captions, and regeneration command
- `DOCUMENTATION.md` / `PLANS.md` — reproducible development record and release-gated execution source of truth

## Scope and limitations

- This is a new, public hackathon prototype using fictional in-memory records and deterministic seeded defects.
- It demonstrates two action classes, not zero-configuration support for every website.
- The effect gate is limited to the state exposed by an application-owned adapter and the contract fields it declares.
- A passed Effect Contract is not proof that every external or delayed side effect is correct.
- The deterministic Run control proves the native action/effect path; it does not measure an LLM's tool-selection quality.
- The comparison is a detection-coverage measurement; it does not measure LLM tool-selection quality, latency, authoring time, or production-scale integration.
- The public fixture has no authentication, external writes, or production authorization model.

## Submission evidence

- [Formal GO decision](GO_DECISION.md)
- [Current product-evidence specification v0.7](WINNING_SPEC_v0.7.md)
- [Dated competitive review](COMPETITIVE_REVIEW.md)
- [Objective adversarial review](OBJECTIVE_ADVERSARIAL_REVIEW.md)
- [Final internal top-10 scorecard](TOP10_FINAL_REVIEW.md)
- [Architecture gate specification v0.4](WINNING_SPEC_v0.4.md)
- [Top-10 gate report](TOP10_GATE_REPORT.md)
- [Benchmark report](BENCHMARK_REPORT.md)
- [Judging evidence map](submission/JUDGING_EVIDENCE.md)
- [90-second demo script](submission/VIDEO_SCRIPT.md)
- [Devpost submission copy](submission/DEVPOST_SUBMISSION.md)
- [Final technical audit](submission/FINAL_AUDIT.md)
- [Rules compliance record](submission/RULES_COMPLIANCE.md)
- [Third-party dependency and media-tool notice](THIRD_PARTY_NOTICES.md)
- [Submission owner checklist](submission/FINAL_CHECKLIST.md)
- [Optional 20-second unfamiliar-viewer form](submission/BLIND_REVIEW_FORM.md)
- [Optional private comprehension protocol](submission/PRIVATE_VALIDATION_PROTOCOL.md)

## License

[MIT](LICENSE) © 2026 Takahiro Tsuchiya / TSUCHIYA LAB.
