# Agent Session Bootstrap Protocol

This repo is operated by multiple AI agents (Hermes, Jin/OpenClaw, and possible subagents). Follow this before making project claims or edits.

## Trust hierarchy

1. **On-disk files first.** Repo files and Obsidian notes are ground truth.
2. **Session transcripts second.** Use prior sessions only when history is needed.
3. **Compaction summaries third.** Treat summaries as suggestions until cross-checked.
4. **Training knowledge last.** Never assume training knowledge describes this repo.

If a compaction summary contradicts on-disk files, on-disk files win. Flag the contradiction to Dr. Cho before acting.

## Startup checklist

1. Read `SOUL.md` and `USER.md` if present in the active agent environment.
2. Read `MEMORY.md` if this is a main session and it exists.
3. Read this repo's `docs/backbone.md`.
4. Read the last 20 non-heading lines of `docs/changelog.md`.
5. Read `docs/mission-control.md` or run `npm run mission-control` if stale.
6. Cross-check any compaction/session summary against the files above.
7. If contradiction exists, stop and ask/flag before changing code or backbone.

## Mission Control commands

```bash
npm run mission-control
npm run mission-control:serve
```

Local dashboard:

```text
http://127.0.0.1:8765/
```

## Reminder

Bootstrap takes ~30 seconds. Skipping it is how sessions wake up blind.
