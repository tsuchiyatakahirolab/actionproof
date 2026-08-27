# ActionProof — final 90-second demo

## Narrative lock

**The agent did everything right. The result was still wrong.**

Target duration: 86–90 seconds. English narration. No music is required. Every record and failure is explicitly labeled fictional and seeded.

| Time | Screen | Narration |
|---:|---|---|
| 0–7s | Hero and staging/fake-data/native badges | “The agent did everything right. The result was still wrong. ActionProof is a pre-release effect gate for WebMCP writes.” |
| 7–17s | Staging QA decision, order intent, and generated contract | “Before this tool ships, QA selects only Order 1042. ActionProof generates the gate: cancel this order; leave every unselected order unchanged.” |
| 17–27s | Correct native WebMCP call and context-matched badge | “The page exposes one native WebMCP tool for this visible context. Its call name is correct. Its schema-bound argument matches the selection.” |
| 27–34s | `success: true` | “The tool returns success. At the invocation layer, everything passed.” |
| 34–47s | Observed table; 1042 required, 1043 unexpected | “But application state, observed independently of the return, shows two orders changed. The seeded handler also cancelled unselected Order 1043.” |
| 47–57s | Verdict and blocked gate | “ActionProof separates those facts: tool call passed; real-world effect failed. Requested one, changed two. The release gate blocks.” |
| 57–68s | Click repaired version; lifecycle and gate become PASS | “After repairing only the handler, we rerun the identical generated contract and arguments. The retained regression passes, so the effect gate clears.” |
| 68–77s | Permission tab, defect result, then repaired PASS | “The same verification core catches the same defect class in permission changes, then passes the identical repair regression.” |
| 77–87s | Measured comparison cards | “Evals passed both correct calls and rejected both wrong controls, while both effect defects remained. ActionProof generated the state checks from two bindings.” |
| 87–90s | Hero, native one-tool badge, and permission repair PASS | “Prove the effect before the write tool ships.” |

## Recording requirements

- Capture the actual deployed application at 1440×900 or 1920×1080.
- Keep the native WebMCP badge visible at least once.
- Do not imply that a real customer, production incident, or external transaction is shown.
- Show `TOOL CALL PASSED` and `REAL-WORLD EFFECT FAILED` simultaneously.
- Show `EFFECT GATE BLOCKED` and later `EFFECT GATE PASSED`.
- Show the lifecycle ending in `IDENTICAL REGRESSION PASS`.
- Keep the benchmark limitation line legible or state it in narration.
