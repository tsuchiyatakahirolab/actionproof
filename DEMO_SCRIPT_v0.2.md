# ExactDelta demo script v0.2

2026-08-27 JST. Fictional SaaS fixture, seeded defect, fake data. This replaces the ExactDelta section of [DEMO_SCRIPTS_v0.1.md](DEMO_SCRIPTS_v0.1.md) for the gate prototype. It removes stale approvals, races, and secondary failure modes from the primary narrative.

## 20-second silent sequence

No narration, captions, cursor callouts, or project description are assumed. The viewer sees one continuous screen.

| Time | Visible action | Exact on-screen text | What the judge should understand |
|---|---|---|---|
| 0–4s | Only `#1042` is checked; `#1043` is visibly unselected | `HUMAN INTENT` · `One target selected` · `Cancel only Order #1042` · `ONLY` | The human intends one narrowly scoped change |
| 4–8s | The second panel activates and shows the structured call | `AGENT ACTION` · `Correct WebMCP call` · `cancel_order` · `{ "order_id": "#1042" }` · `Target matches visible selection` | The agent chose the correct WebMCP action and target |
| 8–11s | The result panel activates | `TOOL RESULT` · `success: true` · `Tool returned without error` | The invocation layer believes it succeeded |
| 11–15s | The independent state table reveals that both rows changed | `OBSERVED EFFECT` · `2 orders changed` · `#1042 REQUIRED` · `#1043 UNEXPECTED` | The application changed an extra record despite the correct call |
| 15–20s | The verdict compares expected and actual | `Expected changes 1` · `Unexpected changes 1` · `TOOL CALL PASSED` · `OBSERVED EFFECT FAILED` | ExactDelta detected the discrepancy at the effect layer |

Persistent framing visible throughout:

- `Correct call. Wrong effect.`
- `ExactDelta proves that a WebMCP action changed exactly what the human intended—and nothing else.`
- `Seeded regression`
- `Fake data · no transactions`
- `Native WebMCP active` in the native run

## 90-second demo sequence

Target narration is intentionally compact so the visual transition remains primary.

### 0–15 seconds — one explicit intent

**Screen**

Order `#1042` is selected; adjacent `#1043` is not. The contract source line is visible.

**Narration**

> This is a disposable test store. I selected one order: number ten forty-two. ExactDelta captures that explicit intent and the current state before an agent changes anything.

**Judge understanding**

One human choice defines the scope. The data and defect are synthetic.

### 15–30 seconds — correct native WebMCP action

**Screen**

`Native WebMCP active`. The agent panel reveals `cancel_order({ order_id: "#1042" })` and confirms the target matches the visible selection.

**Narration**

> The page exposes a native WebMCP action. The agent discovers that live tool and calls it with the correct order ID. This is not a wrong-tool or wrong-argument test.

**Judge understanding**

WebMCP is the action path under test; the agent call is correct.

### 30–40 seconds — success result, wrong application state

**Screen**

The tool returns `success: true`. Then both orders become `cancelled`.

**Narration**

> The tool reports success. But the seeded handler has a defect: order ten forty-three changes too, even though nobody selected it.

**Judge understanding**

Tool-call success and observed application effect have diverged.

### 40–60 seconds — generated contract and independent diff

**Screen**

`#1042` is labeled `REQUIRED`; `#1043` is labeled `UNEXPECTED`. Verdict: `TOOL CALL PASSED / OBSERVED EFFECT FAILED`.

**Narration**

> ExactDelta does not trust the return value. From the selection and pre-action state, it generated one required change, protected the unselected records, and compared the independent post-action snapshot. One required change passed. One unexpected change failed.

**Judge understanding**

The contract is generated from current intent/state rather than manually authored for these IDs.

### 60–75 seconds — identical regression against repaired code

**Screen**

Click `Run repaired version`. Keep the same selected order, tool name, arguments, and retained regression ID. Label the switch `Developer-reviewed repair`; do not claim AI fixed code.

**Narration**

> Now I substitute the developer-reviewed repair and rerun the exact same retained case—same selection, same arguments, same generated contract.

**Judge understanding**

The comparison is controlled; no new easier test replaces the failure.

### 75–90 seconds — bounded proof and reuse

**Screen**

Only `#1042` changes. Show `Required changes 1/1`, `Unexpected changes 0`, `ACTION PROVEN`, and `REGRESSION RETAINED orders__#1042__status`. Briefly switch to the permission tab or end on `One verifier, two workflows` only if timing remains clear.

**Narration**

> This time only the intended order changes. Required: one of one. Unexpected: zero. Action proven for this contract, and the regression stays for the next release. It does not certify the whole application.

**Judge understanding**

The repair passes the identical effect test; the result is reusable and explicitly bounded.

## Do not add to the primary demo

- stale approval or selection-race scenarios;
- automatic code repair claims;
- generic model scores;
- security-certification language;
- customer-incident language;
- a second application or dashboard tour;
- long logs on the main screen.

The permission workflow is proof of architecture, not a second narrative. It may appear for 3–5 seconds after the central story or in judge questions.
