# ActionProof

> **The agent did everything right. The result was still wrong.**

**ActionProof is a pre-release effect gate for state-changing WebMCP tools.** Before a developer or QA engineer lets a write tool ship, it proves that the observed application state matches the human-authorized Effect Contract—and that nothing else changed.

This is an active WebMCP trust boundary, not an invented incident. The standards repository explicitly discusses the gap between a tool's declared intent and its actual behavior, while Chrome's Evals guidance separately recommends deterministic testing of UI updates and intentional side effects. ActionProof turns that necessary effect test into an inspectable, generated contract that can be rerun after repair.

The deterministic staging demo registers native WebMCP write tools for two fictional workflows. In each one, the tool name and arguments are correct and the tool returns success, but a seeded handler defect also changes an unselected neighboring record. ActionProof generates the required and forbidden effects from the visible selection and pre-action state, observes the resulting state, blocks the effect gate, exports a CI-ready regression artifact, and passes that identical gate after repair.

## Try it

- **Live demo:** [https://actionproof.vercel.app](https://actionproof.vercel.app)
- **Public repository:** [github.com/tsuchiyatakahirolab/actionproof](https://github.com/tsuchiyatakahirolab/actionproof)
- **20-second proof:** open the demo, keep **Order cancellation** selected, and click **Run seeded defect**; the effect gate must block the write tool
- **Repair proof:** click **Run repaired version**; the same regression ID, contract, and tool arguments must pass and clear the gate
- **Second workflow:** switch to **Permission change** and repeat

All records are fake, all defects are deliberately seeded, and no transaction leaves the browser fixture.

## Why WebMCP

A browser agent can choose the correct WebMCP tool, supply valid arguments, receive `success: true`, and still leave the application in the wrong state. Tool-call matching evaluates the invocation. ActionProof adds an application-owned effect boundary around the invocation:

```text
visible human selection + pre-action state
→ generated Effect Contract
→ native WebMCP tool execution
→ application-owned post-action snapshot, independent of the tool return
→ required / unexpected / invariant diff
→ inspectable verdict + retained regression
```

The page registers the one tool relevant to the visible workflow with `document.modelContext.registerTool()`, unregisters it on a workflow change, discovers it with `getTools()`, and invokes it through `executeTool()`. Its schema constrains the target and requested value to the visible human intent, and `exposedTo` limits access to the same origin. The Run button makes the native execution deterministic for judging; an external browser agent can invoke the same context-matched tool. Without WebMCP there is no structured page-exposed write boundary for this gate to discover and execute; it becomes an ordinary application-specific test.

## Human and agent roles

- The human declares the action by selecting the target in the application UI.
- ActionProof turns that visible intent and the pre-action snapshot into an Effect Contract.
- The agent invokes the registered WebMCP tool.
- The application exposes an owned post-action state adapter.
- ActionProof compares declared and observed effects; it does not infer intent from the tool result.
- A developer repairs the handler and reruns the retained regression unchanged before clearing the write tool for release.

## One core, two workflows

| Workflow | Required effect | Automatically protected neighbor | Seeded collateral effect |
|---|---|---|---|
| Order cancellation | `#1042.status → cancelled` | Order `#1043` | `#1043` also becomes cancelled |
| Permission change | `Alice.role → Editor` | User `Bob` | Bob also becomes Editor |

Both scenarios use the same `generateEffectContract()`, `diffSnapshots()`, `verifyEffect()`, `runActionProof()`, WebMCP bridge, and UI. Scenario definitions provide only the application-owned action binding and state shape.

## Measured comparison

The repository includes a plain WebMCP fixture, official WebMCP Evals `0.0.3` trajectory matching, and a manual Playwright baseline. The controlled measurement uses the same two native Chrome WebMCP calls and the same seeded defects.

| Layer | Measured result |
|---|---|
| Official Evals call matcher | 2/2 correct calls PASS; 2/2 deliberately wrong-argument controls FAIL; collateral defects remained in 2/2 resulting states |
| Evals + manual Playwright | 4 concrete expected-state assertions detected both defects; identical assertions PASS after repair |
| ActionProof | 2 reusable action bindings; 0 per-record expected-state assertions in scenario definitions; both generated regressions detect the defect and PASS after repair |

This is a detection-coverage comparison, not a runtime-performance, universal-support, or market-demand claim. ActionProof still requires an application-owned state adapter and one binding per action class. See [the technical benchmark report](BENCHMARK_REPORT.md) and [the machine-readable result](benchmarks/results/latest.json).

## Integration boundary

ActionProof is not zero-configuration magic. A site owner supplies two narrow, reviewable pieces: an authorized snapshot adapter for the state that matters, and one action binding that declares the intended field transition. The core then expands the current visible selection into concrete required, forbidden, and invariant checks for each run.

See [the integration guide](docs/INTEGRATION.md) for the minimum adapter, binding, native execution, CI artifact, and production caveats.

Primary context: [WebMCP privacy/security discussion #45](https://github.com/webmachinelearning/webmcp/issues/45) and [Chrome's Evals for WebMCP guidance](https://developer.chrome.com/docs/ai/webmcp/evals).

## Build Week usage

OpenAI Codex was the primary development environment for the implementation, native Chrome tests, benchmark harness, UI review, and release audit. GPT-5.6 was used for the architecture review, adversarial judging pass, test design, and submission materials. The runtime demo is deterministic and does not call a model or claim that an AI repaired the seeded handler.

Run the measurement:

```bash
npm run benchmark
```

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

If the API is absent, ActionProof uses an explicitly labeled **WebMCP-compatible local harness** for UI review. Harness output is never counted as native evidence.

## Verification

```bash
npm run check       # TypeScript project check
npm test            # Effect Contract unit tests
npm run build       # Production Vite build
npm run test:ui     # Native Chrome WebMCP + UI/E2E + console checks
npm run benchmark   # Evals matcher + manual Playwright + ActionProof comparison
```

Current deterministic suite:

- 8 unit tests pass, including wrong-value and timeout controls.
- 2 native Chrome UI/E2E tests pass.
- Both workflows reproduce defect → detection → repair → identical regression PASS.
- Console errors are collected in the primary order flow and must remain empty.
- The expected failing manual-Playwright defect run is captured as benchmark evidence; the unchanged suite passes after repair.

## Repository map

- `src/core/effect-contract.ts` — contract generation, state diff, verification, retained regression
- `src/core/scenario.ts` — two fictional application bindings and deterministic defect/repair handlers
- `src/webmcp/bridge.ts` — native imperative WebMCP lifecycle/execution, same-origin exposure, and labeled local fallback
- `src/App.tsx` — judge-first proof UI
- `docs/INTEGRATION.md` — bounded path from the fixture to an application-owned release gate
- `baseline.html` — plain WebMCP comparison fixture without ActionProof
- `benchmarks/` — official matcher inputs, manual Playwright baseline, raw and summarized results
- `tests/browser/` — native Chrome end-to-end proof
- `submission/` — final video script, Devpost copy, evidence map, and owner checklist
- `DOCUMENTATION.md` / `PLANS.md` — reproducible development record and release-gated execution source of truth

## Scope and limitations

- This is a new, public hackathon prototype using fictional in-memory records and deterministic seeded defects.
- It demonstrates two action classes, not zero-configuration support for every website.
- The effect gate is limited to the state exposed by an application-owned adapter and the contract fields it declares.
- A passed Effect Contract is not proof that every external or delayed side effect is correct.
- The deterministic Run control proves the native action/effect path; it does not measure an LLM's tool-selection quality.
- The comparison does not measure LLM tool-selection quality, latency, authoring time, or customer demand.
- The project has no customer deployment, incident history, authentication, external writes, or production authorization model.

## Submission evidence

- [Formal GO decision](GO_DECISION.md)
- [Current top-award release specification v0.5](WINNING_SPEC_v0.5.md)
- [Architecture gate specification v0.4](WINNING_SPEC_v0.4.md)
- [Top-10 gate report](TOP10_GATE_REPORT.md)
- [Benchmark report](BENCHMARK_REPORT.md)
- [Judging evidence map](submission/JUDGING_EVIDENCE.md)
- [90-second demo script](submission/VIDEO_SCRIPT.md)
- [Devpost submission copy](submission/DEVPOST_SUBMISSION.md)
- [Final technical audit](submission/FINAL_AUDIT.md)
- [20-second unfamiliar-reviewer form](submission/BLIND_REVIEW_FORM.md)

## License

[MIT](LICENSE) © 2026 Takahiro Tsuchiya / TSUCHIYA LAB.
