# BearBunny Mission Control — Korea Trip App

**Generated:** 2026-05-13 00:10 PDT  
**Freshness:** Fresh  
**Health:** YELLOW / risk points 5  
**Next Checkpoint:** in 6 days — 7-day trigger fires first  
**Do not hand-edit:** regenerate with `npm run mission-control` or `python3 scripts/regenerate_mission_control.py`.

---

## Executive overview

| Metric | Value |
|---|---|
| Canonical app | https://koreatrip.vercel.app |
| Vercel project | `koreatrip` |
| Repo | `/Users/jincho/Documents/korea-trip-app` |
| Backup Sheet | `1cTlLzGWmfXODVSq1iDIUJPo0YfTSb7eZKC8w4q8bskY` |
| Receipts Drive | `1LpqlmrVIZW8aWQdyqqrkAMlqdFilaMbG` |
| Receipt thread | `1503846727273283787` |
| App.jsx lines | 3945 |
| App.css lines | 4867 |
| Worktrees open | 2 |
| Garage items | 3 |
| Active previews | 12 |

### Why this health rating

- src/App.jsx is large (3945 lines)
- src/App.css is large (4867 lines)
- 2 git worktrees open

---

## Architecture Map

### Pages

| name | route | purpose | status |
|---|---|---|---|
| Map | tab:map | spatial itinerary and place drawer | production |
| Calendar | tab:calendar | day timeline | production |
| Inspiration | tab:inspiration | saved reels and ideas | production |
| Receipts | tab:receipts | bookings, receipts, spend | production |

### Data sources

| name | file | kind | backup |
|---|---|---|---|
| receipts-inbox.json | public/receipts-inbox.json | static | Google Sheet 1cTlLzGWmfXODVSq1iDIUJPo0YfTSb7eZKC8w4q8bskY |
| itinerary.js | src/data/itinerary.js | static | Google Sheet 1cTlLzGWmfXODVSq1iDIUJPo0YfTSb7eZKC8w4q8bskY |
| places.js | src/data/places.js | static | Google Sheet 1cTlLzGWmfXODVSq1iDIUJPo0YfTSb7eZKC8w4q8bskY |

### Backends

| name | status | purpose |
|---|---|---|
| src/lib/tripStateStore.js | active | backend/helper integration |
| api/kakao-route.js | active | backend/helper integration |
| supabase/migrations/20260426173100_trip_state_scaffold.sql | scaffolded | backend/helper integration |
| src/lib/supabaseClient.js | scaffolded | backend/helper integration |

### Sync directions

| from | to | kind | frequency | status |
|---|---|---|---|---|
| App | Google Sheet | manual backup/export | ad-hoc | active |
| Discord receipt thread | public/receipts-inbox.json | curated/manual ingest | on demand | active |
| public/receipts-inbox.json | App Receipts tab | static app data | build/runtime | active |
| Drive receipts folder | Google Sheet Receipts / Drive Evidence | evidence linking | on demand | active |

---

## Active workstreams

| name | status | risk | scope | decision |
|---|---|---|---|---|
| Korea Mission Control foundation | active | medium | docs/, scripts/, Obsidian mirror, localhost dashboard | Approved by Dr. Cho for execution |
| Receipt dashboard / receipt inbox | production-ish | low-medium | public/receipts-inbox.json, src receipt UI/pipeline | Keep; use Mission Control before major sync changes |
| Branch/worktree hygiene | needs decision | medium | compare-strong-copy-experiment, receipt-date-dashboard, main, /private/tmp/korea-receipts-worktree | Review after Mission Control foundation |

---

## Cleanup queue

| item | type | why | action |
|---|---|---|---|
| src/App.jsx | large file | Data + UI + helpers combined | Split after Phase 0 / Mission Control foundation |
| src/App.css | large file | Accumulated iterative styles | Split by feature after app structure stabilizes |
| old V1 tab components | possible legacy | V2 app uses Map/Calendar/Inspiration/Receipts | Verify imports, then garage/archive if unused |
| mock HTML files | experiments | Design artifacts, not runtime | Move to dated garage after accepted |
| branch/worktree state | execution hygiene | Multiple surfaces open | Decide merge/archive policy |

---

## Garage

| path | kind | size_kb | still_referenced |
|---|---|---|---|
| docs/garage/2026-05-12-mockups/korea-calendar-backup-sheet-mock.html | html | 13.3 | True |
| docs/garage/2026-05-12-mockups/bearbunny-mission-control-mock.html | html | 13.3 | True |
| docs/garage/2026-05-12-mockups/README.md | md | 0.3 | True |

---

## Preview deployments

| url | branch | purpose | owner | status |
|---|---|---|---|---|
| https://koreatrip-571tpf0z0-bearbunnyrx-webs-projects.vercel.app | unknown | preview deployment | unknown | pending-review |
| https://koreatrip-bkbjdnlto-bearbunnyrx-webs-projects.vercel.app | unknown | preview deployment | unknown | pending-review |
| https://koreatrip-kc01j8wdg-bearbunnyrx-webs-projects.vercel.app | unknown | preview deployment | unknown | pending-review |
| https://koreatrip-6a7rrjk6w-bearbunnyrx-webs-projects.vercel.app | unknown | preview deployment | unknown | pending-review |
| https://koreatrip-beafzryv2-bearbunnyrx-webs-projects.vercel.app | unknown | preview deployment | unknown | pending-review |
| https://koreatrip-c0lkfixcj-bearbunnyrx-webs-projects.vercel.app | unknown | preview deployment | unknown | pending-review |
| https://koreatrip-flt6a3c9z-bearbunnyrx-webs-projects.vercel.app | unknown | preview deployment | unknown | pending-review |
| https://koreatrip-bkcxhxewh-bearbunnyrx-webs-projects.vercel.app | unknown | preview deployment | unknown | pending-review |
| https://koreatrip-jkvtl6rnf-bearbunnyrx-webs-projects.vercel.app | unknown | preview deployment | unknown | pending-review |
| https://koreatrip-o5i8vvlxo-bearbunnyrx-webs-projects.vercel.app | unknown | preview deployment | unknown | pending-review |
| https://koreatrip-lcolwddnv-bearbunnyrx-webs-projects.vercel.app | unknown | preview deployment | unknown | pending-review |
| https://koreatrip-5n0fhpiss-bearbunnyrx-webs-projects.vercel.app | unknown | preview deployment | unknown | pending-review |

---

## Recent decisions

- **2026-05-12 23:58** — Agent bootstrap and cross-agent vault contract are durable docs, not only planning text (`n/a`)
- **2026-05-12 23:45** — Mission Control should be viewed primarily as a localhost dashboard for malleability; Google Sheet remains backup/summary (`n/a`)
- **2026-05-12 23:22** — Discord threads are workspaces; Telegram confirmation is required before Discord decisions become backbone (`n/a`)
- **2026-05-12 23:22** — Mission Control should be generated from append-only logs plus live scans, not hand-edited (`n/a`)
- **2026-05-12 23:22** — Canonical Korea app project is koreatrip at https://koreatrip.vercel.app; Google Sheet backup is 1cTlLzGWmfXODVSq1iDIUJPo0YfTSb7eZKC8w4q8bskY (`n/a`)

---

## Largest files

| path | lines | state | why |
|---|---|---|---|
| src/App.css | 4867 | active | Current repo file |
| src/App.jsx | 3945 | active | Current repo file |
| package-lock.json | 3909 | active | Current repo file |
| docs/mission-control.json | 985 | docs/generated | Generated Mission Control artifact |
| src/test/App.test.jsx | 726 | active | Current repo file |
| docs/plans/2026-04-21-visual-redesign-plan.md | 410 | docs | Documentation/backbone/planning surface |
| docs/architecture-map.json | 343 | docs/generated | Generated Mission Control artifact |
| mockup-map-first-v2.html | 235 | experiment/mock | Standalone mockup, not production runtime |
| docs/phase-0-inventory-2026-05-12.md | 216 | docs | Documentation/backbone/planning surface |
| docs/mission-control.md | 200 | docs/generated | Generated Mission Control artifact |
| src/lib/tripStateStore.js | 157 | active | Current repo file |
| public/receipts-inbox.json | 135 | active | Current repo file |
| docs/previews.json | 128 | docs/generated | Generated Mission Control artifact |
| scripts/receipt-ingest.mjs | 125 | active | Current repo file |
| docs/garage/2026-05-12-mockups/bearbunny-mission-control-mock.html | 117 | experiment/mock | Standalone mockup, not production runtime |
| docs/garage/2026-05-12-mockups/korea-calendar-backup-sheet-mock.html | 105 | experiment/mock | Standalone mockup, not production runtime |
| api/kakao-route.js | 102 | active | Current repo file |
| src/lib/receiptPipeline.js | 102 | active | Current repo file |
| src/lib/routing.js | 91 | active | Current repo file |
| src/test/tripStateStore.test.js | 83 | active | Current repo file |

---

## Git status

```text
## compare-strong-copy-experiment...origin/compare-strong-copy-experiment
```

## Worktrees

```text
/Users/jincho/Documents/korea-trip-app  f31813e [compare-strong-copy-experiment]
/private/tmp/korea-receipts-worktree    312f25f [receipt-date-dashboard]
```

---

## Substrate logs — recent entries

### Changelog
- 2026-05-12 23:22 | change | Seeded BearBunny Project OS substrate and Phase 0 inventory | f4c24e9
- 2026-05-12 23:27 | change | Added generated Mission Control docs, Obsidian mirror, Google Sheet MC tabs, and npm run mission-control command | n/a
- 2026-05-12 23:29 | change | Fixed Vitest isolation by clearing mocked localStorage after each test; root cause was cross-test persisted planner state | n/a
- 2026-05-12 23:33 | change | Improved Mission Control generator to exclude generated outputs and __pycache__ from marker scanning/noise | n/a
- 2026-05-12 23:45 | change | Added localhost-only Mission Control web dashboard served by npm run mission-control:serve | n/a
- 2026-05-12 23:58 | change | Added durable AGENT-BOOTSTRAP.md and Obsidian AGENT-VAULT-CONTRACT.md pointer workflow | n/a
- 2026-05-13 00:03 | change | Added Mission Control follow-up panels: Recent Decisions, Next Checkpoint, Garage, Previews, and Architecture Map generation | n/a
### Decisions
- 2026-05-12 23:22 | decision | Canonical Korea app project is koreatrip at https://koreatrip.vercel.app; Google Sheet backup is 1cTlLzGWmfXODVSq1iDIUJPo0YfTSb7eZKC8w4q8bskY | n/a
- 2026-05-12 23:22 | decision | Mission Control should be generated from append-only logs plus live scans, not hand-edited | n/a
- 2026-05-12 23:22 | decision | Discord threads are workspaces; Telegram confirmation is required before Discord decisions become backbone | n/a
- 2026-05-12 23:45 | decision | Mission Control should be viewed primarily as a localhost dashboard for malleability; Google Sheet remains backup/summary | n/a
- 2026-05-12 23:58 | decision | Agent bootstrap and cross-agent vault contract are durable docs, not only planning text | n/a
### Cleanup
- 2026-05-12 23:22 | cleanup | Flagged src/App.jsx and src/App.css as large-file stabilization candidates; no code refactor performed yet | n/a
- 2026-05-12 23:22 | cleanup | Flagged mock HTML files and older V1 tab components as possible garage candidates pending import verification | n/a
- 2026-05-12 23:26 | cleanup | Moved standalone mockup HTML files from repo root into docs/garage/2026-05-12-mockups; no production code affected | n/a
### Checkpoints
- 2026-05-12 23:22 | checkpoint | Trigger: Dr. Cho approved Project OS execution; outcome: Phase 0 inventory first, then generated Mission Control foundation, no destructive changes | n/a
- 2026-05-12 23:27 | checkpoint | Verification: npm test passed 49/49 and npm run build passed; Vite chunk-size warning remains informational | n/a
- 2026-05-12 23:29 | checkpoint | Test failure investigation: specific test passed alone but failed in suite; isolated root cause to localStorage leakage across App tests | n/a
- 2026-05-13 00:03 | checkpoint | Follow-up build stayed in Mission Control scope; no App.jsx/App.css refactor or public app changes | n/a
