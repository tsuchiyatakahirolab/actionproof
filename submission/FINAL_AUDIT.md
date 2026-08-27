# ActionProof final technical audit

**Audit date:** 2026-08-27 JST  
**Production:** https://actionproof.vercel.app  
**Repository:** https://github.com/tsuchiyatakahirolab/actionproof  
**Result:** the improved release-hold build passes implementation, build, native-browser, benchmark, dependency, media, and secret checks locally. Its final push, production promotion, and production re-audit are deliberately held until the deadline release window.

## Clean-install verification

| Check | Result |
|---|---|
| `npm ci` | PASS — 199 packages installed; 0 vulnerabilities reported |
| `npm run check` | PASS — TypeScript project check |
| `npm test` | PASS — 8/8 unit tests, including wrong-value and timeout controls |
| `npm run build` | PASS — production Vite build |
| `npm run test:ui` | PASS — 2/2 native Chrome WebMCP E2E tests |
| `npm run benchmark` | PASS — controlled comparison succeeded |
| `npm run audit:production` | RELEASE GATE — rerun after the held build is promoted |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities |
| credential-pattern scan | PASS — no credential-shaped matches |
| `git diff --check` | PASS |
| GitHub Actions CI | RELEASE GATE — held revision has not been pushed |

## Native Chrome evidence for the held build

- Installed Chrome 151 launched with `--enable-features=WebMCP,WebMCPTesting`.
- Local production preview reported `Native WebMCP · 1 context-matched tool`.
- Chrome `getTools()` exposed only `cancel_order` in the order context and only `change_user_role` in the permission context.
- Registered schemas exposed exact enums for the visible target/value and rejected additional properties.
- Order workflow: seeded defect detected; identical regression passed after repair.
- Permission workflow: seeded defect detected; identical regression passed after repair.
- Plain comparison fixture also reported native WebMCP.
- The registration uses same-origin `exposedTo`; the app header remains `Permissions-Policy: tools=*` for the top-level WebMCP feature.
- Collected local-preview console errors: zero.

The existing `submission/PRODUCTION_AUDIT.json` records the previous public revision and must be replaced by the release-day audit before submission.

## Benchmark evidence

- Official WebMCP Evals matcher version: 0.0.3.
- Correct calls matched: 2/2.
- Deliberately wrong-argument negative controls rejected: 2/2.
- Collateral defects present after matched calls: 2/2.
- Manual Playwright: four concrete expected-state assertions; defect run exited non-zero; unchanged repair run exited zero.
- ActionProof: two action bindings, zero per-record expected-state assertions in scenario definitions; two defects detected; two identical regressions passed.

Machine-readable result: `benchmarks/results/latest.json`.

## Media evidence

- Final demo: `submission/actionproof-demo-90s.mp4`
- Duration: 90.00 seconds
- Video: H.264 High, 1440×900, 25 fps
- Audio: AAC-LC, English Microsoft Zira narration
- SHA-256: `6583309429B7761F3632987036E313D180878F4385B34D102DCDA78770299596`
- 16:9 upload thumbnail: `submission/youtube-thumbnail.png`
- Silent-audit source screen: `submission/thumbnail.png`

Ten-second contact-sheet review covered the hero, contract, native action, successful return, failed effect, repaired order pass, permission repair pass, and comparison screen. Exact 80-second and 88-second frame reviews confirmed the comparison cards and final hero/native/pass composition. Silence detection confirmed clean gaps between all ten TTS segments without narration overlap at segment boundaries.

## Release-hold state

- The previous GitHub/Vercel revision remains public from the earlier authorized release.
- The improved code, benchmark, media, and submission copy exist only in the local working tree.
- No improved commit has been pushed, no Vercel promotion has occurred, and no YouTube upload has been made.
- Release-day order: final clean audit → push → CI → deploy/promote → production audit → public YouTube → Devpost preview → owner submit.

## Human-only gates not represented as automated PASS

- An unfamiliar human's recorded 20-second comprehension answers.
- Owner review of the public YouTube upload after transcoding.
- Owner review and final click on Devpost Submit.

These are kept separate so automated evidence is not presented as human validation.
