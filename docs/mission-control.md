# BearBunny Mission Control — Korea Trip App

**Generated:** 2026-05-12 23:35 PDT  
**Freshness:** Fresh  
**Health:** YELLOW / risk points 5  
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

### Why this health rating

- src/App.jsx is large (3945 lines)
- src/App.css is large (4867 lines)
- 2 git worktrees open

---

## Active workstreams

| name | status | risk | scope | decision |
|---|---|---|---|---|
| Korea Mission Control foundation | active | medium | docs/, scripts/regenerate_mission_control.py, Obsidian mirror, Google Sheet tabs | Approved by Dr. Cho for execution |
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

## Largest files

| path | lines | state | why |
|---|---|---|---|
| src/App.css | 4867 | active | Current repo file |
| src/App.jsx | 3945 | active | Current repo file |
| package-lock.json | 3909 | active | Current repo file |
| src/test/App.test.jsx | 726 | active | Current repo file |
| docs/plans/2026-04-21-visual-redesign-plan.md | 410 | docs | Documentation/backbone/planning surface |
| docs/mission-control.json | 300 | docs/generated-or-substrate | Documentation/backbone/planning surface |
| mockup-map-first-v2.html | 235 | experiment/mock | Standalone mockup, not production runtime |
| docs/mission-control.md | 232 | docs/generated-or-substrate | Documentation/backbone/planning surface |
| docs/phase-0-inventory-2026-05-12.md | 216 | docs | Documentation/backbone/planning surface |
| src/lib/tripStateStore.js | 157 | active | Current repo file |
| public/receipts-inbox.json | 135 | active | Current repo file |
| scripts/receipt-ingest.mjs | 125 | active | Current repo file |
| docs/garage/2026-05-12-mockups/bearbunny-mission-control-mock.html | 117 | experiment/mock | Standalone mockup, not production runtime |
| docs/garage/2026-05-12-mockups/korea-calendar-backup-sheet-mock.html | 105 | experiment/mock | Standalone mockup, not production runtime |
| api/kakao-route.js | 102 | active | Current repo file |
| src/lib/receiptPipeline.js | 102 | active | Current repo file |
| src/lib/routing.js | 91 | active | Current repo file |
| src/test/tripStateStore.test.js | 83 | active | Current repo file |
| src/test/routing.test.js | 63 | active | Current repo file |
| docs/backbone.md | 55 | docs | Documentation/backbone/planning surface |

---

## Git status

```text
## compare-strong-copy-experiment...origin/compare-strong-copy-experiment
```

## Worktrees

```text
/Users/jincho/Documents/korea-trip-app  aaa7c58 [compare-strong-copy-experiment]
/private/tmp/korea-receipts-worktree    312f25f [receipt-date-dashboard]
```

## Branches

```text
* compare-strong-copy-experiment
  remotes/origin/compare-strong-copy-experiment
+ receipt-date-dashboard
  main
  remotes/origin/HEAD -> origin/main
  remotes/origin/main
```

## Recent commits

```text
aaa7c58 (HEAD -> compare-strong-copy-experiment, origin/compare-strong-copy-experiment) chore: add project mission control foundation
8797339 Add Korea shopping routes to map
f4c24e9 Replace receipts graph with ledger overview
312f25f (receipt-date-dashboard) Refine receipt date filtering dashboard
13524f6 Add accepted food picks to Korea map
e053597 Compact receipts balance dashboard
34ee5f5 Add latest Instagram batch to Inspiration
b8e8fa2 Style receipts dashboard
836edef Add Yongwangsan Skywalk inspiration save
7d63ed0 Clean up Korea receipt entries
e46c131 Add May 21 and 22 Korea bookings
c811029 Add Korea receipt thread bookings
581a8f4 Pin thread Instagram saves in Inspiration
a9d20a4 Expand inspiration reel candidates
1feac7d Unify sticky tabs and prioritize playable reels
```

---

## Legacy / TODO / Mission Control markers

- `src/App.jsx:11: legacySpendToReceipts,`
- `src/App.jsx:23: const legacyTabMeta = {`
- `src/App.jsx:1467: const todoRules = {`
- `src/App.jsx:2442: () => [...manualReceipts, ...importedReceipts, ...legacySpendToReceipts(spend)],`
- `src/App.jsx:2580: const smartTodos = useMemo(() => {`
- `src/App.jsx:2589: const rule = todoRules[board.key] ?? {`
- `src/App.jsx:3086: <nav className="legacy-workspace-shortcuts sr-only" aria-label="Legacy planning shortcuts">`
- `src/App.jsx:3087: {Object.entries(legacyTabMeta).map(([tab, meta]) => (`
- `docs/phase-0-inventory-2026-05-12.md:7: **Purpose:** Freeze-and-inventory pass before Project OS / Mission Control foundation. No app code refactor decisions are executed here.`
- `docs/phase-0-inventory-2026-05-12.md:97: ## 6. Legacy / TODO / Mission Control markers`
- `docs/phase-0-inventory-2026-05-12.md:100: ./bearbunny-mission-control-mock.html:5:<title>BearBunny Mission Control Mock</title>`
- `docs/phase-0-inventory-2026-05-12.md:101: ./bearbunny-mission-control-mock.html:23:      <div class="title"><h1>BearBunny Mission Control — Korea Trip App</h1><p>Generated from repo logs + git/vercel scan + Obsidian backbo`
- `docs/phase-0-inventory-2026-05-12.md:102: ./bearbunny-mission-control-mock.html:76:          <div class="node"><b>Mission Control</b><ul><li>Generated dashboard</li><li>Freshness stamp</li><li>Google Sheet + docs mirror</l`
- `docs/phase-0-inventory-2026-05-12.md:103: ./bearbunny-mission-control-mock.html:83:          <tr><td>Old tab components</td><td>Potential legacy</td><td>V1 structure replaced</td><td>Move to garage if unused</td></tr>`
- `docs/phase-0-inventory-2026-05-12.md:104: ./bearbunny-mission-control-mock.html:105:          <div class="item">Whether Mission Control is fresh or stale.</div>`
- `docs/phase-0-inventory-2026-05-12.md:105: ./bearbunny-mission-control-mock.html:114:    <div class="footer"><span>Mission Control is regenerated from append-only logs + live scans. If stale &gt;72h, show warning.</span><sp`
- `docs/phase-0-inventory-2026-05-12.md:106: ./src/test/tripStateStore.test.js:68:  test('writes a shared-state snapshot back to the legacy localStorage keys for offline fallback', () => {`
- `docs/phase-0-inventory-2026-05-12.md:107: ./src/App.jsx:11:  legacySpendToReceipts,`
- `docs/phase-0-inventory-2026-05-12.md:108: ./src/App.jsx:23:const legacyTabMeta = {`
- `docs/phase-0-inventory-2026-05-12.md:109: ./src/App.jsx:2431:    () => [...manualReceipts, ...importedReceipts, ...legacySpendToReceipts(spend)],`
- `docs/phase-0-inventory-2026-05-12.md:110: ./src/App.jsx:3075:          <nav className="legacy-workspace-shortcuts sr-only" aria-label="Legacy planning shortcuts">`
- `docs/phase-0-inventory-2026-05-12.md:111: ./src/App.jsx:3076:            {Object.entries(legacyTabMeta).map(([tab, meta]) => (`
- `docs/phase-0-inventory-2026-05-12.md:112: ./src/lib/receiptPipeline.js:90:export function legacySpendToReceipts(spendRows = []) {`
- `docs/phase-0-inventory-2026-05-12.md:113: ./src/lib/receiptPipeline.js:98:    id: `legacy-${row.item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,`
- `docs/phase-0-inventory-2026-05-12.md:114: ./src/lib/receiptPipeline.js:99:    source: 'legacy-spend',`
- `docs/phase-0-inventory-2026-05-12.md:138: | `src/components/BookingsTab.jsx` | 3 | possible legacy | Old V1-style tab component; verify imports before garage/archive |`
- `docs/phase-0-inventory-2026-05-12.md:140: | `src/components/HomeTab.jsx` | 3 | possible legacy | Old V1-style tab component; verify imports before garage/archive |`
- `docs/phase-0-inventory-2026-05-12.md:142: | `src/components/ItineraryTab.jsx` | 3 | possible legacy | Old V1-style tab component; verify imports before garage/archive |`
- `docs/phase-0-inventory-2026-05-12.md:144: | `src/components/PlacesTab.jsx` | 3 | possible legacy | Old V1-style tab component; verify imports before garage/archive |`
- `docs/phase-0-inventory-2026-05-12.md:167: | 753 | `/Users/jincho/Documents/Obsidian Vault/00 - Meta/AI Project OS/2026-05-12 - Project Architecture Mission Control Plan.md` |`
- `docs/phase-0-inventory-2026-05-12.md:203: - Existing docs describe the V2 plan, but live app reality has moved fast; Mission Control should be generated from live scans + append-only logs.`
- `docs/phase-0-inventory-2026-05-12.md:210: Proceed to Mission Control foundation without deleting or refactoring app code yet:`
- `docs/phase-0-inventory-2026-05-12.md:213: 2. Create generated Mission Control docs.`
- `docs/phase-0-inventory-2026-05-12.md:214: 3. Mirror Mission Control summary to Obsidian.`
- `docs/phase-0-inventory-2026-05-12.md:215: 4. Update Google Sheet Mission Control tabs.`
- `docs/garage/2026-05-12-mockups/bearbunny-mission-control-mock.html:5: <title>BearBunny Mission Control Mock</title>`
- `docs/garage/2026-05-12-mockups/bearbunny-mission-control-mock.html:23: <div class="title"><h1>BearBunny Mission Control — Korea Trip App</h1><p>Generated from repo logs + git/vercel scan + Obsidian backbone · not hand-edited</p></div>`
- `docs/garage/2026-05-12-mockups/bearbunny-mission-control-mock.html:76: <div class="node"><b>Mission Control</b><ul><li>Generated dashboard</li><li>Freshness stamp</li><li>Google Sheet + docs mirror</li></ul></div><div class="arrow">→</div>`
- `docs/garage/2026-05-12-mockups/bearbunny-mission-control-mock.html:83: <tr><td>Old tab components</td><td>Potential legacy</td><td>V1 structure replaced</td><td>Move to garage if unused</td></tr>`
- `docs/garage/2026-05-12-mockups/bearbunny-mission-control-mock.html:105: <div class="item">Whether Mission Control is fresh or stale.</div>`
- `docs/garage/2026-05-12-mockups/bearbunny-mission-control-mock.html:114: <div class="footer"><span>Mission Control is regenerated from append-only logs + live scans. If stale &gt;72h, show warning.</span><span>Mockup only — not yet implemented</span></d`
- `src/lib/receiptPipeline.js:90: export function legacySpendToReceipts(spendRows = []) {`
- `src/lib/receiptPipeline.js:98: id: `legacy-${row.item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,`
- `src/lib/receiptPipeline.js:99: source: 'legacy-spend',`
- `src/test/tripStateStore.test.js:68: test('writes a shared-state snapshot back to the legacy localStorage keys for offline fallback', () => {`
- `docs/backbone.md:5: **Mission Control:** `docs/mission-control.md``
- `docs/backbone.md:26: - Mission Control is generated from live scans + append-only logs.`
- `docs/backbone.md:44: - Some legacy/mock/scaffold files need classification.`
- `docs/architecture-map.md:9: Mission Control   → generated status dashboard + Google Sheet/Obsidian mirror`
- `docs/architecture-map.md:21: | Architecture | Mission Control summary | repo docs + Obsidian | Telegram decisions | append-only logs |`
- `docs/deprecated.md:1: # Deprecated / Garage Candidates`
- `docs/deprecated.md:9: | `src/components/BookingsTab.jsx` | Component | possible legacy | Older V1-style tab component | Verify imports, then garage/archive if unused |`
- `docs/deprecated.md:10: | `src/components/HomeTab.jsx` | Component | possible legacy | Older V1-style tab component | Verify imports, then garage/archive if unused |`
- `docs/deprecated.md:11: | `src/components/ItineraryTab.jsx` | Component | possible legacy | Older V1-style tab component | Verify imports, then garage/archive if unused |`
- `docs/deprecated.md:12: | `src/components/PlacesTab.jsx` | Component | possible legacy | Older V1-style tab component | Verify imports, then garage/archive if unused |`
- `docs/deprecated.md:15: | `docs/garage/2026-05-12-mockups/bearbunny-mission-control-mock.html` | Mock/experiment | garaged | Standalone Mission Control mock | Keep for reference; not production runtime |`
- `docs/changelog.md:6: 2026-05-12 23:27 | change | Added generated Mission Control docs, Obsidian mirror, Google Sheet MC tabs, and npm run mission-control command | n/a`
- `docs/changelog.md:8: 2026-05-12 23:33 | change | Improved Mission Control generator to exclude generated outputs and __pycache__ from marker scanning/noise | n/a`
- `docs/checkpoint-log.md:5: 2026-05-12 23:22 | checkpoint | Trigger: Dr. Cho approved Project OS execution; outcome: Phase 0 inventory first, then generated Mission Control foundation, no destructive changes `
- `docs/decisions.md:6: 2026-05-12 23:22 | decision | Mission Control should be generated from append-only logs plus live scans, not hand-edited | n/a`

---

## Substrate logs — recent entries

### Changelog
- Append-only. Format: `YYYY-MM-DD HH:MM | change | one-line description | commit-sha or n/a`.
- 2026-05-12 23:22 | change | Seeded BearBunny Project OS substrate and Phase 0 inventory | f4c24e9
- 2026-05-12 23:27 | change | Added generated Mission Control docs, Obsidian mirror, Google Sheet MC tabs, and npm run mission-control command | n/a
- 2026-05-12 23:29 | change | Fixed Vitest isolation by clearing mocked localStorage after each test; root cause was cross-test persisted planner state | n/a
- 2026-05-12 23:33 | change | Improved Mission Control generator to exclude generated outputs and __pycache__ from marker scanning/noise | n/a

### Decisions
- Append-only. Format: `YYYY-MM-DD HH:MM | decision | one-line decision + reason | commit-sha or n/a`.
- 2026-05-12 23:22 | decision | Canonical Korea app project is koreatrip at https://koreatrip.vercel.app; Google Sheet backup is 1cTlLzGWmfXODVSq1iDIUJPo0YfTSb7eZKC8w4q8bskY | n/a
- 2026-05-12 23:22 | decision | Mission Control should be generated from append-only logs plus live scans, not hand-edited | n/a
- 2026-05-12 23:22 | decision | Discord threads are workspaces; Telegram confirmation is required before Discord decisions become backbone | n/a

### Cleanup
- Append-only. Format: `YYYY-MM-DD HH:MM | cleanup | one-line cleanup item/action | commit-sha or n/a`.
- 2026-05-12 23:22 | cleanup | Flagged src/App.jsx and src/App.css as large-file stabilization candidates; no code refactor performed yet | n/a
- 2026-05-12 23:22 | cleanup | Flagged mock HTML files and older V1 tab components as possible garage candidates pending import verification | n/a
- 2026-05-12 23:26 | cleanup | Moved standalone mockup HTML files from repo root into docs/garage/2026-05-12-mockups; no production code affected | n/a

### Checkpoints
- Append-only. Format: `YYYY-MM-DD HH:MM | checkpoint | trigger + outcome | commit-sha or n/a`.
- 2026-05-12 23:22 | checkpoint | Trigger: Dr. Cho approved Project OS execution; outcome: Phase 0 inventory first, then generated Mission Control foundation, no destructive changes | n/a
- 2026-05-12 23:27 | checkpoint | Verification: npm test passed 49/49 and npm run build passed; Vite chunk-size warning remains informational | n/a
- 2026-05-12 23:29 | checkpoint | Test failure investigation: specific test passed alone but failed in suite; isolated root cause to localStorage leakage across App tests | n/a

---

## Request gate

- **Patch:** direct edit okay; log if production changes.
- **Feature:** plan + tests/build + preview/production decision.
- **Experiment:** preview/mock only until Dr. Cho accepts.
- **Architecture change:** checkpoint first.

## Autonomy guardrails

- **Green:** inspect, generate, run tests/build, update Mission Control.
- **Yellow:** internal refactor/archive with notice.
- **Red:** delete, major page removal, production deploy of big structural changes, migration, public access changes — ask Dr. Cho first.
