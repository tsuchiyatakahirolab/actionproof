# ExactDelta final technical audit

**Audit date:** 2026-08-28 JST
**Production:** https://actionproof.vercel.app
**Repository:** https://github.com/tsuchiyatakahirolab/actionproof
**Result:** the improved release-hold build passes implementation, build, native-browser, benchmark, dependency, media, and secret checks locally. Its final push, production promotion, and production re-audit are deliberately held until the deadline release window.

## Clean-install verification

| Check | Result |
|---|---|
| `npm ci` | PASS — 200 packages installed; 0 vulnerabilities reported |
| `npm run check` | PASS — TypeScript project check |
| `npm test` | PASS — 15/15 unit tests, including repeated no-op rejection, post-mutation failure, client abort, identity/invariant, delimiter-collision, external-argument, wrong-value, and timeout controls |
| `npm run build` | PASS — production Vite build |
| `npm run test:ui` | PASS — 6/6 native Chrome WebMCP E2E tests, including direct and repeated external-call gates, concurrent-call fail-closed control, and 1280×720 judge-path layout control |
| `npm run benchmark` | PASS — controlled comparison succeeded |
| `npm run demo:record` | PASS — regenerated 90.00-second H.264/AAC demo with sentence-level neural narration |
| `npm run demo:audit` | PASS — 26/26 sentence clips preserve ≥600 ms pauses; final-media codec, duration, volume, and audible-pause checks pass |
| `npm run audit:production` | RELEASE GATE — rerun after the held build is promoted |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities |
| dependency/license inventory | REVIEWED — 182 installed package records; runtime React packages are MIT; non-runtime MPL/GPL build tools are disclosed in `THIRD_PARTY_NOTICES.md`; no dependency directory or tool binary is tracked |
| credential-pattern scan | PASS — no credential-shaped matches |
| `git diff --check` | PASS |
| GitHub Actions CI | RELEASE GATE — held revision has not been pushed |

## Native Chrome evidence for the held build

- Installed Chrome 151 launched with `--enable-features=WebMCP,WebMCPTesting`.
- Local production preview reported `Native WebMCP · 1 context-matched tool`.
- Chrome `getTools()` exposed only `cancel_order` in the order context and only `change_user_role` in the permission context.
- Registered schemas exposed exact enums for the visible target/value and rejected additional properties.
- A direct `executeTool()` call from the external browser-client path preserved the original `{ success: true }` payload and added a separate blocked `effectGate` verdict; the UI independently showed the external-call label and unexpected collateral mutation without using the deterministic replay button.
- Codex's in-app browser repeated that real client path after the single-flight hardening and received the original success payload plus `effectGate.status: blocked`, `unexpectedChanges: 1`, and the regression ID; the UI showed `EXTERNAL WEBMCP CALL`, `REQUESTED 1 · CHANGED 2`, and the blocked split verdict with zero console errors. `submission/exactdelta-agent-proof.png` preserves the earlier local proof screen.
- Two simultaneous external calls produced one verified execution and one native WebMCP rejection; the second call did not mutate state or bypass the in-flight gate.
- Order workflow: seeded defect detected; identical regression passed after repair.
- Permission workflow: seeded defect detected; identical regression passed after repair.
- Plain comparison fixture also reported native WebMCP.
- The registration uses same-origin `exposedTo`; the app header remains `Permissions-Policy: tools=*` for the top-level WebMCP feature.
- Collected local-preview console errors: zero.

The existing `submission/PRODUCTION_AUDIT.json` records the previous public revision and must be replaced by the release-day audit before submission. `submission/private/HELD_PRODUCTION_AUDIT.json` records the refreshed held build against a local production preview: native WebMCP, both context-matched tools, both defect detections, both identical regression passes, `tools=*`, and zero console errors.

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
- Audio level: mean −22.2 dB, peak −4.0 dB
- Sentence timing: 26 separate clips; minimum measured inter-sentence pause 600 ms; 30 final-video silence intervals ≥350 ms detected
- SHA-256: `EA617582F1F1457505D874AB427E6D1E5C43F4577EC7769578638C6E82089B22`
- 16:9 upload thumbnail: `submission/youtube-thumbnail.png`
- Silent-audit source screen: `submission/thumbnail.png`

Representative-frame review confirmed the hook and agent prompt, the full external-call order failure proof by 15 seconds, the permission failure at 70 seconds, the identical permission regression PASS at 75 seconds, the comparison cards at 79 seconds, and the final composition. The narration text and starts are fixed in `scripts/narration-timeline.json`; `scripts/audit-narration.mjs` measures the generated files rather than trusting scheduled timings.

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
