# Three Celebrations

A step-by-step onboarding for first-time wedding planners covering the Hawaii photo trip, the Southern California
wedding, and the Seoul wedding. Each lesson shows real YouTube videos and Instagram accounts, asks one choice, and
builds the budget. The Everything tab holds the full budget, timeline, checklist, vendors, and notes.

Videos play inline on localhost and Vercel. On the shared Claude page they open on YouTube in a new tab.

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
