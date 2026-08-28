# ExactDelta formal GO decision

**Decision:** `EXACTDELTA_TOP10_GATE_PASS`

**Approved:** 2026-08-27 JST

The owner formally approved ExactDelta for full implementation and submission preparation for the WebMCP Challenge. `WINNING_SPEC_v0.4.md`, `DEMO_SCRIPT_v0.2.md`, and `TOP10_GATE_REPORT.md` remain the scope baseline.

## Scope lock

- Keep the Effect Contract as the product center.
- Demonstrate the same verification core on order cancellation and permission change.
- Reproduce seeded defect → detection → repair → identical regression PASS.
- Compare fairly with official WebMCP Evals plus Playwright.
- Optimize the 20-second silent proof and the 90-second demo around: **“The agent did everything right. The result was still wrong.”**
- Prepare every public and submission artifact, but do not perform the final Devpost submit without owner approval.

This decision replaces the prototype-only hold recorded in the earlier gate documents. It does not waive the evidence, safety, or unsupported-claim constraints in `AGENTS.md`.
