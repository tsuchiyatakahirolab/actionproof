# WebMCP Challenge rules compliance record

2026-09-04 JST / release-window audit / final Devpost synchronization in progress

## Project eligibility and timing

| Requirement | Evidence | Status |
|---|---|---|
| New or meaningfully extended during the submission period | The first design files are dated 2026-08-26. Repository history begins on 2026-08-27, after the official 2026-08-25 start. No pre-hackathon product code is represented. | PASS |
| WebMCP-powered web app | Native imperative `document.modelContext.registerTool()`, context lifecycle, discovery, and execution are implemented in source and exercised in Chrome. | PASS |
| Runs as depicted | Production build, 28 unit tests, fresh-project packed-install and third-workflow replay audit, four JSON-driven regression executions, 9 native Chrome E2E tests, build/runtime quality gates, in-app-browser verification, controlled benchmark, public 90-second video, and release-day production re-audit are recorded in `FINAL_AUDIT.md`. | PASS |
| Human-agent collaboration | The human-visible selection generates the permitted delta; the browser agent invokes the matching page tool; the application verifies and returns the separate effect-gate verdict. | PASS |

## Required submission artifacts

| Requirement | Evidence | Status |
|---|---|---|
| Working live URL accessible to judges | `https://actionproof.vercel.app` is public and the final production audit passes both native WebMCP workflows. | PASS |
| Public source repository | `https://github.com/tsuchiyatakahirolab/actionproof` is public at the release revision and GitHub detects the MIT license. | PASS |
| Detectable open-source license | Root `LICENSE` is MIT and names Takahiro Tsuchiya / TSUCHIYA LAB. | PASS |
| Source, assets, and instructions | Source, test commands, demo fixture instructions, benchmark method, limitations, and final MP4 are present in the public repository. | PASS |
| Text explains WebMCP fit, better UX, collaboration, and implementation | `DEVPOST_SUBMISSION.md` contains dedicated sections for all four requirements. | PASS |
| Demo video | The audited 90.00-second English H.264/AAC demo is public at `https://youtu.be/RQTKcWN5t9s`, with the custom thumbnail and no copyright issues reported. | PASS |
| Static judging path | Five current-UI 1440×900 captures and bounded captions are generated from native-Chrome defect/repair flows in `submission/GALLERY.md`. | PASS |

## Rights and representation

- All application records and failures are fictional and deliberately seeded.
- No incident, production transaction, certification, or universal adapter is claimed.
- Runtime dependencies are listed in `package-lock.json`; repository distribution is MIT.
- Third-party runtime, build, test, and narration tooling is inventoried in `THIRD_PARTY_NOTICES.md`; generated/dependency directories and tool binaries are not tracked.
- The final owner review must confirm eligibility, entrant identity, accepted rules, canonical URLs, and every Devpost field before Submit.

`EXACTDELTA_RULES_TECHNICAL_AUDIT_PASS`
