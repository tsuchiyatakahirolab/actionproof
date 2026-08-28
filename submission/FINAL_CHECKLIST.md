# Submission owner checklist

## Automated evidence

- [x] New-project timing and rule requirements mapped in `submission/RULES_COMPLIANCE.md`
- [x] `npm ci`
- [x] `npm run check`
- [x] `npm test`
- [x] `npm run build`
- [x] `npm run test:ui`
- [x] `npm run benchmark`
- [ ] Final held build promoted and Chrome native WebMCP badge plus both workflows reverified on the production URL
- [x] Console errors: zero in primary demo path
- [x] Secret scan clean
- [ ] Final held git diff/status audited and pushed at release time

## Public artifacts

- [x] Public GitHub repository reachable and MIT license detected
- [ ] Final README revision pushed with setup, architecture, limitations, tests, benchmark, and judge path
- [ ] Public app/repository slugs match `ExactDelta`, or the retained legacy slugs redirect cleanly; every Devpost, README, and video link uses one verified canonical destination
- [ ] Final live build promoted and reachable without sign-in
- [ ] Public English YouTube video under three minutes with audible narration
- [ ] Devpost links point to the final production URL, repository, and video

## Human audits

- [ ] Run `submission/PRIVATE_VALIDATION_PROTOCOL.md` with 3 unfamiliar participants; keep raw notes private and add only a consented anonymous aggregate if its thresholds pass
- [ ] Unfamiliar reviewers see the final 20-second silent screen and can answer: who has the problem, what release decision ExactDelta made, what went wrong, why call checks were insufficient, and why WebMCP matters
- [ ] Owner watches the final uploaded video end to end with captions/audio enabled
- [ ] Owner verifies every submission statement against the repository and measured artifacts

## Final owner-controlled action

- [ ] Read and accept the official rules
- [ ] Approve the final Devpost preview
- [ ] Click **Submit**

Codex must stop before the final Devpost submission action.
