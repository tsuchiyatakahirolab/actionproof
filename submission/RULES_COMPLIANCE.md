# WebMCP Challenge rules compliance record

2026-08-29 JST / pre-release internal audit / owner must re-check the final Devpost form

## Project eligibility and timing

| Requirement | Evidence | Status |
|---|---|---|
| New or meaningfully extended during the submission period | The first design files are dated 2026-08-26. Repository history begins on 2026-08-27, after the official 2026-08-25 start. No pre-hackathon product code is represented. | PASS |
| WebMCP-powered web app | Native imperative `document.modelContext.registerTool()`, context lifecycle, discovery, and execution are implemented in source and exercised in Chrome. | PASS |
| Runs as depicted | Production build, 24 unit tests, four JSON-driven regression executions, 9 native Chrome E2E tests, build/runtime quality gates, in-app-browser verification, controlled benchmark, and audited 90-second video are recorded in `FINAL_AUDIT.md`. | PASS LOCALLY / PRODUCTION RE-AUDIT REQUIRED |
| Human-agent collaboration | The human-visible selection generates the permitted delta; the browser agent invokes the matching page tool; the application verifies and returns the separate effect-gate verdict. | PASS |

## Required submission artifacts

| Requirement | Evidence | Status |
|---|---|---|
| Working live URL accessible to judges | Existing Vercel target is recorded; the held ExactDelta revision must be promoted and re-audited in the owner-approved window. | RELEASE GATE |
| Public source repository | Existing GitHub target is recorded; held commits and the canonical ExactDelta URL/redirect must be pushed and verified. | RELEASE GATE |
| Detectable open-source license | Root `LICENSE` is MIT and names Takahiro Tsuchiya / TSUCHIYA LAB. | PASS |
| Source, assets, and instructions | Source, test commands, demo fixture instructions, benchmark method, limitations, and final MP4 are present. | PASS LOCALLY |
| Text explains WebMCP fit, better UX, collaboration, and implementation | `DEVPOST_SUBMISSION.md` contains dedicated sections for all four requirements. | PASS |
| Demo video | Audited 90.00-second English H.264/AAC file exists locally. Public upload and end-to-end playback remain owner release gates. | PASS LOCALLY / PUBLIC URL REQUIRED |
| Static judging path | Five current-UI 1440×900 captures and bounded captions are generated from native-Chrome defect/repair flows in `submission/GALLERY.md`. | PASS |

## Rights and representation

- All application records and failures are fictional and deliberately seeded.
- No incident, production transaction, certification, or universal adapter is claimed.
- Runtime dependencies are listed in `package-lock.json`; repository distribution is MIT.
- Third-party runtime, build, test, and narration tooling is inventoried in `THIRD_PARTY_NOTICES.md`; generated/dependency directories and tool binaries are not tracked.
- The final owner review must confirm eligibility, entrant identity, accepted rules, canonical URLs, and every Devpost field before Submit.

`EXACTDELTA_RULES_TECHNICAL_AUDIT_PASS`
