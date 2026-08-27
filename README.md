# ActionProof

> **The agent did everything right. The result was still wrong.**

ActionProof checks whether a WebMCP action changed exactly the state the human declared—and nothing outside that Effect Contract.

The deterministic demo registers native WebMCP write tools for two fictional workflows. In each one, the tool name and arguments are correct and the tool returns success, but a seeded handler defect also changes an unselected neighboring record. ActionProof generates the required and forbidden effects from the visible selection and pre-action state, observes the resulting state, identifies the collateral change, retains the generated regression, and passes that identical regression after repair.

## Try it

- **Live demo:** deployment URL will be inserted before submission
- **20-second proof:** open the demo, keep **Order cancellation** selected, and click **Run seeded defect**
- **Repair proof:** click **Run repaired version**; the same regression ID, contract, and tool arguments must pass
- **Second workflow:** switch to **Permission change** and repeat

All records are fake, all defects are deliberately seeded, and no transaction leaves the browser fixture.

## Why WebMCP

A browser agent can choose the correct WebMCP tool, supply valid arguments, receive `success: true`, and still leave the application in the wrong state. Tool-call matching evaluates the invocation. ActionProof adds an application-owned effect boundary around the invocation:

```text
visible human selection + pre-action state
→ generated Effect Contract
→ native WebMCP tool execution
→ independent post-action snapshot
→ required / unexpected / invariant diff
→ inspectable verdict + retained regression
```

The page registers tools with `document.modelContext.registerTool()`, discovers them with `getTools()`, and invokes them through `executeTool()`. The Run button makes the native execution deterministic for judging; an external browser agent can invoke the same registered tools. Without WebMCP there is no page-exposed action boundary for ActionProof to wrap and verify.

## Human and agent roles

- The human declares the action by selecting the target in the application UI.
- ActionProof turns that visible intent and the pre-action snapshot into an Effect Contract.
- The agent invokes the registered WebMCP tool.
- The application exposes an owned post-action state adapter.
- ActionProof compares declared and observed effects; it does not infer intent from the tool result.
- A developer repairs the handler and reruns the retained regression unchanged.

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
| Official Evals call matcher | 2/2 correct calls PASS; collateral defects remained in 2/2 resulting states |
| Evals + manual Playwright | 4 concrete expected-state assertions detected both defects; identical assertions PASS after repair |
| ActionProof | 2 reusable action bindings; 0 per-record expected-state assertions in scenario definitions; both generated regressions detect the defect and PASS after repair |

This is a detection-coverage comparison, not a runtime-performance, universal-support, or market-demand claim. ActionProof still requires an application-owned state adapter and one binding per action class. See [the technical benchmark report](BENCHMARK_REPORT.md) and [the machine-readable result](benchmarks/results/latest.json).

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

### Native WebMCP

For a local Chrome build with WebMCP testing enabled:

1. Open `chrome://flags/#enable-webmcp-testing` and enable the flag, or launch Chrome with `--enable-features=WebMCP,WebMCPTesting`.
2. Reload the app.
3. Confirm the top badge says **Native WebMCP active**.

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

- 6 unit tests pass.
- 2 native Chrome UI/E2E tests pass.
- Both workflows reproduce defect → detection → repair → identical regression PASS.
- Console errors are collected in the primary order flow and must remain empty.
- The expected failing manual-Playwright defect run is captured as benchmark evidence; the unchanged suite passes after repair.

## Repository map

- `src/core/effect-contract.ts` — contract generation, state diff, verification, retained regression
- `src/core/scenario.ts` — two fictional application bindings and deterministic defect/repair handlers
- `src/webmcp/bridge.ts` — native imperative WebMCP registration/execution plus labeled local fallback
- `src/App.tsx` — judge-first proof UI
- `baseline.html` — plain WebMCP comparison fixture without ActionProof
- `benchmarks/` — official matcher inputs, manual Playwright baseline, raw and summarized results
- `tests/browser/` — native Chrome end-to-end proof
- `submission/` — final video script, Devpost copy, evidence map, and owner checklist

## Scope and limitations

- This is a new, public hackathon prototype using fictional in-memory records and deterministic seeded defects.
- It demonstrates two action classes, not zero-configuration support for every website.
- Effect verification is limited to the state exposed by an application-owned adapter and the contract fields it declares.
- A passed Effect Contract is not proof that every external or delayed side effect is correct.
- The comparison does not measure LLM tool-selection quality, latency, authoring time, or customer demand.
- The project has no customer deployment, incident history, authentication, external writes, or production authorization model.

## Submission evidence

- [Formal GO decision](GO_DECISION.md)
- [Winning specification v0.4](WINNING_SPEC_v0.4.md)
- [Top-10 gate report](TOP10_GATE_REPORT.md)
- [Benchmark report](BENCHMARK_REPORT.md)
- [Judging evidence map](submission/JUDGING_EVIDENCE.md)
- [90-second demo script](submission/VIDEO_SCRIPT.md)
- [Devpost submission copy](submission/DEVPOST_SUBMISSION.md)

## License

[MIT](LICENSE) © 2026 Takahiro Tsuchiya / TSUCHIYA LAB.
