# Korea Trip App Architecture Map

**Seeded:** 2026-05-12 23:22

## Four-layer Project OS

```text
Command Layer      → Telegram decisions, Discord workspaces
Mission Control   → generated status dashboard + Google Sheet/Obsidian mirror
Backbone Layer     → repo docs + Obsidian shared memory
Execution Layer    → Git, Vercel, tests/builds, scripts
```

## Data/source-of-truth map

| Domain | User-facing | Backup / evidence | Intake | Agent memory |
|---|---|---|---|---|
| Itinerary | App Map/Calendar | Google Sheet Calendar Backup | Telegram/Discord requests | docs/backbone.md + Obsidian |
| Receipts | App Receipts tab | Drive folder + Google Sheet Receipts | Discord receipt thread | docs/backbone.md + Obsidian |
| Inspiration | App Inspiration tab | Discord/Obsidian notes as needed | Discord/shared links | Thread notes + backbone if promoted |
| Architecture | Mission Control summary | repo docs + Obsidian | Telegram decisions | append-only logs |

## Current technical stack

- React + Vite
- Vercel static deployment
- Kakao route API helper under `api/`
- Receipt ingest script under `scripts/`
- Supabase scaffold present, but not currently the dominant source of truth
