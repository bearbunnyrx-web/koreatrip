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

## Deploy to Vercel (open it anywhere, shared saves)

1. Go to https://vercel.com/new and import `bearbunnyrx-web/koreatrip`.
2. Set **Root Directory** to `wedding`. Framework preset **Other**. Leave build settings empty. Deploy.
3. In the new project: **Storage → Create Database → Blob**. Connect it to the project. This gives the site a
   place to keep your shared saves.
4. Optional but recommended: **Settings → Environment Variables**, add `PLANNER_PASSWORD` with a word only the
   two of you know. Without it anyone with the link can save changes.
5. **Deployments → Redeploy** so the new settings take effect.

Make sure the deployed branch is `claude/la-wedding-planning-2028-kaiy58` (Settings → Git → Production Branch),
or merge that branch into `main` first.

## Sharing data between the two of you

On localhost or Vercel the planner saves in the browser only. Use **Export** to download a JSON file and
**Import** on the other device. Live shared editing needs a small backend (Supabase or Firebase); ask for that
when you want it.

## Home server on a Mac mini (shared saves, no cloud)

```bash
git clone -b claude/la-wedding-planning-2028-kaiy58 https://github.com/bearbunnyrx-web/koreatrip.git
cd koreatrip
node wedding/server.mjs
```

It prints two addresses. Use the "home network" one from any phone or laptop on the same Wi-Fi. Both of you
see the same saves, stored in `wedding/data/state.json`. Needs Node 18 or newer (`node -v` to check;
`brew install node` if missing). To keep it running after you close the terminal:

```bash
nohup node wedding/server.mjs > wedding/server.log 2>&1 &
```
