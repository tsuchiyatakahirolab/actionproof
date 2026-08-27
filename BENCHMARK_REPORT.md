# ActionProof detection-coverage benchmark

**Measured:** 2026-08-27 JST  
**Technical audience:** WebMCP application developers, QA engineers, and hackathon judges  
**Result:** the controlled comparison reproduced the call/effect gap in both workflows and showed precisely what manual assertions add.

## Technical summary

Two correct native WebMCP calls were executed against two deterministic fake-data handlers containing the same class of seeded collateral-mutation defect. The official `webmcp-evals` 0.0.3 trajectory matcher passed both tool calls because the function names and arguments matched. Independent state reads confirmed that both calls also changed an unselected neighboring record.

Adding four concrete expected-state assertions in Playwright detected both defects; the identical assertions passed after the handler repairs. ActionProof detected both defects and passed both identical retained regressions using two action bindings and generated required/unchanged checks, with no per-record expected-state assertions in the scenario definitions.

This supports one narrow conclusion: **tool-call matching and post-action effect verification cover different failure surfaces.** It does not establish runtime superiority, lower total engineering cost, universal adapter support, or customer demand.

## Findings

| Method | Correct calls matched | Seeded collateral defects present | Defects detected by the method | Repair verified unchanged |
|---|---:|---:|---:|---:|
| Official WebMCP Evals trajectory matcher | 2/2 | 2/2 | 0/2 at the call-matching layer | Not evaluated |
| Evals + manual Playwright state assertions | 2/2 | 2/2 | 2/2 | 2/2 |
| ActionProof generated Effect Contracts | 2/2 | 2/2 | 2/2 | 2/2 |

Authoring inputs in this fixture:

| Method | Explicit expected-state inputs |
|---|---:|
| Manual Playwright | 4 concrete per-record state assertions across two workflows |
| ActionProof | 2 action bindings; 0 concrete per-record expected-state assertions in the scenario definitions |

The second table is descriptive, not a claim that ActionProof always requires less code. An ActionProof integration still needs an application-owned state adapter and an action binding that declares the selected IDs and intended mutation.

## Scope and metric definitions

- **Workflow:** order cancellation or permission change.
- **Correct call:** function name and arguments match the checked Evals `expectedCall` entry.
- **Collateral defect:** an unselected neighboring entity changes in the same field as the selected entity.
- **Detected:** the method returns a failing outcome because of the collateral state, rather than because the call was wrong.
- **Repair verified unchanged:** the same test or retained contract passes after disabling only the seeded handler defect.
- **Per-record expected-state assertion:** a test-authored assertion naming a concrete record and expected field value.

The benchmark does not measure wall-clock product performance. Command durations in `latest.json` are recorded only for reproducibility and are affected by process startup.

## Method

1. Build the production Vite application.
2. Launch installed Chrome 151 headlessly with `--enable-features=WebMCP,WebMCPTesting`.
3. Open the plain `baseline.html` fixture with the seeded defect enabled.
4. Invoke the registered tool through `document.modelContext.getTools()` and `executeTool()`.
5. Score the captured name/arguments with `evaluateExecutionTrajectory()` from the installed official `webmcp-evals` 0.0.3 package.
6. Read the post-action target and unselected-neighbor fields from the page.
7. Run the manual Playwright suite against the defective handler. A non-zero exit is the expected detection result.
8. Run the identical manual suite with only the defect disabled. A zero exit is required.
9. Run the ActionProof native-Chrome UI suite. Each workflow must show `FAILED_EFFECT`, then `ACTION_PROVEN`, with the same regression case.

The deterministic matcher path deliberately excludes LLM selection variability. It measures the documented Evals expected-call layer, not an end-to-end model's probability of choosing the tool.

## Reproduction

```bash
npm install
npm run benchmark
```

Evidence files:

- `benchmarks/results/latest.json` — summarized measured result
- `benchmarks/results/evals-comparison.json` — per-workflow matcher and state observations
- `benchmarks/results/webmcp-evals.log` — native-call/matcher output
- `benchmarks/results/manual-playwright-defect.log` — expected failing state assertions
- `benchmarks/results/manual-playwright-fixed.log` — identical assertions passing after repair
- `benchmarks/results/actionproof-ui.log` — ActionProof native-Chrome UI result
- `benchmarks/manual-playwright.spec.ts` — the four marked expected-state assertions

## Limitations and robustness

- The data, defects, and repairs are deterministic and synthetic; no real incident or customer is represented.
- Only two workflows and one collateral-mutation defect class are measured.
- In-memory state observation does not cover delayed jobs, external systems, or effects omitted from an adapter.
- The Evals result uses the official matcher library over an actual native WebMCP call, not the full CLI model backend. Therefore it does not measure prompt interpretation or tool selection.
- Assertion counts are not normalized to lines of code and should not be generalized to maintenance cost.
- The expected failing Playwright run is accepted only when the unchanged suite passes after repair.

## Next steps

For a production-oriented evaluation, add a server-side state adapter, delayed-effect polling, authorization boundaries, and a wider defect corpus without changing the contract/verifier core. Those extensions are deliberately outside the hackathon scope.

## Further questions

- Which application state surfaces can provide an authoritative post-action snapshot?
- How should delayed and eventually consistent effects be bounded in a contract?
- Which fields must be excluded or normalized to avoid false positives from timestamps and audit metadata?
