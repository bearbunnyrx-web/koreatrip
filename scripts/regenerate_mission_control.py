#!/usr/bin/env python3
"""Regenerate BearBunny Mission Control for the Korea trip app.

This script intentionally generates derived artifacts from live repo signals and
append-only substrate logs. Do not hand-edit generated Mission Control outputs;
edit/append the substrate logs instead.
"""
from __future__ import annotations

import json
import os
import re
import subprocess
from datetime import datetime
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
VAULT = Path(os.environ.get("OBSIDIAN_VAULT_PATH", str(Path.home() / "Documents/Obsidian Vault")))
OBSIDIAN_MIRROR = VAULT / "01 - Korea Trip 2026" / "Korea Trip App - Mission Control.md"
PROJECT = "Korea Trip App"
APP_URL = "https://koreatrip.vercel.app"
VERCEL_PROJECT = "koreatrip"
BACKUP_SHEET_ID = "1cTlLzGWmfXODVSq1iDIUJPo0YfTSb7eZKC8w4q8bskY"
RECEIPTS_DRIVE_ID = "1LpqlmrVIZW8aWQdyqqrkAMlqdFilaMbG"
RECEIPT_THREAD_ID = "1503846727273283787"

SKIP_DIRS = {".git", "node_modules", "dist", ".vercel", "coverage", "__pycache__"}
GENERATED_FILES = {"docs/mission-control.md", "docs/mission-control.json"}
TEXT_SUFFIXES = {".js", ".jsx", ".css", ".json", ".md", ".html", ".mjs", ".sql", ".txt", ".svg"}


def run(cmd: str, timeout: int = 120) -> tuple[int, str]:
    proc = subprocess.run(cmd, cwd=REPO, shell=True, text=True, capture_output=True, timeout=timeout)
    out = (proc.stdout + proc.stderr).strip()
    return proc.returncode, out


def read_tail(path: Path, max_lines: int = 12) -> list[str]:
    if not path.exists():
        return []
    lines = path.read_text(errors="ignore").splitlines()
    return [line for line in lines if line and not line.startswith("#")][-max_lines:]


def count_lines(path: Path) -> int:
    try:
        return sum(1 for _ in path.open(errors="ignore"))
    except Exception:
        return 0


def scan_files() -> list[dict]:
    rows = []
    for root, dirs, files in os.walk(REPO):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for name in files:
            path = Path(root) / name
            rel = path.relative_to(REPO).as_posix()
            if path.suffix.lower() not in TEXT_SUFFIXES:
                continue
            lines = count_lines(path)
            state = "active"
            why = "Current repo file"
            if rel.startswith("src/components/") and any(token in rel for token in ["BookingsTab", "HomeTab", "ItineraryTab", "PlacesTab"]):
                state = "possible legacy"
                why = "Old V1-style tab component; verify imports before garage/archive"
            elif rel.endswith(".html") and rel != "index.html":
                state = "experiment/mock"
                why = "Standalone mockup, not production runtime"
            elif rel.startswith("supabase/"):
                state = "scaffold/unclear"
                why = "Supabase scaffold exists; current model appears semi-sync/static"
            elif rel.startswith("docs/"):
                state = "docs/generated-or-substrate" if rel in {"docs/mission-control.md", "docs/mission-control.json"} else "docs"
                why = "Documentation/backbone/planning surface"
            rows.append({"path": rel, "lines": lines, "state": state, "why": why})
    return sorted(rows, key=lambda r: (-r["lines"], r["path"]))


def scan_legacy_markers() -> list[str]:
    markers = []
    pattern = re.compile(r"TODO|FIXME|deprecated|orphan|legacy|Mission Control|mission control", re.I)
    for row in scan_files():
        if row["path"] in GENERATED_FILES:
            continue
        path = REPO / row["path"]
        if "node_modules" in row["path"] or row["path"].startswith("dist/"):
            continue
        try:
            for idx, line in enumerate(path.read_text(errors="ignore").splitlines(), start=1):
                if pattern.search(line):
                    markers.append(f"{row['path']}:{idx}: {line.strip()[:180]}")
                    if len(markers) >= 80:
                        return markers
        except Exception:
            pass
    return markers


def workstreams() -> list[dict]:
    return [
        {
            "name": "Korea Mission Control foundation",
            "status": "active",
            "scope": "docs/, scripts/regenerate_mission_control.py, Obsidian mirror, Google Sheet tabs",
            "risk": "medium",
            "decision": "Approved by Dr. Cho for execution",
        },
        {
            "name": "Receipt dashboard / receipt inbox",
            "status": "production-ish",
            "scope": "public/receipts-inbox.json, src receipt UI/pipeline",
            "risk": "low-medium",
            "decision": "Keep; use Mission Control before major sync changes",
        },
        {
            "name": "Branch/worktree hygiene",
            "status": "needs decision",
            "scope": "compare-strong-copy-experiment, receipt-date-dashboard, main, /private/tmp/korea-receipts-worktree",
            "risk": "medium",
            "decision": "Review after Mission Control foundation",
        },
    ]


def health(files: list[dict], git_status: str, test_status: str | None = None, build_status: str | None = None) -> dict:
    app_js = next((f for f in files if f["path"] == "src/App.jsx"), {"lines": 0})["lines"]
    app_css = next((f for f in files if f["path"] == "src/App.css"), {"lines": 0})["lines"]
    worktree_code, worktree_out = run("git worktree list")
    branch_count = len([line for line in worktree_out.splitlines() if line.strip()])
    risk_points = 0
    reasons = []
    if app_js > 2500:
        risk_points += 2
        reasons.append(f"src/App.jsx is large ({app_js} lines)")
    if app_css > 3000:
        risk_points += 2
        reasons.append(f"src/App.css is large ({app_css} lines)")
    if branch_count > 1:
        risk_points += 1
        reasons.append(f"{branch_count} git worktrees open")
    if "??" in git_status or " M " in git_status or "M " in git_status:
        risk_points += 1
        reasons.append("working tree has uncommitted/untracked changes")
    rating = "green"
    if risk_points >= 3:
        rating = "yellow"
    # Red is reserved for broken builds/tests, production ambiguity, or severe drift.
    # Large files + open worktrees alone should remain yellow: actionable, not panic.
    if risk_points >= 8:
        rating = "red"
    return {
        "rating": rating,
        "risk_points": risk_points,
        "reasons": reasons,
        "app_js_lines": app_js,
        "app_css_lines": app_css,
        "worktree_count": branch_count,
        "test_status": test_status or "not run by generator",
        "build_status": build_status or "not run by generator",
    }


def generate() -> dict:
    generated = datetime.now().astimezone().strftime("%Y-%m-%d %H:%M %Z")
    git_code, git_status = run("git status --short --branch")
    _, branches = run("git branch --all --sort=-committerdate | head -40")
    _, worktree_out = run("git worktree list")
    _, git_log = run("git log --oneline --decorate --all --max-count=15")
    _, vercel_project = run("python3 -m json.tool .vercel/project.json 2>/dev/null || true")
    files = scan_files()
    markers = scan_legacy_markers()
    h = health(files, git_status)
    substrate = {
        "changelog": read_tail(REPO / "docs/changelog.md"),
        "decisions": read_tail(REPO / "docs/decisions.md"),
        "cleanup": read_tail(REPO / "docs/cleanup-log.md"),
        "checkpoints": read_tail(REPO / "docs/checkpoint-log.md"),
    }
    data = {
        "generated": generated,
        "project": PROJECT,
        "canonical": {
            "app_url": APP_URL,
            "vercel_project": VERCEL_PROJECT,
            "repo": str(REPO),
            "backup_sheet_id": BACKUP_SHEET_ID,
            "receipts_drive_id": RECEIPTS_DRIVE_ID,
            "receipt_thread_id": RECEIPT_THREAD_ID,
        },
        "git": {
            "status": git_status,
            "branches": branches,
            "worktrees": worktree_out,
            "recent_log": git_log,
            "vercel_project_json": vercel_project,
        },
        "health": h,
        "workstreams": workstreams(),
        "largest_files": files[:20],
        "legacy_markers": markers,
        "substrate": substrate,
        "cleanup_queue": [
            {"item": "src/App.jsx", "type": "large file", "why": "Data + UI + helpers combined", "action": "Split after Phase 0 / Mission Control foundation"},
            {"item": "src/App.css", "type": "large file", "why": "Accumulated iterative styles", "action": "Split by feature after app structure stabilizes"},
            {"item": "old V1 tab components", "type": "possible legacy", "why": "V2 app uses Map/Calendar/Inspiration/Receipts", "action": "Verify imports, then garage/archive if unused"},
            {"item": "mock HTML files", "type": "experiments", "why": "Design artifacts, not runtime", "action": "Move to dated garage after accepted"},
            {"item": "branch/worktree state", "type": "execution hygiene", "why": "Multiple surfaces open", "action": "Decide merge/archive policy"},
        ],
    }
    return data


def md_table(rows: list[dict], keys: list[str]) -> str:
    out = "| " + " | ".join(keys) + " |\n"
    out += "|" + "---|" * len(keys) + "\n"
    for row in rows:
        out += "| " + " | ".join(str(row.get(k, "")).replace("\n", "<br>") for k in keys) + " |\n"
    return out


def render_markdown(data: dict) -> str:
    h = data["health"]
    rating = h["rating"].upper()
    stale_note = "Fresh"  # if an external scheduler reads generated timestamp, it can compute staleness
    md = f"""# BearBunny Mission Control — Korea Trip App

**Generated:** {data['generated']}  
**Freshness:** {stale_note}  
**Health:** {rating} / risk points {h['risk_points']}  
**Do not hand-edit:** regenerate with `npm run mission-control` or `python3 scripts/regenerate_mission_control.py`.

---

## Executive overview

| Metric | Value |
|---|---|
| Canonical app | {data['canonical']['app_url']} |
| Vercel project | `{data['canonical']['vercel_project']}` |
| Repo | `{data['canonical']['repo']}` |
| Backup Sheet | `{data['canonical']['backup_sheet_id']}` |
| Receipts Drive | `{data['canonical']['receipts_drive_id']}` |
| Receipt thread | `{data['canonical']['receipt_thread_id']}` |
| App.jsx lines | {h['app_js_lines']} |
| App.css lines | {h['app_css_lines']} |
| Worktrees open | {h['worktree_count']} |

### Why this health rating

"""
    if h["reasons"]:
        md += "\n".join(f"- {r}" for r in h["reasons"]) + "\n"
    else:
        md += "- No major risk signals detected by generator.\n"
    md += """
---

## Active workstreams

""" + md_table(data["workstreams"], ["name", "status", "risk", "scope", "decision"])
    md += """
---

## Cleanup queue

""" + md_table(data["cleanup_queue"], ["item", "type", "why", "action"])
    md += """
---

## Largest files

""" + md_table(data["largest_files"], ["path", "lines", "state", "why"])
    md += f"""
---

## Git status

```text
{data['git']['status']}
```

## Worktrees

```text
{data['git']['worktrees']}
```

## Branches

```text
{data['git']['branches']}
```

## Recent commits

```text
{data['git']['recent_log']}
```

---

## Legacy / TODO / Mission Control markers

"""
    if data["legacy_markers"]:
        md += "\n".join(f"- `{m}`" for m in data["legacy_markers"][:60]) + "\n"
    else:
        md += "No markers found.\n"
    md += """
---

## Substrate logs — recent entries

### Changelog
"""
    for line in data["substrate"]["changelog"]:
        md += f"- {line}\n"
    md += "\n### Decisions\n"
    for line in data["substrate"]["decisions"]:
        md += f"- {line}\n"
    md += "\n### Cleanup\n"
    for line in data["substrate"]["cleanup"]:
        md += f"- {line}\n"
    md += "\n### Checkpoints\n"
    for line in data["substrate"]["checkpoints"]:
        md += f"- {line}\n"
    md += """
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
"""
    return md


def main() -> None:
    data = generate()
    (REPO / "docs").mkdir(exist_ok=True)
    (REPO / "docs/mission-control.json").write_text(json.dumps(data, indent=2, ensure_ascii=False))
    markdown = render_markdown(data)
    (REPO / "docs/mission-control.md").write_text(markdown)
    OBSIDIAN_MIRROR.parent.mkdir(parents=True, exist_ok=True)
    OBSIDIAN_MIRROR.write_text(markdown + "\n\n---\n\nGenerated mirror from repo `docs/mission-control.md`. Do not hand-edit.\n")
    print(f"Generated docs/mission-control.md and Obsidian mirror: {OBSIDIAN_MIRROR}")


if __name__ == "__main__":
    main()
