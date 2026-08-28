# ExactDelta final technical audit

**Audit date:** 2026-08-28 JST
**Production:** https://actionproof.vercel.app
**Repository:** https://github.com/tsuchiyatakahirolab/actionproof
**Result:** the improved release-hold build passes implementation, build, native-browser, benchmark, dependency, media, and secret checks locally. Its final push, production promotion, and production re-audit are deliberately held until the deadline release window.

## Clean-install verification

| Check | Result |
|---|---|
| `npm ci` | PASS — 203 packages installed; 0 vulnerabilities reported |
| `npm run check` | PASS — TypeScript project check |
| `npm test` | PASS — 24/24 unit tests, including both native input dialects, exactly-once application-write enforcement in each dialect, JSON artifact parsing/re-execution, contract/identity-drift fail-before-write, repeated no-op rejection, post-mutation failure, client abort, snapshot identity/invariant, delimiter-collision, external-argument, wrong-value, and timeout controls |
| `npm run build` | PASS — production Vite build |
| `npm run test:ui` | PASS — 8/8 native Chrome WebMCP E2E tests, including hero Effect Trace assertions, human target reselection with native schema rebinding, direct and repeated external-call gates, concurrent-call fail-closed control, 1280×720 first-viewport layout, and no premature regression PASS |
| `npm run regression:ci:all` | PASS — four JSON-driven executions: both artifacts detect the seeded defect and prove the repair with identical intent, arguments, contract, and regression identity |
| `npm run benchmark` | PASS — controlled comparison succeeded |
| `npm run demo:record` | PASS — regenerated 90.00-second H.264/AAC demo with sentence-level neural narration |
| `npm run demo:audit` | PASS — 26/26 sentence clips preserve ≥600 ms pauses; final-media codec, duration, volume, and audible-pause checks pass |
| `npm run submission:images` | PASS — five 1440×900 native-Chrome judge images regenerated from live defect/repair flows with zero console errors |
| `npm run audit:production` | RELEASE GATE — rerun after the held build is promoted |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities |
| dependency/license inventory | REVIEWED after clean install — runtime React packages are MIT; development tooling including `tsx` is recorded; non-runtime MPL/GPL build tools are disclosed in `THIRD_PARTY_NOTICES.md`; no dependency directory or tool binary is tracked |
| credential-pattern scan | PASS — no credential-shaped matches |
| `git diff --check` | PASS |
| GitHub Actions CI | RELEASE GATE — held revision has not been pushed |

## Native Chrome evidence for the held build

- Installed Chrome 151 launched with `--enable-features=WebMCP,WebMCPTesting`.
- Local production preview reported `Native WebMCP · 1 context-matched tool`.
- Chrome `getTools()` exposed only `cancel_order` in the order context and only `change_user_role` in the permission context.
- Registered schemas exposed exact enums for the visible target/value and rejected additional properties.
- Selecting Order #1043 in the visible table regenerated the Effect Contract and intent, re-registered the native tool with `order_id.enum = ["#1043"]`, executed that target, and produced regression ID `orders__1043__status__to-cancelled`; the unselected #1042 became the detected collateral effect.
- A direct `executeTool()` call from the external browser-client path preserved the original `{ success: true }` payload and added a separate blocked `effectGate` verdict; the UI independently showed the external-call label and unexpected collateral mutation without using the deterministic replay button.
- Codex's in-app browser accepted object input after the read-only dialect probe, received the original success payload plus `effectGate.status: blocked`, `unexpectedChanges: 1`, and the regression ID, and then completed the visible defect → block → repair → identical PASS path with zero console warnings or errors. Chrome's JSON-string path remains covered by the native E2E suite; no application write is retried for compatibility.
- Two simultaneous external calls produced one verified execution and one native WebMCP rejection; the second call did not mutate state or bypass the in-flight gate.
- Order workflow: seeded defect detected; identical regression passed after repair.
- Permission workflow: seeded defect detected; identical regression passed after repair.
- Plain comparison fixture also reported native WebMCP.
- The registration uses same-origin `exposedTo`; the app header remains `Permissions-Policy: tools=*` for the top-level WebMCP feature.
- Collected local-preview console errors: zero.

The existing `submission/PRODUCTION_AUDIT.json` records the previous public revision and must be replaced by the release-day audit before submission. `submission/private/HELD_PRODUCTION_AUDIT.json` records the refreshed held build against a local production preview: native WebMCP, both context-matched tools, both defect detections, both identical regression passes, `tools=*`, a valid PNG social card, and zero console errors.

## Benchmark evidence

- Official WebMCP Evals matcher version: 0.0.3.
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
- Audio level: mean −22.3 dB, peak −4.0 dB
- Sentence timing: 26 separate clips; minimum measured inter-sentence pause 600 ms; 29 final-video silence intervals ≥350 ms detected
- SHA-256: `6CF2BA78AD05745A2B6CEE39861DF80563ED022EBC685B3C4905CC98A532AF6A`
- 16:9 upload thumbnail: `submission/youtube-thumbnail-v2.png` (deterministically rendered from the native held build after the external seeded call; the hero Effect Trace and release decision are visible in one frame)
- Silent-audit source screen: `submission/thumbnail.png`
- Devpost gallery order and captions: `submission/GALLERY.md`; five current-UI images cover the hook, full failure proof, identical repair, second workflow, and measured comparison.

Representative-frame review confirmed the seeded Effect Trace at 2 seconds, the full external-call order failure proof by 15 seconds, `VERIFYING` rather than premature `PASS` during repair at 57 seconds, the permission failure at 70 seconds, the identical permission regression PASS and comparison cards at 79 seconds, and the final composition. The narration text and starts are fixed in `scripts/narration-timeline.json`; `scripts/audit-narration.mjs` measures the generated files rather than trusting scheduled timings.

`edge-tts` is an online, third-party build tool for the video asset, not an ExactDelta runtime integration. The final MP4 is committed, so judges do not need Python, the package, or network TTS access to watch or run the product.

## Release-hold state

- The previous GitHub/Vercel revision remains public from the earlier authorized release.
- The improved code, benchmark, media, and submission copy exist only in the local working tree.
- No improved commit has been pushed, no Vercel promotion has occurred, and no YouTube upload has been made.
- Release-day order: canonical ExactDelta URL/redirect decision → final clean audit → push → CI → deploy/promote → production audit → public YouTube → update every submission URL → Devpost preview → owner submit.

## Human-only owner gates not represented as automated PASS

- Owner review of the public YouTube upload after transcoding.
- Owner review and final click on Devpost Submit.

An unfamiliar-viewer check is optional UX feedback only and is not represented as correctness, demand, or submission-readiness evidence.
