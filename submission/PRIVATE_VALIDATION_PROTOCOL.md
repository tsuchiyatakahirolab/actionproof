# ExactDelta private validation protocol

Purpose: optionally test whether unfamiliar viewers expose confusing copy or hierarchy without publishing the held build or manufacturing adoption evidence. This protocol is supplementary UX feedback, not a release gate and not proof of correctness, demand, market size, or likely judging outcome.

## Participants

- Target: 3 people who have not seen ExactDelta.
- Prefer software developers, QA engineers, or technical product engineers who have shipped a state-changing web workflow.
- Do not brief them on the product thesis before Part A.
- Record role category only. Do not commit names, employers, emails, recordings, or other personal data to the repository.

## Part A — 20-second blind comprehension

Show `submission/thumbnail.png` for exactly 20 seconds with no narration. Then hide it and ask:

1. Who is making what decision?
2. What did the agent or tool do correctly?
3. What actually went wrong?
4. What did ExactDelta decide?
5. Why is checking the call alone insufficient?

Score each answer `0` (not understood), `1` (partial), or `2` (clear). Do not correct answers until all five are recorded.

**Pass threshold:** at least 2 of 3 participants score 8/10 or better, and every participant understands that one selected record was intended while an unselected record also changed.

## Part B — 90-second demo and hands-on relevance

Show the final video with sound once. Then let the participant use the local held build or a private screen share. Ask, in this order:

1. In your current work, how would you detect a correct API/tool call that changed an additional record?
2. Have you had to write or maintain state assertions for side effects? Describe the workflow without sharing confidential details.
3. Is the selected-target-as-only-permitted-delta concept useful for a release decision? Why or why not?
4. What existing tool or workflow would you compare this with?
5. On a 1–5 scale, how likely would you be to try this in a staging workflow if an adapter existed?
6. What is the single most confusing or unconvincing part?

Do not ask whether the participant “likes” the UI, reveal the target score, or describe adjacent competitors before these answers.

**Relevance threshold:** at least 2 of 3 participants describe a real current verification burden and rate trial intent 4/5 or higher. A failure is evidence to revise positioning, not permission to add unrelated features.

## Evidence handling

- Store raw notes under `submission/private/`; that directory is intentionally gitignored.
- Create only an anonymous aggregate for the public submission if all participants consent and the wording remains precise.
- Report participant count, role categories, exact question, response distribution, date, and limitations.
- Never call participants customers, deployments, or production users.
- Never convert a private opinion into a market-size or time-saved claim.

## Use of results

- Part A confusion may justify revising the first-screen wording or composition if objective evidence remains accurate.
- Part B answers must never be converted into a demand claim; keep the standards-derived problem evidence and bounded developer/QA audience claim.
- A pass does not raise the technical gate or official rubric score. A consented anonymous aggregate may be retained privately, but is unnecessary for submission.

`EXACTDELTA_PRIVATE_VALIDATION_PROTOCOL_LOCKED`
