# Korea Trip Visual Redesign Plan

> **For Hermes:** keep the current planner product logic. Redesign the visual system, not the core workflow.

**Goal:** Re-skin the current Korea trip planner so it feels like the provided Seoul/Jeju spring beauty-travel reference while preserving the app's actual workflow: **Compare → Schedule → Itinerary**, with map-aware planning still central.

**Architecture:** Keep the current React/Vite information architecture and interaction model. Replace the visual language with a cohesive design system: softer editorial imagery, blush/cream surfaces, muted purple accent, consistent rounded cards, improved typography hierarchy, and calmer dark mode. Avoid turning the app into a guide-first tourism app.

**Tech Stack:** Vite, React, App.jsx, App.css, Vitest, Vercel.

---

## Product rule

This redesign must follow these rules:

1. **Do keep:** Compare, Schedule, Itinerary, map-driven planning, drag/drop, yes/no itinerary flow.
2. **Do not copy:** guide-first IA, destination-brochure home, decorative map markers, splash-screen-first behavior.
3. **Use the reference for:** color system, imagery style, card treatment, navigation polish, typography mood.
4. **Do not use the reference for:** primary navigation structure or task flow.

---

# Screen-by-screen redesign spec

## 1. Global design system

### Target feeling
- Seoul/Jeju spring poster
- romantic but still practical
- premium soft-travel aesthetic
- cleaner and more feminine than current state
- still readable as a planning tool, not a brochure

### Color system
Use six token families:

- `--bg-base`: warm blush off-white
- `--bg-elevated`: soft cream card surface
- `--bg-tint`: pale pink section tint
- `--accent-primary`: soft pink
- `--accent-secondary`: muted purple
- `--accent-support`: mint / peach support accents

### Suggested tokens
- `--bg-base: #fff6f8`
- `--bg-elevated: rgba(255, 250, 248, 0.94)`
- `--bg-tint: #ffdce6`
- `--accent-primary: #ffb6c1`
- `--accent-primary-strong: #ee8fa3`
- `--accent-secondary: #7d5ba6`
- `--accent-mint: #a8d5ba`
- `--accent-peach: #f7c59f`
- `--text-primary: #40363c`
- `--text-muted: #7b6f75`
- `--border-soft: rgba(64, 54, 60, 0.08)`

### Dark mode rules
Dark mode must be low-glare.

- Use charcoal plum / cocoa dark neutrals instead of flat black.
- Accent colors should be desaturated and darkened.
- Remove bright emoji-like icon emphasis.
- Active nav and action pills should not glow brighter than cards.
- Confirm/remove buttons should stay readable but less luminous.

### Radius and spacing system
- Primary cards: `24px–28px`
- Secondary cards: `18px–22px`
- Pills/chips/buttons: `999px`
- Screen padding: `16px mobile`, `24px+ desktop`
- Vertical spacing should feel airy and editorial, not dashboard-dense.

### Typography rules
- Keep body text clean and sans-serif.
- Use one expressive display style only for top-level Home headlines, not everywhere.
- Avoid script fonts in dense planner contexts.
- Emphasize hierarchy through scale and weight, not many font families.

---

## 2. Home redesign

### Keep
- search-led entry
- app flow explanation
- fast access to Compare / Schedule / Itinerary

### Change
Home should visually feel closest to the reference.

### New structure
1. Large scenic hero with Seoul/Jeju mood
2. Search field over or below hero
3. Two visual destination cards or one split card: Seoul / Jeju
4. Short workflow explainer cards:
   - Compare first
   - Schedule second
   - Itinerary last
5. Optional curated strip such as:
   - Seoul beauty clusters
   - Jeju healing day ideas

### Implementation rules
- Keep search as the main action.
- Do not replace Home with a destinations browser.
- Use the reference's image-led softness, but retain planner entry points.

---

## 3. Compare redesign

### Role
Compare is where users choose among contenders in the same theme.

### Visual direction
Use the reference's card polish, but adapt for comparison.

### New Compare card structure
Each board should include:
- board title
- one-line recommendation
- 1–2 spotlight cards
- cleaner comparison rows/cards
- less table heaviness on mobile

### Replace current dense feeling with
- visual spotlight cards at top
- option cards with:
  - image
  - name
  - area
  - 1-line verdict
  - 1–2 metadata pills
  - vote / shortlist action

### Important rule
Compare should feel like:
- elegant shortlisting
not:
- spreadsheet research dump

---

## 4. Schedule redesign

### Keep
- current left/right drag-and-drop sorting model
- unscheduled list
- day buckets
- simple job definition

### Change
Make it visually match the reference while keeping it ultra-simple.

### New styling
- left panel becomes soft card column
- day buckets become stacked rounded panels with calmer tinted backgrounds
- dragged cards should feel like pretty sortable place cards
- bucket headers should feel lighter and more editorial

### Add
- subtle drop-hover state
- destination thumbnail or category dot optionally on each draggable card
- clearer empty-state cards

### Do not add back
- maps
- logistics panels
- long text blocks
- link lists

---

## 5. Itinerary redesign

### Role
This is the final dated trip flow.

### Keep
- day chips
- yes/no candidate vs confirmed logic
- route/timeline ordering
- map connection

### Change visually
Borrow from the reference itinerary screen:
- cleaner day tabs
- more refined time column
- better vertical rhythm
- prettier stop cards
- stronger image/metadata hierarchy where useful

### New card language
For each itinerary stop:
- title
- short sublabel
- optional neighborhood/type chip
- softer state label
- cleaner action pills

### Tone
Less “control panel”, more “beautiful travel schedule”, while still being editable.

---

## 6. Map redesign

### Keep
- planning map behavior
- markers, route logic, selection
- bottom-sheet style detail pattern

### Change visually
- cleaner map shell
- softer overlay card
- stronger selected-state styling
- more premium sheet/card treatment

### Do not copy from the reference
- circular photo markers as the main marker language

### Instead
Use:
- simple marker states
- numbered itinerary markers
- selected sheet with image + place metadata
- softer blush/muted-purple accents around the map UI chrome

---

## 7. Navigation redesign

### Keep labels
- Home
- Compare
- Schedule
- Itinerary

### Styling target
Reference-like bottom nav polish:
- softer container
- more premium spacing
- quieter active state
- consistent icon/letter treatment

### Rule
Do not rename core tabs back into generic guide labels.

---

# Implementation phases

## Phase 1 — Global visual system
**Files:**
- Modify: `src/App.css`
- Verify: `src/App.jsx`
- Test: `src/test/App.test.jsx`

### Tasks
1. Replace root color tokens with the new blush/cream/purple system.
2. Normalize radius values across buttons, cards, panels, sheets.
3. Rework dark mode tokens for lower glare.
4. Standardize button, chip, and nav active states.
5. Keep all existing tests passing.

### Verify
- `npm test`
- `npm run build`
- check Home, Compare, Schedule, Itinerary in both light and dark modes.

---

## Phase 2 — Home visual redesign
**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.css`
- Test: `src/test/App.test.jsx`

### Tasks
1. Preserve search-first logic.
2. Add refined destination imagery treatment inspired by the reference.
3. Restyle the workflow explanation cards.
4. Keep the CTA structure intact.
5. Keep tests stable by preserving key text hooks unless intentionally changed with test updates.

### Verify
- Home still teaches `Compare → Schedule → Itinerary`
- search still works
- fast-entry buttons remain obvious

---

## Phase 3 — Compare redesign
**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.css`
- Test: `src/test/App.test.jsx`

### Tasks
1. Reduce visual density.
2. Introduce spotlight cards and prettier option cards.
3. Keep compare logic and voting logic intact.
4. Improve mobile readability before adding any new features.

### Verify
- board recommendation is easy to scan
- a shortlist feels obvious within 3 seconds
- mobile view does not feel table-heavy

---

## Phase 4 — Schedule reskin
**Files:**
- Modify: `src/App.css`
- Optional small JSX cleanup in `src/App.jsx`
- Test if accessibility labels change

### Tasks
1. Keep current structure.
2. Add visual hierarchy to unscheduled list and day buckets.
3. Add stronger hover/drop states.
4. Preserve drag/drop behavior exactly.

### Verify
- current drag/drop tests still pass
- schedule remains simpler than Compare and Itinerary

---

## Phase 5 — Itinerary reskin
**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.css`
- Test: `src/test/App.test.jsx`

### Tasks
1. Redesign day chips.
2. Refine timeline spacing and card look.
3. Soften yes/no controls visually.
4. Preserve map sync and reorder logic.

### Verify
- itinerary still reads as final trip plan
- no loss of functionality
- candidate/confirmed states remain obvious

---

## Phase 6 — Map shell polish
**Files:**
- Modify: `src/App.css`
- Optional `src/App.jsx` small structural tweaks
- Browser/manual verification

### Tasks
1. Restyle map container and legends.
2. Improve selected place card / map sheet appearance.
3. Keep marker semantics functional-first.

### Verify
- map still communicates planning state clearly
- visual polish improves without harming legibility

---

# Non-goals

Do **not** do these during the redesign pass:
- rebuild the app into Seoul Guide / Jeju Guide pages
- add a splash screen
- replace the planner with a destinations browser
- reintroduce Spend
- turn Schedule back into an information-heavy page
- use decorative image markers as primary map controls

---

# Acceptance criteria

The redesign is successful if:

1. The app immediately feels closer to the provided reference in mood and polish.
2. A new user can still understand the workflow in under 10 seconds.
3. Compare, Schedule, and Itinerary remain the core product story.
4. Schedule remains dead simple.
5. Itinerary still feels like the final day-by-day plan.
6. Dark mode is calmer, not brighter.
7. Tests and build remain green.

---

# Recommended next execution order

1. Phase 1 — global tokens and dark mode
2. Phase 2 — Home
3. Phase 3 — Compare
4. Phase 4 — Schedule
5. Phase 5 — Itinerary
6. Phase 6 — Map

---

# Immediate next task recommendation

Start with **Phase 1 + Phase 2 together**:
- global palette/radius/type cleanup
- Home redesign to establish the new visual language

That gives the app an immediate identity shift without risking core planner behavior.
