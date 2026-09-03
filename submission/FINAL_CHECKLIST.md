# Submission owner checklist

## Recommended release clock — JST

- **Until 00:30:** keep the final revision private; only blocker fixes are allowed.
- **00:30–01:30:** final competitor scan, clean audit, push, and make the required repository/live artifacts public.
- **By 02:00:** complete CI, Vercel promotion, production WebMCP/header/console checks, and canonical-link verification.
- **By 02:30:** make the already-audited YouTube upload public and verify public playback, audio, thumbnail, and HD processing.
- **By 03:30:** synchronize Devpost text, five images, URLs, and preview; owner performs final Submit.
- **04:00 hard stop:** preserve one hour before the 05:00 JST deadline for recovery. Do not intentionally defer the first public release past 01:30.

## Automated evidence

- [x] New-project timing and rule requirements mapped in `submission/RULES_COMPLIANCE.md`
- [x] `npm ci`
- [x] `npm run check`
- [x] `npm test`
- [x] `npm run build`
- [x] `npm run test:ui`
- [x] `npm run benchmark`
- [x] `npm run regression:ci:all`
- [ ] Final held build promoted and Chrome native WebMCP badge plus both workflows reverified on the production URL
- [x] Console errors: zero in primary demo path
- [x] Secret scan clean
- [ ] Final held git diff/status audited and pushed at release time

## Public artifacts

- [x] Public GitHub repository reachable and MIT license detected
- [ ] Final README revision pushed with setup, architecture, limitations, tests, benchmark, and judge path
- [ ] Public app/repository slugs match `ExactDelta`, or the retained legacy slugs redirect cleanly; every Devpost, README, and video link uses one verified canonical destination
- [ ] If the canonical app URL changes, update the absolute `og:image` URL in `index.html`; verify the 1280×720 link preview
- [ ] Final live build promoted and reachable without sign-in
- [ ] Public English YouTube video under three minutes with audible narration
- [ ] Upload `gallery-01` through `gallery-05` in the order and with the captions recorded in `submission/GALLERY.md`
- [ ] Devpost links point to the final production URL, repository, and video

## Optional subjective UX check

- [ ] If time permits, use `submission/PRIVATE_VALIDATION_PROTOCOL.md` only to detect confusing copy or layout; do not treat three opinions as correctness or score evidence

## Owner audits

- [ ] Owner watches the final uploaded video end to end with captions/audio enabled
- [ ] Owner verifies every submission statement against the repository and measured artifacts

## Final owner-controlled action

- [ ] Read and accept the official rules
- [ ] Approve the final Devpost preview
- [ ] Click **Submit**

Codex must stop before the final Devpost submission action.
