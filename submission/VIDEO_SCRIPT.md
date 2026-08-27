# ActionProof — final 90-second demo

## Narrative lock

**The agent did everything right. The result was still wrong.**

Target duration: 86–90 seconds. English neural narration. No music is required. Every record and failure is explicitly labeled fictional and seeded. Each sentence is rendered as a separate clip with a deliberate 0.5-second-or-longer pause before the next sentence.

| Time | Screen | Narration |
|---:|---|---|
| 0–7s | Hero and staging/fake-data/native badges | “The agent did everything right.” [pause] “The result was still wrong.” [pause] “This is ActionProof.” |
| 7–17s | Staging QA decision, order intent, and generated contract | “Before this tool ships, QA selects only Order 1042.” [pause] “The gate requires one cancellation, and no other change.” |
| 17–27s | Correct native WebMCP call and context-matched badge | “The page exposes one native WebMCP tool for this context.” [pause] “Its schema binds the argument to the visible selection.” |
| 27–34s | `success: true` | “The tool returns success.” [pause] “At the invocation layer, everything passed.” |
| 34–47s | Observed table; 1042 required, 1043 unexpected | “But the observed application state shows two orders changed.” [pause] “The seeded handler also cancelled unselected Order 1043.” |
| 47–57s | Verdict and blocked gate | “Tool call passed.” [pause] “Real-world effect failed.” [pause] “Requested one.” [pause] “Changed two.” [pause] “The release gate blocks.” |
| 57–68s | Click repaired version; lifecycle and gate become PASS | “We repair only the handler and rerun the identical contract.” [pause] “The regression passes.” [pause] “The effect gate clears.” |
| 68–77s | Permission tab, defect result, then repaired PASS | “The same verifier catches the permission defect.” [pause] “The identical repair regression passes there too.” |
| 77–87s | Measured comparison cards | “Evals accepted both correct calls, and rejected both wrong controls.” [pause] “Both effect defects still remained.” [pause] “ActionProof caught both.” |
| 87–90s | Hero, native one-tool badge, and permission repair PASS | “Prove the effect.” |

## Recording requirements

- Capture the actual deployed application at 1440×900 or 1920×1080.
- Keep the native WebMCP badge visible at least once.
- Do not imply that a real customer, production incident, or external transaction is shown.
- Show `TOOL CALL PASSED` and `REAL-WORLD EFFECT FAILED` simultaneously.
- Show `EFFECT GATE BLOCKED` and later `EFFECT GATE PASSED`.
- Show the lifecycle ending in `IDENTICAL REGRESSION PASS`.
- Keep the benchmark limitation line legible or state it in narration.
