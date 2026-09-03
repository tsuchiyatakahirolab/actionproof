# ExactDelta — final 90-second demo

## Narrative lock

**The agent did everything right. The result was still wrong.**

Target duration: 86–90 seconds. English neural narration. No music is required. Every record and failure is explicitly labeled fictional and seeded. Each sentence is rendered as a separate clip with a deliberate 0.5-second-or-longer pause before the next sentence.

| Time | Screen | Narration |
|---:|---|---|
| 0–7s | Hero, staging/fake-data/native badges, and seeded Effect Trace (`success: true`, requested 1, observed 2, release blocked) | “The agent did everything right.” [pause] “The result was still wrong.” |
| 7–13s | Real-agent handoff prompt and one context-matched tool | “This is ExactDelta, a pre-release effect gate for WebMCP writes.” |
| 13–31s | External call fires; selected target, generated contract, schema-bound call, and blocked effect become visible | “The page registers one native WebMCP tool.” [pause] “The visible target becomes the only permitted state delta.” [pause] “Its schema binds the call to Order 1042.” [pause] “The agent invokes it directly through WebMCP.” |
| 31–39s | `success: true`, external-call label | “The tool returns success.” [pause] “The call was correct.” [pause] “The effect was not.” |
| 39–56s | Observed table; 1042 required, 1043 unexpected; gate blocked | “The seeded handler cancelled both orders.” [pause] “ExactDelta observes application state independently of the return payload.” [pause] “Requested one.” [pause] “Changed two.” [pause] “The release gate blocks.” |
| 56–70s | Repaired version; lifecycle and gate become PASS | “We repair only the handler.” [pause] “The identical Effect Contract and regression run again.” [pause] “This time, exactly one record changes.” [pause] “The gate passes.” |
| 70–77s | Permission tab demonstrates the same core | “The same verification core catches collateral permission changes.” [pause] “Two workflows.” [pause] “One generated effect boundary.” |
| 77–89s | Identical permission regression PASS and measured comparison cards | “Official Evals accepted both correct calls.” [pause] “Both collateral effects remained.” [pause] “ExactDelta caught both.” |
| 89–90s | Hero | “Prove the effect.” |

## Recording requirements

- Capture the actual audited release build at 1440×900 or 1920×1080; it may remain on a private local production preview until the owner-approved release window.
- The hero action must be an external browser-client WebMCP invocation, not the deterministic replay button.
- Keep the native WebMCP badge visible at least once.
- Do not imply that a real customer, production incident, or external transaction is shown.
- Show `TOOL CALL PASSED` and `OBSERVED EFFECT FAILED` simultaneously.
- Show `EFFECT GATE BLOCKED` and later `EFFECT GATE PASSED`.
- Show the lifecycle ending in `IDENTICAL REGRESSION PASS`.
- Keep the benchmark limitation line legible or state it in narration.
