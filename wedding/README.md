# Three Celebrations

A single-page planner for the Hawaii photo trip, the Los Angeles wedding, and the Seoul wedding:
cost explorer, example budgets, master timeline, and a shared checklist.

## Run locally

```bash
npx serve wedding
```

Then open the URL it prints (usually http://localhost:3000). Any static server works; it is one HTML file.

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, import the repo and set **Root Directory** to `wedding`.
3. Framework preset: **Other**. No build command. Deploy.

## Sharing data between the two of you

On localhost or Vercel the planner saves in the browser only. Use **Export** to download a JSON file and
**Import** on the other device. Live shared editing needs a small backend (Supabase or Firebase); ask for that
when you want it.
