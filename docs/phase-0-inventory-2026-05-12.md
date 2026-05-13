# Korea App Phase 0 Inventory — 2026-05-12

**Generated:** 2026-05-12 23:22 PDT  
**Project:** Korea Trip App  
**Repo:** `/Users/jincho/Documents/korea-trip-app`  
**Canonical app:** https://koreatrip.vercel.app  
**Purpose:** Freeze-and-inventory pass before Project OS / Mission Control foundation. No app code refactor decisions are executed here.

---

## 1. Git status

```text
## compare-strong-copy-experiment...origin/compare-strong-copy-experiment
?? bearbunny-mission-control-mock.html
?? korea-calendar-backup-sheet-mock.html
```

## 2. Branches

```text
* compare-strong-copy-experiment
  remotes/origin/compare-strong-copy-experiment
+ receipt-date-dashboard
  main
  remotes/origin/HEAD -> origin/main
  remotes/origin/main
```

## 3. Worktrees

```text
/Users/jincho/Documents/korea-trip-app  f4c24e9 [compare-strong-copy-experiment]
/private/tmp/korea-receipts-worktree    312f25f [receipt-date-dashboard]
```

## 4. Recent git log

```text
f4c24e9 (HEAD -> compare-strong-copy-experiment, origin/compare-strong-copy-experiment) Replace receipts graph with ledger overview
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
ed14f25 Refine V2 sticky tabs and Instagram embeds
583f8ef Simplify shared trip tabs
44f8113 Simplify map overlays
b82d32c Polish phase H map reliability
56e3c07 Build phase G cross-tab linking
467be52 Build phase F receipts pipeline
7a195dc Build phase E inspiration grid
```

## 5. Largest files

```text
4867 src/App.css
 3934 src/App.jsx
 3909 package-lock.json
  719 src/test/App.test.jsx
  410 docs/plans/2026-04-21-visual-redesign-plan.md
  235 mockup-map-first-v2.html
  157 src/lib/tripStateStore.js
  135 public/receipts-inbox.json
  125 scripts/receipt-ingest.mjs
  117 bearbunny-mission-control-mock.html
  105 korea-calendar-backup-sheet-mock.html
  102 src/lib/receiptPipeline.js
  102 api/kakao-route.js
   91 src/lib/routing.js
   83 src/test/tripStateStore.test.js
   63 src/test/routing.test.js
   50 src/test/receiptPipeline.test.js
   34 package.json
   29 eslint.config.js
   27 src/test/setup.js
   21 src/index.css
   21 src/components/BottomNav.jsx
   20 README.md
   13 index.html
   11 vite.config.js
   10 src/main.jsx
    5 src/lib/supabaseClient.js
    4 src/data/places.js
    4 src/data/itinerary.js
    3 src/components/StopItem.jsx
```

## 6. Legacy / TODO / Mission Control markers

```text
./bearbunny-mission-control-mock.html:5:<title>BearBunny Mission Control Mock</title>
./bearbunny-mission-control-mock.html:23:      <div class="title"><h1>BearBunny Mission Control — Korea Trip App</h1><p>Generated from repo logs + git/vercel scan + Obsidian backbone · not hand-edited</p></div>
./bearbunny-mission-control-mock.html:76:          <div class="node"><b>Mission Control</b><ul><li>Generated dashboard</li><li>Freshness stamp</li><li>Google Sheet + docs mirror</li></ul></div><div class="arrow">→</div>
./bearbunny-mission-control-mock.html:83:          <tr><td>Old tab components</td><td>Potential legacy</td><td>V1 structure replaced</td><td>Move to garage if unused</td></tr>
./bearbunny-mission-control-mock.html:105:          <div class="item">Whether Mission Control is fresh or stale.</div>
./bearbunny-mission-control-mock.html:114:    <div class="footer"><span>Mission Control is regenerated from append-only logs + live scans. If stale &gt;72h, show warning.</span><span>Mockup only — not yet implemented</span></div>
./src/test/tripStateStore.test.js:68:  test('writes a shared-state snapshot back to the legacy localStorage keys for offline fallback', () => {
./src/App.jsx:11:  legacySpendToReceipts,
./src/App.jsx:23:const legacyTabMeta = {
./src/App.jsx:2431:    () => [...manualReceipts, ...importedReceipts, ...legacySpendToReceipts(spend)],
./src/App.jsx:3075:          <nav className="legacy-workspace-shortcuts sr-only" aria-label="Legacy planning shortcuts">
./src/App.jsx:3076:            {Object.entries(legacyTabMeta).map(([tab, meta]) => (
./src/lib/receiptPipeline.js:90:export function legacySpendToReceipts(spendRows = []) {
./src/lib/receiptPipeline.js:98:    id: `legacy-${row.item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
./src/lib/receiptPipeline.js:99:    source: 'legacy-spend',
```

## 7. File inventory and preliminary lifecycle classification

| File | Lines | State | Notes |
|---|---:|---|---|
| `README.md` | 20 | active | Current repo file |
| `api/kakao-route.js` | 102 | active | Current repo file |
| `bearbunny-mission-control-mock.html` | 117 | experiment/mock | Standalone mockup, not production app runtime |
| `docs/plans/2026-04-21-visual-redesign-plan.md` | 410 | docs | Documentation/backbone/planning surface |
| `korea-calendar-backup-sheet-mock.html` | 105 | experiment/mock | Standalone mockup, not production app runtime |
| `mockup-map-first-v2.html` | 235 | experiment/mock | Standalone mockup, not production app runtime |
| `package.json` | 34 | active | Current repo file |
| `public/favicon.svg` | 1 | active | Current repo file |
| `public/icons.svg` | 24 | active | Current repo file |
| `public/receipts-inbox.json` | 135 | active data | Receipts tab backup data source |
| `public/seoul-jeju-home.png` |  | active | Current repo file |
| `scripts/receipt-ingest.mjs` | 125 | active | Current repo file |
| `src/App.css` | 4867 | active | Current repo file |
| `src/App.jsx` | 3934 | active | Current repo file |
| `src/assets/hero.png` |  | active | Current repo file |
| `src/assets/react.svg` | 1 | active | Current repo file |
| `src/assets/vite.svg` | 1 | active | Current repo file |
| `src/components/BookingsTab.jsx` | 3 | possible legacy | Old V1-style tab component; verify imports before garage/archive |
| `src/components/BottomNav.jsx` | 21 | active | Current repo file |
| `src/components/HomeTab.jsx` | 3 | possible legacy | Old V1-style tab component; verify imports before garage/archive |
| `src/components/ItineraryDayCard.jsx` | 3 | active | Current repo file |
| `src/components/ItineraryTab.jsx` | 3 | possible legacy | Old V1-style tab component; verify imports before garage/archive |
| `src/components/PlaceCard.jsx` | 3 | active | Current repo file |
| `src/components/PlacesTab.jsx` | 3 | possible legacy | Old V1-style tab component; verify imports before garage/archive |
| `src/components/StopItem.jsx` | 3 | active | Current repo file |
| `src/data/itinerary.js` | 4 | active | Current repo file |
| `src/data/places.js` | 4 | active | Current repo file |
| `src/index.css` | 21 | active | Current repo file |
| `src/lib/receiptPipeline.js` | 102 | active | Current repo file |
| `src/lib/routing.js` | 91 | active | Current repo file |
| `src/lib/supabaseClient.js` | 5 | active | Current repo file |
| `src/lib/tripStateStore.js` | 157 | active | Current repo file |
| `src/main.jsx` | 10 | active | Current repo file |
| `src/test/App.test.jsx` | 719 | active | Current repo file |
| `src/test/receiptPipeline.test.js` | 50 | active | Current repo file |
| `src/test/routing.test.js` | 63 | active | Current repo file |
| `src/test/setup.js` | 27 | active | Current repo file |
| `src/test/tripStateStore.test.js` | 83 | active | Current repo file |
| `supabase/migrations/20260426173100_trip_state_scaffold.sql` | 46 | scaffold/unclear | Supabase scaffold exists but current model appears semi-sync/static |
| `vite.config.js` | 11 | active | Current repo file |


## 8. Relevant Obsidian notes discovered

| Lines | Path |
|---:|---|
| 753 | `/Users/jincho/Documents/Obsidian Vault/00 - Meta/AI Project OS/2026-05-12 - Project Architecture Mission Control Plan.md` |
| 156 | `/Users/jincho/Documents/Obsidian Vault/01 - Korea Trip 2026/Korea Trip App - V2 Redesign Plan.md` |
| 100 | `/Users/jincho/Documents/Obsidian Vault/Jin/Discord Threads/1503587031534796810 - bookings - Korea Trip Confirmed.md` |
| 397 | `/Users/jincho/Documents/Obsidian Vault/01 - Korea Trip 2026/Korea Trip App - Codex Build Plan.md` |
| 107 | `/Users/jincho/Documents/Obsidian Vault/Jin/Discord Threads/1501108900127051839 - creditcards - card history.md` |
| 25 | `/Users/jincho/Documents/Obsidian Vault/Jin/Discord Threads/1500679041139609652 - creditcards.md` |
| 26 | `/Users/jincho/Documents/Obsidian Vault/Jin/Discord Threads/Financials Channels.md` |
| 76 | `/Users/jincho/Documents/Obsidian Vault/00 - Meta/Backbone Workflow.md` |
| 13 | `/Users/jincho/Documents/Obsidian Vault/Discord Thread Workspaces/1494222389532168283 - Korea itinerary placeholder.md` |
| 13 | `/Users/jincho/Documents/Obsidian Vault/Discord Thread Workspaces/1494215676594749552 - General placeholder.md` |
| 16 | `/Users/jincho/Documents/Obsidian Vault/Discord Thread Workspaces/1494224630616031242 - Wishlist placeholder.md` |
| 13 | `/Users/jincho/Documents/Obsidian Vault/Discord Thread Workspaces/1497689028064051220 - Portland trip placeholder 2.md` |
| 13 | `/Users/jincho/Documents/Obsidian Vault/Discord Thread Workspaces/1497685812777582715 - Portland trip placeholder.md` |
| 33 | `/Users/jincho/Documents/Obsidian Vault/Discord Thread Workspaces/1494355422210031796 - Humidifier wishlist research.md` |
| 37 | `/Users/jincho/Documents/Obsidian Vault/Discord Thread Workspaces/1497689882724798584 - Portland app flights update.md` |
| 48 | `/Users/jincho/Documents/Obsidian Vault/Discord Thread Workspaces/1496166137006919681 - Jeju self-snap proposal planning.md` |
| 32 | `/Users/jincho/Documents/Obsidian Vault/Discord Thread Workspaces/1496159333808083034 - Korea dermatology ReOne backup plan.md` |
| 45 | `/Users/jincho/Documents/Obsidian Vault/Discord Thread Workspaces/1495991296924450977 - Seongsu nails and brows May 17.md` |
| 31 | `/Users/jincho/Documents/Obsidian Vault/Discord Thread Workspaces/1496317951521853520 - Myeongdong hair salon choice.md` |
| 36 | `/Users/jincho/Documents/Obsidian Vault/Discord Thread Workspaces/1495991042703626290 - Jamsil Gangdong headspa shortlist.md` |
| 27 | `/Users/jincho/Documents/Obsidian Vault/Discord Thread Workspaces/1494223923892719668 - Confirmed Korea bookings.md` |
| 30 | `/Users/jincho/Documents/Obsidian Vault/Discord Thread Workspaces/1496165881825333368 - Korean English translation apps for family meals.md` |
| 38 | `/Users/jincho/Documents/Obsidian Vault/Discord Thread Workspaces/1496530743197696041 - Korea return flight passport contingency.md` |
| 45 | `/Users/jincho/Documents/Obsidian Vault/Discord Thread Workspaces/1496526449778364477 - Seoul family friend meal windows.md` |
| 40 | `/Users/jincho/Documents/Obsidian Vault/Discord Thread Workspaces/1496340855613558915 - Korea app compare and Supabase scaffold.md` |
| 31 | `/Users/jincho/Documents/Obsidian Vault/Discord Thread Workspaces/1497731738632323153 - Korea IG intake to Step 1.md` |
| 46 | `/Users/jincho/Documents/Obsidian Vault/Discord Thread Workspaces/Discord Thread Workspaces Index.md` |
| 66 | `/Users/jincho/Documents/Obsidian Vault/01 - Korea Trip 2026/Korea Viral Saves Inbox.md` |
| 205 | `/Users/jincho/Documents/Obsidian Vault/01 - Korea Trip 2026/Jeju Proposal Trip Plan - 2026-05.md` |
| 93 | `/Users/jincho/Documents/Obsidian Vault/01 - Korea Trip 2026/Korea - Embassy + Hongdae Hair Plan.md` |
| 65 | `/Users/jincho/Documents/Obsidian Vault/01 - Korea Trip 2026/Hongdae Hair Salon Shortlist.md` |


## 9. Initial disagreements / risk observations

- `App.jsx` and `App.css` are both large enough to justify a stabilization/refactor plan, but the app currently builds/tests successfully.
- Existing docs describe the V2 plan, but live app reality has moved fast; Mission Control should be generated from live scans + append-only logs.
- Multiple branches/worktrees exist. They are useful but need explicit merge/archive decisions.
- Supabase scaffold exists, but the actual Korea workflow currently appears semi-sync/static with Discord/Drive/Sheet support.
- Mock HTML files are useful design artifacts but should be classified as experiments/garage, not active app architecture.

## 10. Recommended next action

Proceed to Mission Control foundation without deleting or refactoring app code yet:

1. Seed append-only logs.
2. Create generated Mission Control docs.
3. Mirror Mission Control summary to Obsidian.
4. Update Google Sheet Mission Control tabs.
5. Only then decide whether to split `App.jsx` / `App.css`.
