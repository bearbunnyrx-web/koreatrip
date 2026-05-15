# Korea Trip App Backbone

**Generated/seeded:** 2026-05-12 23:22  
**Status:** Active build → stabilization  
**Mission Control:** `docs/mission-control.md`  
**Phase 0 inventory:** `docs/phase-0-inventory-2026-05-12.md`

---

## Canonical production

- App: https://koreatrip.vercel.app
- Vercel project: `koreatrip`
- Repo: `/Users/jincho/Documents/korea-trip-app`
- Backup Google Sheet: `1cTlLzGWmfXODVSq1iDIUJPo0YfTSb7eZKC8w4q8bskY`
- Receipts Drive folder: `1LpqlmrVIZW8aWQdyqqrkAMlqdFilaMbG`
- Receipt Discord thread: `1504970426118311968`

## Current operating model

- App is the user-facing visual trip planner.
- Discord is the collaboration/intake layer, especially for receipt uploads and trip-change requests.
- Google Drive stores evidence/receipts.
- Google Sheet is a readable backup and operational safety layer.
- Obsidian/repo docs are Jin/Hermes shared architecture memory.
- Mission Control is generated from live scans + append-only logs.

## Current tabs / user-facing structure

- Map
- Calendar
- Inspiration
- Receipts

## Current risk rating

**Yellow / medium debt**: not urgent, but stabilize before major new features or more parallel code work.

Reasons:

- `src/App.jsx` is large and mixes data/UI/helpers.
- `src/App.css` is large and likely accumulated iterative styles.
- Active branches/worktrees exist and need merge/archive decisions.
- Some legacy/mock/scaffold files need classification.

## Request gate

Before implementation, classify each request as:

1. Patch
2. Feature
3. Experiment
4. Architecture change

Architecture changes require checkpoint first.
