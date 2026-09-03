# ExactDelta competitive review

2026-09-03 JST / public-source review / release claim boundary

## Decision

No publicly indexed project reviewed here combines all four of ExactDelta's demonstrated properties:

1. a native, page-registered WebMCP write invoked through the browser client path;
2. a permitted state delta generated from visible selection plus pre-action state;
3. automatic unchanged obligations for every unselected record in the owned snapshot;
4. the identical contract retained as a blocking repair regression.

This is a bounded search finding, not a claim that no similar product exists. The strongest adjacent projects already verify tool selection, declared UI outcomes, or external system-of-record outcomes. ExactDelta must therefore describe its difference precisely instead of claiming to be the first or only verifier.

## One-sentence difference

> **ExactDelta turns the visible selected target into the only permitted application-state delta, blocks release when the external WebMCP call changes anything else, and retains that identical contract as the repair regression.**

## Strongest adjacent alternatives

| Alternative | What its public documentation says it verifies | Where it is stronger | ExactDelta's demonstrated boundary |
|---|---|---|---|
| [GoogleChromeLabs WebMCP Evals](https://github.com/GoogleChromeLabs/webmcp-tools/) | Whether an interactive agent selects the expected tool and arguments for a user prompt | Model/tool-selection evaluation across cases | ExactDelta begins after selection: it independently compares the application-owned pre/post state with a generated Effect Contract |
| [webmcpify](https://github.com/TueJon/webmcpify) | Registration/schema, real-browser execution, result expectations, and explicitly declared UI-state deltas; also integrates and heals WebMCP tools | Much broader integration pipeline and real-browser per-tool verification | ExactDelta does not integrate arbitrary sites; it generates required plus all-unselected-unchanged obligations from the current human selection and uses them as a release gate |
| [Postcept](https://github.com/postcept/mcp) | Refund, cancellation, and support outcomes against external systems of record, with signed receipts | External connectors, persistent receipts, and production-oriented outcome verification | ExactDelta is an in-page WebMCP pre-release verifier for an owned application snapshot, not a system-of-record receipt service |
| [webmcp-kit](https://github.com/victorhuangwq/webmcp-kit) | Typed registration, validation, feature detection, and manual tool debugging through a development panel | SDK ergonomics and tool authoring | ExactDelta is not a registration SDK; it verifies collateral state changes after a write |
| [AgentSynth](https://github.com/agentsynth/agentsynth) | End-state checkers for synthetic agent trajectories, benchmark packs, and CI | Agent benchmarking, datasets, leaderboards, and world-state checkers | ExactDelta is deliberately narrower: a human-visible WebMCP action boundary and generated exact-delta contract inside the app |

## Strongest visible challenge entries

The public field now contains complete products, not merely WebMCP experiments. The comparison below is deliberately adversarial and based on what each entrant publicly demonstrates, not on unverified customer or revenue assumptions.

| Entry | Where it can beat ExactDelta | ExactDelta's strongest rebuttal | Remaining risk |
|---|---|---|---|
| [SheetCanvas](https://devpost.com/software/sheetcanvas) | A persistent data-analysis workspace, 26 tools, live connector queries, four interaction surfaces, activity trail, and rewind make it feel like a mature daily product | ExactDelta's smaller surface is independently package-consumed, produces a machine-rerunnable failed contract, and proves a correct call can still create the wrong state | A judge who rewards breadth and existing-product depth over a narrower safety primitive may prefer SheetCanvas |
| [VT](https://devpost.com/software/vt-y4n8u0) | A real CodeMirror workspace, authenticated VT Code bridge, digest checks, bounded paths, reconnect/event replay, and terminal approval provide unusually concrete production engineering | ExactDelta verifies the observed selected-only effect rather than only bounding or approving the requested operation, and replays the identical generated contract after repair | VT has the strongest external-system integration story in this pair; ExactDelta must make its distinct post-call failure class unmistakable |
| [Redini-Atelier](https://devpost.com/software/redini-atelier) | Editable pre-commit ChangeSets, atomic commit, undo/redo, versioning, a polished design surface, and 104 tests form a complete product experience | ExactDelta catches unintended effects that remain possible after a tool call was correctly selected and accepted; its SDK and retained regression are already built rather than listed only as future work | Redini may win on immediate delight and prevention-before-write; ExactDelta must not imply rollback or prevention |
| [2D WebMCP](https://devpost.com/software/screen-readers-webmcp) | A specific underserved audience, research citations, accessible focus-to-proof navigation, and a compelling social-impact case | ExactDelta offers independent state evidence rather than trusting a richer tool response, plus a reusable release/CI gate | 2D WebMCP has the clearest human-impact narrative; ExactDelta's impact case is operational and less emotional |
| [MCPencil](https://devpost.com/software/mcpencil) | Real-time multiplayer, Durable Objects, agents and humans sharing one game protocol, and a memorable visual experience | ExactDelta addresses a high-consequence trust boundary and has a more falsifiable engineering proof | MCPencil can dominate first-impression creativity even though ExactDelta is more directly productizable for application teams |

ExactDelta should not imitate these products by adding a shallow connector, public-data skin, game layer, or generic workspace. Its best route is to make the category difference undeniable: the agent chose the correct tool and arguments, the application returned success, the observed effect was still wrong, and the failed boundary became an executable regression. The typed SDK and external consumer close the former fixture-only objection without weakening that story.

## Fair comparison rule

Do not say that conventional E2E or Playwright testing cannot catch these defects. It can, when a developer writes the required assertions. The measured claim is narrower:

- the official call matcher accepted both correct calls while the two seeded collateral effects remained;
- four manual per-record state assertions caught both defects;
- ExactDelta caught both using two action bindings and zero per-record expected-state assertions in the scenario definitions;
- webmcpify's manifest-driven UI assertions are a competent adjacent approach, but its documented verification input is an explicit expected UI delta rather than an Effect Contract generated from every current unselected record.

## Public-entry search boundary

The entries above were publicly visible and re-reviewed on 2026-09-03. Public pages are not the complete eligible field: private drafts, late submissions, unavailable live behavior, and materials not indexed by search remain unknown. No reviewed entry demonstrated the same complete generated-delta-to-identical-regression flow, but that is a bounded search result rather than an absence, first, or only claim. Re-run the official gallery search in the owner-approved release window.

## Product risk that remains

The main risk is no longer fixture lock. It is whether judges value a narrow application safety primitive over the breadth of SheetCanvas/VT, the human-impact story of 2D WebMCP, or the delight of MCPencil/Redini. The submission must therefore show the real browser-agent invocation first, keep the human-visible selected target on screen, and make the unexpected effect and release decision immediate. The SDK and deterministic replay are decisive supporting evidence, but must not replace the hero interaction.

`EXACTDELTA_COMPETITIVE_CLAIM_LOCKED`
