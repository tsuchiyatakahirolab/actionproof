# Five paper demos — v0.1

2026-08-26 JST. **Written scripts, not completed products or measured performances.** All names are working labels, not cleared brands. These are 90-second target edits. Each contains a first-20-second hook; actual comprehension and runtime remain untested.

The English text below is narration. Japanese text describes the intended screen and action. Do not replace real computations with preset results. If a live operation exceeds the slot, reduce scope or label an edit; do not imply an accelerated recording is real-time performance.

## 1. RevisionGuard — a reply must stay linked to the revision

Synthetic observational-study manuscript; no claims about an actual researcher. Interface: reviewer request, response, live manuscript. The author must approve substantive wording. A verified text link is not a scientific endorsement.

### 0–20 seconds

画面: `Researcher · Resubmission check`。回答書に `We revised the conclusion`、本文に未修正の因果表現。該当2箇所を同時に示す。`Browser agent ↔ live manuscript + response` を表示。

> A researcher is about to resubmit. The response says “fixed,” but the paper still disagrees. RevisionGuard checks the actual changes, not just the reply. Through WebMCP, your agent works on this live manuscript and response together, rather than a stale upload.

### 20–40 seconds

画面: ユーザーが査読コメントを選択。エージェントがそのコメント・本文の対象段落・回答を取得。未解決箇所へ移動し、引用と修正案を並べる。

> The reviewer asked us to stop claiming causation. The abstract was corrected, but the conclusion was missed. The agent points to that exact sentence and proposes a narrower statement. It cannot invent an experiment or claim an analysis we never performed.

### 40–60 seconds

画面: 著者が差分を承認。本文と回答の対応を再確認。人が対象段落を再編集すると、先ほどの確認済み状態が失効する。

> I approve the wording and its linked response. Now I edit the passage again. Watch: the earlier approval becomes stale immediately. The response no longer counts as checked against the current paper.

### 60–75 seconds

画面: 再確認が必要な1件だけを抽出。AI提案と著者判断を分けて表示。

> The agent rechecks only the affected item. I can accept the new response, revise it myself, or leave the concern unresolved. Nothing silently becomes scientifically correct.

### 75–90 seconds

画面: 回答書と変更対応表を出力。書式保持可能な範囲のみを表示し、元ファイルを上書きしない。

> Export the response and its change map, with unresolved items visible. This is a resubmission check, not an acceptance prediction. Every claimed revision remains connected to the text the author actually approved.

最大の負け筋: TypeTeX等との実操作差が出ない、または原稿の持ち込み・書式復元の負担が削減時間を上回る。Wordの検索だけで解ける1例を成功証拠にしない。

## 2. ImportRescue — finish the import without corrupting the records

Synthetic customer records; declared target schema. Interface: existing-style import screen with row-level errors, protected identifier column, change preview. No real database writes.

### 0–20 seconds

画面: `SaaS onboarding · Import blocked`。日付形式の混在と曖昧な日付を示す。保護対象の顧客ID列を固定。`Agent reads this import's rules and current edits` を表示。

> A customer cannot start using this SaaS because their import failed. ImportRescue keeps them on this screen. Their browser agent reads the actual import rules through WebMCP, proposes changes, and revalidates the live rows instead of handing back another guessed spreadsheet.

### 20–40 seconds

画面: 明確な形式変換と確認が必要な曖昧値を分ける。変更セルだけを比較する。

> Some dates can be converted safely. This one could mean March fourth or April third, so the agent asks instead of guessing. Customer identifiers are protected, and every proposed edit appears beside its original value.

### 40–60 seconds

画面: ユーザーが解釈を指定し、別セルを手で修正。古い版のAI提案を拒否し、更新後の差分を再提示。

> I confirm the date convention and correct another row myself. The previous proposal is now out of date. It must refresh against my changes; it cannot overwrite the cell I just fixed.

### 60–75 seconds

画面: 承認した変換を実行。スキーマ・ID保護・行数を決定的に検査。

> After approval, the importer runs its own checks again. The model does not decide whether the file passes. Required values, protected identifiers, and the row count are checked by code.

### 75–90 seconds

画面: 有効データと未解決行を分けて出力。全件解決していなければ全件成功とは表示しない。

> We now have an import-ready file and a clear list of anything still unresolved. The customer keeps the original. The result is a completed, inspectable repair, not a confident message saying the data looks fine.

最大の負け筋: CSVbox、ImportCSV、Flatfile等がこの体験を同等以下の負担で提供する。安価・AI・OSSでは差別化しない。

## 3. ShiftPatch — recover coverage without rewriting everyone's day

Synthetic café roster. Only already-confirmed availability and declared skills are usable. No employee contact, labor-law compliance claim, or notification is automated.

### 0–20 seconds

画面: `Café manager · Two call-outs before opening`。資格者の不在区間を強調。動かせないシフトに鍵。`Live roster + manager locks → WebMCP agent`。

> Two people call out before the café opens. The manager needs coverage without changing everyone else's day. ShiftPatch lets their browser agent repair this live roster through WebMCP, while preserving the commitments the manager has locked on screen.

### 20–40 seconds

画面: 有資格者が別ポジションにいるため、単純な代打では埋まらない。2人の配置替え案を差分表示する。

> There is no single replacement for this shift. But two already-available people can exchange roles. The agent proposes that chain, explains the skill requirements, and shows exactly whose assignment would change.

### 40–60 seconds

画面: 店長が別の約束を追加で固定。案を再計算し、確定済み配置が維持される。

> I lock one more commitment. The agent must work with that new constraint. It cannot quietly move the protected shift just to make the coverage chart look complete.

### 60–75 seconds

画面: 条件下で可能な案だけ提示。解なしの別ケースは未充足を残す。

> Code checks the agreed availability, skills, and overlaps. If no feasible plan exists, it says so. Software cannot make an unavailable employee appear, and a suggested assignment is not that employee's consent.

### 75–90 seconds

画面: 変更部分のみを出力。店長の最終確認後に通常の連絡経路へ。

> The manager receives a small change list rather than an entirely new schedule. They approve it and contact the affected staff through their normal process. The goal is less disruption, not a prettier calendar.

最大の負け筋: Timefoldは固定・欠員再計画・混乱最小化を既に扱い、Deputyには代替要員を探す機能がある。実際の難所が人の確保なら最適化では解決しない。

## 4. ShareSafe — remove the secret everywhere it appears

Synthetic screen recording containing a fake API token and email. Solid opaque redaction, not a reversible overlay in the exported video. All appearances must be rechecked; detection is not guaranteed complete.

### 0–20 seconds

画面: `Founder · Ready to publish a demo`。最初に隠した偽トークンが別のフレームで再登場。タイムラインにその位置を表示。

> This founder's product demo is ready, but a secret appears again after the first blur. ShareSafe lets their browser agent work on the live timeline through WebMCP, linking one privacy decision to every detected appearance instead of a single frame.

### 20–40 seconds

画面: 人が隠す対象を指定し、追跡候補の出現一覧を確認。検出の不確かな区間も表示。

> I mark the fake token. The editor finds candidate appearances, including after a scroll. I review those matches and the uncertain intervals; the agent cannot promise it found every secret in the recording.

### 40–60 seconds

画面: 隠す範囲を人が調整すると、AIがタイムライン上の現在の範囲を取得。対象外テキストが残ることを確認。

> I tighten the mask so the product remains readable. The agent uses the current selection and proposes the matching timeline edits. I inspect the changes before applying them to the export.

### 60–75 seconds

画面: 書き出した動画を再読込し、検出された対象区間を再確認。

> We render opaque masks into a new video, then reopen that exported file. Reviewing the output matters: a mask in the editor is not evidence that the shared video is safe.

### 75–90 seconds

画面: 元動画を保持し、出力とレビュー記録を表示。音声未対応なら映像のみ対象と明記。

> The original is preserved. The reviewed output and its redaction list are ready for the founder's final check. This covers the visual information shown here; audio and unrecognized sensitive content still need separate review.

最大の負け筋: OpenScrub・Reductに追跡、人の確認、映像／音声墨消しがある。WebMCPなしの通常の選択操作との差が弱い。検出漏れと書き出しの検証が重い。

## 5. ExactDelta — correct tool call, wrong result

**Concept-review leader, not an implementation GO.** Owned disposable test storefront with fake orders, visibly labeled `Seeded regression · no real transactions`. The business tool's arguments are correct; its buggy handler ignores the selected scope. Do not claim a real merchant or model suffered this incident.

### 0–20 seconds

画面: `For teams adding WebMCP to their SaaS`。選択された注文は1件。実際のWebMCP呼出しの引数も1件。しかし変更後は2件キャンセル。左に `Expected: 1 order`、右に `Actual: 2 orders`。`Correct call ≠ correct outcome`。

> You're adding WebMCP to your SaaS. The agent requests cancellation of one selected order. The call is correct—but two orders change. ExactDelta tests what actually happened in the live page, including the human's selection, instead of stopping at the tool call.

### 20–40 seconds

画面: 独立した状態差分が未選択の注文を指す。戻り値の `success` と実際の変更IDを並べる。AIが最短の再現手順を作る。

> The tool returned success. An independent state check finds the extra cancellation. The agent turns that failure into a replayable test: this selection, these arguments, this unexpected change. No external order was touched; this is a disposable test store.

### 40–60 seconds

画面: 操作途中に人が選択を変更する別試行。古い承認の対象に基づく実行を検査し、期待仕様との違いを表示。

> Now change the selection while the operation is waiting. Does the old approval still apply? ExactDelta replays the sequence and checks the application's declared rule. This is a browser-state test, not just another schema score.

### 60–75 seconds

画面: `Developer-reviewed fix` と修正差分を示す。AIが自動修正したとは言わない。既知の修正版で同じ試験を再実行。

> After a developer-reviewed fix, we run the same cases again. The approved order changes, the other order stays untouched, and stale approval is rejected. The trace shows the calls and the resulting records.

### 75–90 seconds

画面: 再現トレースと回帰テストを出力。`Cases tested: ... / Uncovered: ...`。包括的安全性スコアは出さない。

> Keep the regression test for the next release. This does not certify the whole app as safe. It gives the team a reproducible failure, a verified correction for these cases, and a record of what remains untested.

最大の負け筋: 公式Evalsやnekudaに小さな状態assertionを足すだけで同じ価値になる、導入adapter作成が手書きPlaywright試験より重い、または自作バグ専用のデモに留まる。

## Paper-demo review — not a blind judge audit

| Concept | What should be understood by 20s | Main comprehension risk |
|---|---|---|
| RevisionGuard | Researcher; reply promises an unmade change; check the live text and repair both | A viewer may see an ordinary document checker, not understand the live-state advantage |
| ImportRescue | SaaS customer; blocked import; agent repairs against actual import rules | “AI cleans spreadsheets” is too familiar; the differentiating safety behavior appears late |
| ShiftPatch | Café manager; missing coverage; preserve locked commitments | Looks like existing automatic scheduling; “why WebMCP” may remain just a label |
| ShareSafe | Founder; a secret reappears; review linked redactions across frames | Existing tracking redaction looks the same; a direct editing command may be simpler |
| ExactDelta | SaaS team; one requested change caused two; verify actual state through the live tool path | “Is this just a buggy test app?” or “Why not Playwright?” must be answered with a fair baseline |

These are intended answers, not observed reviewer responses. No independent viewer, timed screening, rendered storyboard, native run, or final video audit has been completed.
