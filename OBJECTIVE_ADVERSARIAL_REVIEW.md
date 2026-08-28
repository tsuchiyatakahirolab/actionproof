# ExactDelta objective adversarial review

**Review date:** 2026-08-28 JST  
**Purpose:** determine what survives reproducible technical review, current public-source comparison, and the official judging rubric. This is not a win prediction and does not use participant opinions as proof of correctness or demand.

## Evidence hierarchy

1. **Reproducible product evidence:** source, deterministic tests, native Chrome WebMCP execution, raw benchmark outputs, media audit, and release audit.
2. **Primary public evidence:** the official challenge page/rules, WebMCP specification discussions, Chrome documentation, and maintainers' own product repositories.
3. **Bounded inference:** conclusions that follow from 1 and 2 but have not been measured with customers or production systems.
4. **Subjective feedback:** unfamiliar-viewer comprehension or preference. Useful for copy/layout iteration only; not proof of technical correctness, market demand, or likely judging outcome.

## Falsification questions and results

| Question used to try to reject the entry | Evidence reviewed | Result |
|---|---|---|
| Is the problem invented? | WebMCP issue #45 states that declared tool intent is not guaranteed to match behavior and that an agent cannot confirm the real effect from the declaration. Chrome's Evals guidance separately says deterministic tests remain necessary outside the LLM interaction. | **PASS, bounded.** The trust gap is real in the standard discussion. This is problem evidence, not proof of paying demand or a deployed vulnerability. |
| Is this merely a wrong-tool/argument checker? | The direct native call uses the correct tool and exact visible argument; official Evals 0.0.3 matches both correct calls and rejects both wrong-argument controls; independently read state still contains both seeded collateral defects. | **PASS.** The demonstrated failure surface begins after correct selection and invocation. |
| Can competent existing tests catch it? | Playwright supports retrying state assertions; the controlled baseline catches both defects with four explicit per-record assertions. Schemathesis supports generated/stateful API workflows and selected cross-operation checks. | **YES.** ExactDelta must not claim exclusive detection. Its difference is generation of the current selected-only delta boundary and retained identical regression. |
| Is outcome verification already an existing concept? | webmcpify asserts tool results and declared UI changes; Postcept verifies selected external system-of-record outcomes and returns receipts; AgentSynth uses end-state checkers. | **YES.** “Outcome verification” is not novel by itself. ExactDelta's narrower combination remains differentiated in the reviewed public sources. |
| Is WebMCP material or decorative? | The page registers only the context-relevant tool, constrains it to visible intent, executes it through native `getTools()` / `executeTool()`, routes an external browser-client call through the same gate, and returns the independent `effectGate` verdict to that client. Chrome's JSON-string and the in-app browser's object input paths are both proven without retrying a write. | **PASS.** Removing WebMCP removes the standard page-to-browser-agent action and feedback boundary, although the verifier core can still be used as an ordinary application test. |
| Does the verifier prove a real effect rather than trusting `success: true`? | Pre/post snapshots are application-owned and independent of the action return. Required, unexpected, and identity/count invariants are evaluated by the same core in two workflows. | **PASS for the exposed snapshot only.** It does not prove state omitted from the adapter, delayed jobs, or external systems. |
| Can a repeated no-op be mislabeled as proof? | Adversarial review reproduced that risk in the earlier verifier. The core now requires the intended transition to appear in the observed delta; a second call against the already-mutated state is blocked. | **FIXED and covered** by unit and native-browser regression tests. |
| Can a failed tool mutate state and evade the gate? | The earlier failure branch returned `NOT_EVALUATED` even when a partial mutation had occurred. The verifier now preserves observed changes, marks the effect failed when a failed call changed state, and every non-proven outcome blocks the release gate. | **FIXED and covered** by a unit regression test. |
| Can identity ambiguity or delimiter collision hide an unexpected change? | Duplicate selections, mutable `id`, malformed snapshot identity, and composite string-key collisions were tested adversarially. | **FIXED and covered.** Required-effect matching now compares entity and field independently rather than concatenating them. |
| Does this stop or roll back a bad write? | The application observes state after execution and makes a pre-release decision. There is no transaction rollback. | **NO—and not claimed.** Copy must say it blocks release approval, not that it prevents the already-executed fixture mutation. |
| Is this a complete production SaaS? | Two deterministic in-memory fixtures, no authentication, no external connector, and no delayed-effect polling. | **NO.** It is a coherent pre-release developer product prototype, not production infrastructure. This is the largest Execution/Impact deduction. |
| Can the current challenge field be fully compared? | The official gallery still says it has not been published. Public repositories and indexed projects can be reviewed; private drafts cannot. | **UNKNOWN.** No “first,” “only,” or guaranteed top-10 claim is supportable. |

## Strongest public alternatives

| Alternative | Stronger than ExactDelta at | ExactDelta's narrower demonstrated distinction |
|---|---|---|
| [GoogleChromeLabs WebMCP Evals](https://github.com/GoogleChromeLabs/webmcp-tools/) | Probabilistic model/tool-selection evaluation and official ecosystem fit | Starts after correct selection and checks application-owned effects |
| [webmcpify](https://github.com/TueJon/webmcpify) | Broad inventory, integration, browser verification, healing, and explicit result/UI assertions | Generates all-current-unselected unchanged obligations from the visible target and keeps the exact contract as the repair regression |
| [Postcept](https://github.com/postcept/mcp) | External connectors, system-of-record verification, persistent signed receipts | In-page native WebMCP release boundary derived from the human-visible selection |
| [Playwright](https://playwright.dev/docs/test-assertions) | General, mature, flexible end-to-end assertions | The demonstrated obligations are generated from two action bindings rather than four named per-record expectations |
| [Schemathesis](https://schemathesis.readthedocs.io/en/latest/guides/stateful-testing/) | Property-based and stateful OpenAPI/GraphQL workflow generation | WebMCP page context plus a human-selected exact allowed delta, not general API schema conformance |

No reviewed public source was found with the complete demonstrated combination of native page WebMCP invocation, visible-selection-derived exact allowed delta, automatic unchanged obligations for every current unselected record, and identical retained repair regression. This is a bounded search result, not an absence claim.

## Official rubric: defensible score bands

The official criteria are equally weighted. A range is more honest than a self-assigned exact score.

| Criterion | Defensible range | Evidence that raises it | Evidence that caps it |
|---|---:|---|---|
| WebMCP Leverage | **9.4–9.8 / 10** | Native context lifecycle, strict visible-intent schema, direct external call, dialect-safe one-write bridge, separate gate result returned to agent, two workflows | The owned state adapter and tools are bounded fixtures rather than a third-party production integration |
| Execution | **9.2–9.7 / 10** | First-viewport Effect Trace, coherent release decision, defect → block → repair → identical PASS, executable JSON artifact, target/schema rebinding, exactly-once dialect handling, 24 unit and 8 native-browser tests, automated/media audits | External-system persistence remains outside the prototype; public release remains owner-held |
| Potential Impact | **8.0–8.8 / 10** | Specific developer/QA release decision, standards-derived trust gap, executable retained regression, and bounded integration guide | Demonstrated impact covers two action classes and does not quantify production-scale efficiency |
| Creativity & Ambition | **9.0–9.6 / 10** | Exact allowed-delta generation, ownable requested-versus-observed Effect Trace, and retained repair contract are visually and technically distinct | Outcome/UI/state verification already exists separately in several adjacent tools |
| **Total** | **35.6–37.9 / 40** | **10/10 controllable submission-readiness gates pass** | **Not a guaranteed official score or top-10 result** |

The entry's strongest axis is WebMCP Leverage. Its narrowest axis is Potential Impact because the demonstrated scope is two staging action classes. Expanding scope or adding unsupported projections would reduce clarity rather than increase the defensible score.

## Objective release gates

Mandatory before submission:

1. All type, unit, build, native-browser, benchmark, media, console, secret, license, and git audits pass on the held revision.
2. Re-run the official gallery and public competitor search in the release window.
3. Push/promote only in the owner-approved window, then repeat native WebMCP and production-header/console checks on the canonical URL.
4. Upload and watch the exact audited video, update canonical links, and verify the Devpost preview against the official requirements.
5. Owner alone approves the official rules and final Submit action.

Optional supplementary check:

- An unfamiliar viewer may expose confusing copy or hierarchy. Their response may trigger a wording/layout fix, but it is not a gate for technical truth, market demand, or submission readiness and must not be represented as customer validation.

## Residual technical and product risks

- Completeness depends on the application-owned snapshot adapter; omitted state cannot be verified.
- Delayed/eventually consistent effects and executors that ignore `AbortSignal` can outlive the current observation window.
- The gate detects after execution and blocks release approval; it does not roll back the action.
- Volatile fields need a reviewed normalization/exclusion policy in a real adapter to avoid false positives.
- Single-flight execution fails closed in this fixture; a production distributed gate would need shared coordination and durable state.
- Two synthetic defect cases establish mechanism, not general detection rate.
- A public competitor or private submission may independently implement the same idea before the deadline.
- The current legacy public URL/repository slug must be made canonical or redirected consistently at release.

## Decision

The concept survives adversarial technical and public-source review as a differentiated, honest WebMCP release-gate prototype. It does **not** survive a claim of full market validation, universal outcome verification, production readiness, or guaranteed top-10 placement. The rational strategy is to finish the objective release gates, preserve the narrow claim, and avoid adding scope or subjective pseudo-evidence.

`EXACTDELTA_OBJECTIVE_REVIEW_PASS_WITH_BOUNDED_RISKS`
