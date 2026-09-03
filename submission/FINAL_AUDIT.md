# ExactDelta final technical audit

**Audit date:** 2026-09-03 JST
**Production:** https://actionproof.vercel.app
**Repository:** https://github.com/tsuchiyatakahirolab/actionproof
**Result:** the improved release-hold build passes implementation, build, native-browser, benchmark, dependency, media, and secret checks locally. Its final push, production promotion, and production re-audit are deliberately held until the deadline release window.

## Clean-install verification

| Check | Result |
|---|---|
| `npm ci` | PASS — 206 packages installed from lockfile; 207 packages audited; 0 vulnerabilities reported |
| `npm run check` | PASS — TypeScript project check |
| `npm test` | PASS — 28/28 unit tests, including both native input dialects, exactly-once application-write enforcement, JSON artifact parsing/re-execution, contract/identity-drift fail-before-write, repeated no-op rejection, post-mutation failure, client abort, snapshot identity/invariant, delimiter collisions, external-argument controls, generic consumer-adapter execution/replay, and consumer argument-drift rejection before write |
| `npm run build` | PASS — production Vite build |
| `npm run test:ui` | PASS — 9/9 native Chrome WebMCP E2E tests, including concrete `#1042 only` versus `#1042 + #1043` hero proof assertions, permission-workflow equivalents, human target reselection with native schema rebinding, direct and repeated external-call gates, concurrent-call fail-closed control, 1280×720 first-viewport layout, no premature regression PASS, and zero automated WCAG A/AA violations in initial and blocked states |
| `npm run regression:ci:all` | PASS — four JSON-driven executions: both artifacts detect the seeded defect and prove the repair with identical intent, arguments, contract, and regression identity |
| `npm run audit:build` | PASS — 70,536 gzip bytes total emitted JS, 5,942 gzip bytes CSS, 796 gzip bytes HTML; no external runtime assets or source maps; complete social metadata and valid 1280×720 PNG card |
| `npm run audit:package` | PASS — NodeNext consumer typecheck, typed zero-runtime-dependency ESM distribution, 10,804-byte bundle, generated declarations, actual tarball installation into a fresh project, support-ticket `FAILED_EFFECT` → identical `ACTION_PROVEN`, and `npm pack --dry-run` (16.1 KB tarball estimate) |
| `npm run audit:runtime` | PASS — three cold Chrome desktop runs at declared 40 ms / 10 Mbps / 1x CPU; worst TTFB 18 ms, FCP/LCP 1,312 ms, TBT 0 ms, CLS 0.0007; zero cross-origin runtime requests, automated WCAG A/AA violations, or console errors |
| `npm run benchmark` | PASS — controlled comparison succeeded |
| `node scripts/record-demo.mjs` | PASS — regenerated the held UI as a 90.00-second H.264/AAC demo with the existing audited sentence-level neural narration |
| `npm run demo:audit` | PASS — 26/26 sentence clips preserve ≥600 ms pauses; final-media codec, duration, volume, and audible-pause checks pass |
| `npm run submission:images` | PASS — five 1440×900 native-Chrome judge images regenerated from live defect/repair flows with zero console errors |
| `npm run audit:production` | RELEASE GATE — rerun after the held build is promoted |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities |
| dependency/license inventory | REVIEWED after clean install — the SDK manifest has zero runtime dependencies; React is bundled into the demo application from development dependencies; tooling including `tsx` is recorded; non-runtime MPL/GPL build tools are disclosed in `THIRD_PARTY_NOTICES.md`; no dependency directory or tool binary is tracked |
| credential-pattern scan | PASS — no credential-shaped matches |
| `git diff --check` | PASS |
| GitHub Actions CI | RELEASE GATE — held revision has not been pushed |

## Native Chrome evidence for the held build

- Installed Chrome 151 launched with `--enable-features=WebMCP,WebMCPTesting`.
- Local production preview reported `Native WebMCP · 1 context-matched tool`.
- Chrome `getTools()` exposed only `cancel_order` in the order context and only `change_user_role` in the permission context.
- Registered schemas exposed exact enums for the visible target/value and rejected additional properties.
- Selecting Order #1043 in the visible table regenerated the Effect Contract and intent, re-registered the native tool with `order_id.enum = ["#1043"]`, executed that target, and produced regression ID `orders__1043__status__to-cancelled`; the unselected #1042 became the detected collateral effect.
- A direct `executeTool()` call from the external browser-client path preserved the original `{ success: true }` payload and added a separate blocked `effectGate` verdict plus the complete executable `exactdelta.regression.v1` artifact; the UI independently showed the external-call label and unexpected collateral mutation without using the deterministic replay button.
- Codex's in-app browser accepted object input after the read-only dialect probe, received the original success payload plus `effectGate.status: blocked`, `unexpectedChanges: 1`, and the regression ID, and then completed the visible defect → block → repair → identical PASS path with zero console warnings or errors. Chrome's JSON-string path remains covered by the native E2E suite; no application write is retried for compatibility.
- Two simultaneous external calls produced one verified execution and one native WebMCP rejection; the second call did not mutate state or bypass the in-flight gate.
- Order workflow: seeded defect detected; identical regression passed after repair.
- Permission workflow: seeded defect detected; identical regression passed after repair.
- Plain comparison fixture also reported native WebMCP.
- The registration uses same-origin `exposedTo`; the app header remains `Permissions-Policy: tools=*` for the top-level WebMCP feature.
- Collected local-preview console errors: zero.

The existing `submission/PRODUCTION_AUDIT.json` records the previous public revision and must be replaced by the release-day audit before submission. `submission/private/HELD_PRODUCTION_AUDIT.json` records the refreshed held build against a local production preview: native WebMCP, both context-matched tools, both defect detections, both identical regression passes, `tools=*`, a valid PNG social card, and zero console errors.

## Delivery-quality evidence

- The distribution budget measures every emitted JavaScript and CSS asset, rather than only the entry chunk. The current totals are 70,536 gzip bytes JS, 5,942 gzip bytes CSS, and 796 gzip bytes HTML.
- The build has no externally loaded runtime scripts/styles, no production source maps, complete description/Open Graph/Twitter metadata, and a signature/dimension-validated 1280×720 PNG social card.
- Three independent cold Chrome desktop contexts were measured at 1440×900 with 40 ms latency, 10 Mbps down, 5 Mbps up, and 1x CPU. The gate uses the worst run: TTFB 18 ms, FCP/LCP 1,312 ms, TBT 0 ms, and CLS 0.0007.
- axe-core reports zero automated WCAG A/AA violations in the initial and blocked proof states. The interactive record grid now has complete table/row/header/cell semantics and all detected contrast failures were repaired.
- The first viewport now names the accepted native call, renders the allowed target (`#1042 only`) beside the observed target set (`#1042 + #1043`), marks the collateral ID independently, and states the stopped-release consequence. A one-shot staged reveal uses only transform and outline emphasis—never faded text—and honors reduced-motion preferences.
- These values are bounded local lab evidence, not field telemetry, a Lighthouse score, or a guarantee for every device/network.

## Package and external-consumer evidence

- `src/exactdelta.ts` exposes `runEffectGate()`, the Effect Contract primitives, artifact parsing/creation, and `runRegressionWithAdapter()` as a typed ESM API.
- The demo's `runExactDelta()` now delegates to the same public gate instead of owning a fixture-only verification implementation.
- A separate support-ticket consumer imports the package by name without using `ScenarioStore`, detects a collateral ticket write as `FAILED_EFFECT`, exports that regression, and reaches `ACTION_PROVEN` with the identical artifact against the repaired adapter.
- The audit creates the actual tarball, installs it into a fresh temporary project with scripts disabled, and repeats that full consumer flow through the installed artifact.
- Generic artifact replay rejects consumer argument drift before invoking the write and passes the identical artifact against a repaired external adapter.
- The distribution bundle is 10,804 bytes raw (3.34 KB gzip), has generated declarations and no runtime dependencies, passes a strict NodeNext consumer typecheck, and produces a 16.1 KB dry-run package manifest. This is packed-install evidence, not npm publication, customer adoption, production certification, or measured demand.

## Benchmark evidence

- Official WebMCP Evals matcher version: 0.0.4.
- Correct calls matched: 2/2.
- Deliberately wrong-argument negative controls rejected: 2/2.
- Collateral defects present after matched calls: 2/2.
- Manual Playwright: four concrete expected-state assertions; defect run exited non-zero; unchanged repair run exited zero.
- ExactDelta: two action bindings, zero per-record expected-state assertions in scenario definitions; two defects detected; two identical regressions passed.

Machine-readable result: `benchmarks/results/latest.json`.

## Media evidence

- Final demo: `submission/exactdelta-demo-90s.mp4`
- Duration: 90.00 seconds
- Video: H.264 High, 1440×900, 25 fps
- Audio: AAC-LC, English `en-US-AndrewMultilingualNeural` narration generated with pinned `edge-tts` 7.2.8
- Audio level: mean −22.4 dB, peak −3.2 dB
- Sentence timing: 26 separate clips; all 25 inter-sentence gaps are 600 ms and the final tail is 640 ms; 28 final-video silence intervals ≥350 ms detected
- SHA-256: `45ACA26A42371CDC561BCBA7025009FD955E0926BD54196D79891503B701F836`
- 16:9 upload thumbnail: `submission/youtube-thumbnail-v2.png` (deterministically rendered from the native held build after the external seeded call; the hero Effect Trace and release decision are visible in one frame)
- Thumbnail SHA-256: `17294087DCEA3A8F2176D12891F321BE8AA63E54068C939FFD6207F1BBD475EE`
- Silent-audit source screen: `submission/thumbnail.png`
- Devpost gallery order and captions: `submission/GALLERY.md`; five current-UI images cover the hook, full failure proof, identical repair, second workflow, and measured comparison.

Representative-frame review confirmed the seeded Effect Trace at 2 seconds, the full external-call order failure proof by 15 seconds, `VERIFYING` rather than premature `PASS` during repair at 57 seconds, the permission failure at 70 seconds, and the identical permission regression PASS, comparison cards, and package-integration rail at 79–89 seconds. The narration text and starts are fixed in `scripts/narration-timeline.json`; `scripts/audit-narration.mjs` measures the generated files rather than trusting scheduled timings.

`edge-tts` is an online, third-party build tool for the video asset, not an ExactDelta runtime integration. The final MP4 is committed, so judges do not need Python, the package, or network TTS access to watch or run the product.

## Release-hold state

- The previous GitHub/Vercel revision remains public from the earlier authorized release.
- The improved code, benchmark, media, and submission copy are frozen on the held local branch and are not published.
- No improved commit has been pushed and no Vercel promotion has occurred. An earlier unlisted YouTube upload exists, but the newly audited local MP4 above has not been uploaded; replacement/public visibility remains a release-window task.
- Release-day order: canonical ExactDelta URL/redirect decision → final clean audit → push → CI → deploy/promote → production audit → public YouTube → update every submission URL → Devpost preview → owner submit.

## Human-only owner gates not represented as automated PASS

- Owner review of the public YouTube upload after transcoding.
- Owner review and final click on Devpost Submit.

An unfamiliar-viewer check is optional UX feedback only and is not represented as correctness, demand, or submission-readiness evidence.
