# ExactDelta competitive review

2026-08-28 JST / public-source review / release claim boundary

## Decision

No publicly indexed project reviewed here combines all four of ExactDelta's demonstrated properties:

1. a native, page-registered WebMCP write invoked through the browser client path;
2. a permitted state delta generated from visible selection plus pre-action state;
3. automatic unchanged obligations for every unselected record in the owned snapshot;
4. the identical contract retained as a blocking repair regression.

This is a bounded search finding, not a claim that no similar product exists. The strongest adjacent projects already verify tool selection, declared UI outcomes, or external system-of-record outcomes. ExactDelta must therefore describe its difference precisely instead of claiming to be the first or only verifier.

## One-sentence difference

> **ExactDelta turns the visible selected target into the only permitted application-state delta, gates the external WebMCP call when anything else changes, and retains that identical contract as the repair regression.**

## Strongest adjacent alternatives

| Alternative | What its public documentation says it verifies | Where it is stronger | ExactDelta's demonstrated boundary |
|---|---|---|---|
| [GoogleChromeLabs WebMCP Evals](https://github.com/GoogleChromeLabs/webmcp-tools/) | Whether an interactive agent selects the expected tool and arguments for a user prompt | Model/tool-selection evaluation across cases | ExactDelta begins after selection: it independently compares the application-owned pre/post state with a generated Effect Contract |
| [webmcpify](https://github.com/TueJon/webmcpify) | Registration/schema, real-browser execution, result expectations, and explicitly declared UI-state deltas; also integrates and heals WebMCP tools | Much broader integration pipeline and real-browser per-tool verification | ExactDelta does not integrate arbitrary sites; it generates required plus all-unselected-unchanged obligations from the current human selection and uses them as a release gate |
| [Postcept](https://github.com/postcept/mcp) | Refund, cancellation, and support outcomes against external systems of record, with signed receipts | External connectors, persistent receipts, and production-oriented outcome verification | ExactDelta is an in-page WebMCP pre-release verifier for an owned application snapshot, not a system-of-record receipt service |
| [webmcp-kit](https://github.com/victorhuangwq/webmcp-kit) | Typed registration, validation, feature detection, and manual tool debugging through a development panel | SDK ergonomics and tool authoring | ExactDelta is not a registration SDK; it verifies collateral state changes after a write |
| [AgentSynth](https://github.com/agentsynth/agentsynth) | End-state checkers for synthetic agent trajectories, benchmark packs, and CI | Agent benchmarking, datasets, leaderboards, and world-state checkers | ExactDelta is deliberately narrower: a human-visible WebMCP action boundary and generated exact-delta contract inside the app |

## Fair comparison rule

Do not say that conventional E2E or Playwright testing cannot catch these defects. It can, when a developer writes the required assertions. The measured claim is narrower:

- the official call matcher accepted both correct calls while the two seeded collateral effects remained;
- four manual per-record state assertions caught both defects;
- ExactDelta caught both using two action bindings and zero per-record expected-state assertions in the scenario definitions;
- webmcpify's manifest-driven UI assertions are a competent adjacent approach, but its documented verification input is an explicit expected UI delta rather than an Effect Contract generated from every current unselected record.

## Public-entry search boundary

The official Devpost gallery remained unpublished on 2026-08-28 while the site displayed more than 3,100 participants. That figure is not a submission count, and private drafts cannot be inspected. Public web and Devpost searches found adjacent agent-verification submissions such as AgentProof, Inspector, and Deploy Verify, but no indexed WebMCP Challenge entry with the exact generated-delta release-gate flow above. This is not evidence that no competing draft exists. Re-run the search immediately before the publication window.

## Product risk that remains

The main risk is not technical uniqueness; it is whether judges view a pre-release developer gate as a sufficiently vivid example of humans and agents collaborating on the open web. The submission must therefore show the real browser-agent invocation first, keep the human-visible selected target on screen, and make the release decision immediate. A deterministic replay remains useful evidence, but must not be the hero interaction.

`EXACTDELTA_COMPETITIVE_CLAIM_LOCKED`
