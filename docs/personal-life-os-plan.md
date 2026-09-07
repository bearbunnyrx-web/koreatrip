# Personal Life OS — Plan

*Draft v1 · 7 September 2026*
*Mockup: https://claude.ai/code/artifact/30f903c3-9cbd-4c58-a5de-b69db228696e*

## 1. What it is

A personal AI system that lives on my phone, holds the whole library of my life (money, schedule, mail, health, notes), and acts on its own initiative: it researches in real time, brings me the best move or best deal, and asks for one decision at a time.

It is not a set of tools. It is one entity that already knows me.

## 2. Principles

1. **One decision at a time.** The home screen is a queue, not a dashboard. One card, three answers: Do it / Hold / Talk to me.
2. **Show the work.** Every claim carries a visible "how I got here" trace: sources, timestamps, confidence, and what I decided in similar cases before.
3. **Agents speak first, but cannot act.** Proposals land in Dispatch. Only a tap in Now (or on the watch) moves money or sends a message.
4. **Local-first.** The library, the index, and the agent runtime run on the device. The cloud only ever sees redacted research briefs and holds no memory of me.
5. **Rules in my own words.** Settings are a Constitution: plain-language rules I type or say. The system quotes them back when it explains a choice.

## 3. Screens (four tabs)

| Tab (v1 name) | v2 name | Purpose |
|---|---|---|
| Today | Now | The single next decision, with reasoning trace and three actions. Swipe up for the next. Hold to speak. |
| Plan | Life | Net worth and the "cash river": a 90-day flow where width is free money. Money events and calendar events sit on the same timeline. |
| Inbox | Dispatch | What agents did overnight: best deal, best move, watching. Includes items it closed on its own, with reasons. Items are promoted to Now to decide. |
| Profile | Constitution | Rules in my words, connected sources, what left the phone today, run budget, encrypted backup, export, "forget something". |

## 4. Visual direction

Three directions are on the canvas. **A · Presence** is built in full and is the leading candidate.

- **A · Presence (built).** Near-black, a breathing orb as the AI, first-person copy, Syne + IBM Plex Mono, cyan/violet accents. Feels like a companion, not an app.
- **B · Mission Control (sketch).** Dense monospace cockpit. Powerful, cold, hides the AI's voice.
- **C · The Letter (sketch).** The AI writes the morning as a note; tap a sentence to act. Warm, slow to scan, weak for numbers.

A calmer v1 (warm off-white, borrowed from the Korea Trip app) is kept on a second canvas page.

**Decision needed:** pick A, or a mix (e.g. A's orb with C's tone).

## 5. Architecture

### On device
- **Connectors.** Open-banking (bank, cards), calendar, mail (receipt/booking/bill filter only), health, files, watch. Each writes normalised events, never raw dumps.
- **Event log.** Append-only. Every fact has a source, timestamp and confidence. This is the library.
- **Local index.** SQLite for facts and money; a small on-device vector index for notes, docs and semantic recall.
- **Derived state.** Net worth, cash-flow projection, obligations, energy budget. Recomputed on every sync.
- **Agent runtime.**
  - *Triggers:* idle cash over threshold, renewal within 30 days, price watch, calendar gap, spend anomaly, low sleep. Fire on sync and in a nightly pass.
  - *Planner:* turns a trigger into a research brief (what to compare, under which of my constraints, what "good" looks like).
  - *Redactor:* strips identity before anything leaves. Balances become bands, names become roles, dates become windows.
  - *Decision queue:* ranks proposals by deadline × money at stake. Now shows the top one. My answer is written back to the log so agents learn my taste.

### Cloud (stateless)
- **Ephemeral research jobs.** Each brief runs as a throw-away job with web search and tools. No memory of me between runs.
- **Structured result.** Options, evidence links, recommendation, confidence. The device re-attaches my real numbers.
- **Budget and audit.** Runs per day capped in Constitution. Every outbound brief is viewable.
- **Backup.** End-to-end encrypted snapshot of the library to my own cloud drive.

## 6. Wearables

- **Apple Watch: the yes/no button and the body sensor.** One decision on the wrist; crown turn to answer. Distinct haptic per agent type (deal vs. warning). Sleep, heart rate and steps feed an energy budget that bends the day's plan. Raise wrist and ask "Should I?". Tap-to-pay is checked against the cash river first.
- **Meta glasses: the eyes and the whisper.** Look at a product and get price, a cheaper option, and whether it fits the river. Receipts and menus filed by glance. A reminder of a promise when it sees the person. Answers whispered, no screen.
- **One queue, every surface.** Answer wherever I am; the others update. The Constitution decides what the glasses may notice.

## 7. Build phases

1. **Library.** Event log, SQLite schema, bank + calendar + mail connectors, nightly encrypted backup, export.
2. **Now + Life.** Decision queue, one hand-written trigger (idle cash), cash river projection, timeline.
3. **Agents.** Trigger set, planner, redactor, cloud research worker, Dispatch screen, audit log.
4. **Constitution.** Plain-language rules, parsed into constraints the planner uses; voice input.
5. **Watch.** Decision complication, haptics, health ingest, energy budget.
6. **Glasses.** Price/afford-check HUD, receipt capture, whisper answers.

## 8. Open questions

- Direction A, or a mix?
- Static screens are enough for now, or a clickable prototype next?
- Currency and market: Korean won assumed.
- Which bank/open-banking API is realistic for the first connector?
- How much autonomy at launch: Ask first, Propose, or Act under a limit?

*All amounts in the mockup are sample values.*
