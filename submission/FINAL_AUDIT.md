# ActionProof final technical audit

**Audit date:** 2026-08-27 JST  
**Production:** https://actionproof.vercel.app  
**Repository:** https://github.com/tsuchiyatakahirolab/actionproof  
**Result:** all automated implementation, build, browser, benchmark, production, dependency, and secret checks passed.

## Clean-install verification

| Check | Result |
|---|---|
| `npm ci` | PASS — 199 packages installed; 0 vulnerabilities reported |
| `npm run check` | PASS — TypeScript project check |
| `npm test` | PASS — 6/6 unit tests |
| `npm run build` | PASS — production Vite build |
| `npm run test:ui` | PASS — 2/2 native Chrome WebMCP E2E tests |
| `npm run benchmark` | PASS — controlled comparison succeeded |
| `npm run audit:production` | PASS — both workflows, baseline, header, and console checks |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities |
| credential-pattern scan | PASS — no credential-shaped matches |
| `git diff --check` | PASS |
| GitHub Actions CI | PASS on public `main` branch |

## Native Chrome and production evidence

- Installed Chrome 151 launched with `--enable-features=WebMCP,WebMCPTesting`.
- Production UI reported `Native WebMCP active`.
- Order workflow: seeded defect detected; identical regression passed after repair.
- Permission workflow: seeded defect detected; identical regression passed after repair.
- Plain comparison fixture also reported native WebMCP.
- `Permissions-Policy` response header equals `tools=*`.
- Collected production console errors: zero.

Machine-readable result: `submission/PRODUCTION_AUDIT.json`.

## Benchmark evidence

- Official WebMCP Evals matcher version: 0.0.3.
- Correct calls matched: 2/2.
- Collateral defects present after matched calls: 2/2.
- Manual Playwright: four concrete expected-state assertions; defect run exited non-zero; unchanged repair run exited zero.
- ActionProof: two action bindings, zero per-record expected-state assertions in scenario definitions; two defects detected; two identical regressions passed.

Machine-readable result: `benchmarks/results/latest.json`.

## Media evidence

- Final demo: `submission/actionproof-demo-90s.mp4`
- Duration: 90.00 seconds
- Video: H.264 High, 1440×900, 25 fps
- Audio: AAC-LC, English Microsoft Zira narration
- SHA-256: `1C73D9B6DDCD8BDB853A6F98419CBE9E455D8A582F52469B25717890D7C93AB4`
- 16:9 upload thumbnail: `submission/youtube-thumbnail.png`
- Silent-audit source screen: `submission/thumbnail.png`

Ten-second contact-sheet review covered the hero, contract, native action, successful return, failed effect, repaired order pass, permission defect, permission repair pass, and comparison screen.

## Public release state

- GitHub visibility: PUBLIC
- Default branch: `main`
- License detection: MIT
- Topics: `webmcp`, `testing`, `browser-agents`, `typescript`
- Vercel production alias: `https://actionproof.vercel.app`
- GitHub Actions CI: successful

## Human-only gates not represented as automated PASS

- An unfamiliar human's recorded 20-second comprehension answers.
- Owner review of the public YouTube upload after transcoding.
- Owner review and final click on Devpost Submit.

These are kept separate so automated evidence is not presented as human validation.
