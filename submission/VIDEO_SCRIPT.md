# ActionProof — final 90-second demo

## Narrative lock

**The agent did everything right. The result was still wrong.**

Target duration: 86–90 seconds. English narration. No music is required. Every record and failure is explicitly labeled fictional and seeded.

| Time | Screen | Narration |
|---:|---|---|
| 0–7s | Hero and fake-data/native badges | “The agent did everything right. The result was still wrong. This is ActionProof: effect verification for WebMCP actions.” |
| 7–17s | Order intent and generated contract | “The human selects only Order 1042. Before the action, ActionProof generates an Effect Contract: this order must be cancelled, and every unselected order must remain unchanged.” |
| 17–27s | Correct native WebMCP call | “The page exposes a native WebMCP tool. The call name is correct. The argument matches the visible selection.” |
| 27–34s | `success: true` | “The tool returns success. At the invocation layer, everything passed.” |
| 34–47s | Observed table; 1042 required, 1043 unexpected | “But independent post-action state shows two orders changed. The seeded handler also cancelled unselected Order 1043.” |
| 47–57s | Verdict | “ActionProof separates those facts: tool call passed; real-world effect failed. Requested one, changed two.” |
| 57–68s | Click repaired version; lifecycle becomes PASS | “After repairing only the handler, we rerun the identical generated contract and arguments. The retained regression passes.” |
| 68–77s | Permission tab, defect result, then repaired PASS | “The same verification core catches the same defect class in permission changes, then passes the identical repair regression.” |
| 77–87s | Measured comparison cards | “Evals passed both calls while both defects remained. Four Playwright assertions caught them. ActionProof generated the checks from two bindings.” |
| 87–90s | Hero/tagline | “Correct call. Wrong effect.” |

## Recording requirements

- Capture the actual deployed application at 1440×900 or 1920×1080.
- Keep the native WebMCP badge visible at least once.
- Do not imply that a real customer, production incident, or external transaction is shown.
- Show `TOOL CALL PASSED` and `REAL-WORLD EFFECT FAILED` simultaneously.
- Show the lifecycle ending in `IDENTICAL REGRESSION PASS`.
- Keep the benchmark limitation line legible or state it in narration.
