#!/usr/bin/env python3
"""Regenerate BearBunny Mission Control for the Korea trip app.

Derived artifacts are generated from live repo signals and append-only substrate
logs. Do not hand-edit generated Mission Control outputs; edit/append the
substrate logs and supporting substrate files instead.
"""
from __future__ import annotations

import json
import os
import re
import subprocess
from datetime import datetime, timedelta
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
GENERATED_FILES = {
    "docs/mission-control.md",
    "docs/mission-control.json",
    "docs/architecture-map.json",
    "docs/garage-index.json",
    "docs/previews.json",
}
TEXT_SUFFIXES = {".js", ".jsx", ".css", ".json", ".md", ".html", ".mjs", ".sql", ".txt", ".svg", ".yaml", ".yml"}
PAGE_KEYS = [("map", "Map"), ("calendar", "Calendar"), ("inspiration", "Inspiration"), ("receipts", "Receipts")]


def run(cmd: str, timeout: int = 120) -> tuple[int, str]:
    proc = subprocess.run(cmd, cwd=REPO, shell=True, text=True, capture_output=True, timeout=timeout)
    return proc.returncode, (proc.stdout + proc.stderr).strip()


def now_display() -> str:
    return datetime.now().astimezone().strftime("%Y-%m-%d %H:%M %Z")


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def read_tail(path: Path, max_lines: int = 12) -> list[str]:
    if not path.exists():
        return []
    lines = path.read_text(errors="ignore").splitlines()
    return [line for line in lines if line and not line.startswith("#")][-max_lines:]


def read_substrate(path: Path) -> list[dict]:
    rows = []
    if not path.exists():
        return rows
    for idx, line in enumerate(path.read_text(errors="ignore").splitlines(), start=1):
        if not line.strip() or line.startswith("#") or line.startswith("Append-only"):
            continue
        parts = [part.strip() for part in line.split("|", 3)]
        if len(parts) == 4 and re.match(r"\d{4}-\d{2}-\d{2}", parts[0]):
            rows.append({"line": idx, "timestamp": parts[0], "type": parts[1], "text": parts[2], "sha": parts[3], "raw": line})
    return rows


def count_lines(path: Path) -> int:
    try:
        return sum(1 for _ in path.open(errors="ignore"))
    except Exception:
        return 0


def iter_text_files() -> list[Path]:
    paths = []
    for root, dirs, files in os.walk(REPO):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for name in files:
            path = Path(root) / name
            if path.suffix.lower() in TEXT_SUFFIXES:
                paths.append(path)
    return paths


def scan_files() -> list[dict]:
    rows = []
    for path in iter_text_files():
        rel = path.relative_to(REPO).as_posix()
        lines = count_lines(path)
        state = "active"
        why = "Current repo file"
        if rel in GENERATED_FILES:
            state = "docs/generated"
            why = "Generated Mission Control artifact"
        elif rel.startswith("src/components/") and any(token in rel for token in ["BookingsTab", "HomeTab", "ItineraryTab", "PlacesTab"]):
            state = "possible legacy"
            why = "Old V1-style tab component; verify imports before garage/archive"
        elif rel.endswith(".html") and rel != "index.html":
            state = "experiment/mock"
            why = "Standalone mockup, not production runtime"
        elif rel.startswith("supabase/"):
            state = "scaffold/unclear"
            why = "Supabase scaffold exists; current model appears semi-sync/static"
        elif rel.startswith("docs/"):
            state = "docs"
            why = "Documentation/backbone/planning surface"
        rows.append({"path": rel, "lines": lines, "state": state, "why": why})
    return sorted(rows, key=lambda r: (-r["lines"], r["path"]))


def scan_legacy_markers(files: list[dict]) -> list[str]:
    markers = []
    pattern = re.compile(r"TODO|FIXME|deprecated|orphan|legacy|Mission Control|mission control", re.I)
    for row in files:
        if row["path"] in GENERATED_FILES:
            continue
        path = REPO / row["path"]
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
        {"name": "Korea Mission Control foundation", "status": "active", "scope": "docs/, scripts/, Obsidian mirror, localhost dashboard", "risk": "medium", "decision": "Approved by Dr. Cho for execution"},
        {"name": "Receipt dashboard / receipt inbox", "status": "production-ish", "scope": "public/receipts-inbox.json, src receipt UI/pipeline", "risk": "low-medium", "decision": "Keep; use Mission Control before major sync changes"},
        {"name": "Branch/worktree hygiene", "status": "needs decision", "scope": "compare-strong-copy-experiment, receipt-date-dashboard, main, /private/tmp/korea-receipts-worktree", "risk": "medium", "decision": "Review after Mission Control foundation"},
    ]


def health(files: list[dict], git_status: str) -> dict:
    app_js = next((f for f in files if f["path"] == "src/App.jsx"), {"lines": 0})["lines"]
    app_css = next((f for f in files if f["path"] == "src/App.css"), {"lines": 0})["lines"]
    _, worktree_out = run("git worktree list")
    worktree_count = len([line for line in worktree_out.splitlines() if line.strip()])
    risk_points = 0
    reasons = []
    if app_js > 2500:
        risk_points += 2; reasons.append(f"src/App.jsx is large ({app_js} lines)")
    if app_css > 3000:
        risk_points += 2; reasons.append(f"src/App.css is large ({app_css} lines)")
    if worktree_count > 1:
        risk_points += 1; reasons.append(f"{worktree_count} git worktrees open")
    if "??" in git_status or " M " in git_status or "M " in git_status:
        risk_points += 1; reasons.append("working tree has uncommitted/untracked changes")
    rating = "green" if risk_points < 3 else "yellow"
    if risk_points >= 8:
        rating = "red"
    return {"rating": rating, "risk_points": risk_points, "reasons": reasons, "app_js_lines": app_js, "app_css_lines": app_css, "worktree_count": worktree_count, "test_status": "not run by generator", "build_status": "not run by generator"}


def parse_timestamp(value: str) -> datetime | None:
    try:
        return datetime.strptime(value[:16], "%Y-%m-%d %H:%M")
    except Exception:
        return None


def compute_next_checkpoint(changelog: list[dict], checkpoints: list[dict], health_data: dict) -> dict:
    last_cp = checkpoints[-1] if checkpoints else None
    last_dt = parse_timestamp(last_cp["timestamp"]) if last_cp else None
    now = datetime.now()
    changes_since = 0
    if last_dt:
        for row in changelog:
            ts = parse_timestamp(row["timestamp"])
            if ts and ts > last_dt:
                changes_since += 1
        due_at = last_dt + timedelta(days=7)
    else:
        due_at = now
        changes_since = len(changelog)
    triggers = []
    if changes_since >= 15:
        triggers.append(f"{changes_since} changelog entries since last checkpoint")
    if health_data["rating"] == "red":
        triggers.append("health rating is red")
    if "uncommitted" in " ".join(health_data["reasons"]).lower():
        triggers.append("working tree has uncommitted changes")
    if due_at <= now:
        triggers.append("7-day checkpoint window elapsed")
    due_now = bool(triggers)
    delta_days = max(0, (due_at - now).days)
    return {"due_now": due_now, "label": "DUE NOW" if due_now else f"in {delta_days} days", "due_at": due_at.isoformat(timespec="minutes"), "changes_since_last": changes_since, "trigger": "; ".join(triggers) if triggers else "7-day trigger fires first"}


def parse_sync_directions() -> list[dict]:
    path = REPO / "docs/sync-directions.yaml"
    rows = []
    if not path.exists():
        return rows
    for line in path.read_text(errors="ignore").splitlines():
        if not line.startswith("|") or line.startswith("|---") or "from" in line[:12].lower():
            continue
        parts = [p.strip() for p in line.strip("|").split("|")]
        if len(parts) >= 5:
            rows.append({"from": parts[0], "to": parts[1], "kind": parts[2], "frequency": parts[3], "status": parts[4]})
    return rows


def reverse_reference_index(files: list[dict]) -> dict[str, list[str]]:
    index = {}
    text_files = [REPO / f["path"] for f in files if f["path"] not in GENERATED_FILES and not f["path"].startswith("docs/garage/")]
    cache = []
    for path in text_files:
        try:
            cache.append((path.relative_to(REPO).as_posix(), path.read_text(errors="ignore")))
        except Exception:
            pass
    for f in files:
        name = Path(f["path"]).name
        refs = []
        for rel, text in cache:
            if rel == f["path"]:
                continue
            if name in text or f["path"] in text:
                refs.append(rel)
        index[f["path"]] = refs[:20]
    return index


def generate_architecture_map(files: list[dict], refs: dict[str, list[str]]) -> dict:
    app_text = (REPO / "src/App.jsx").read_text(errors="ignore") if (REPO / "src/App.jsx").exists() else ""
    pages = []
    for key, name in PAGE_KEYS:
        status = "production" if key in app_text else "unknown"
        consumers = []
        if name in ["Map", "Calendar"]:
            consumers = ["itineraryDays", "mapTargets", "tripStateStore"]
        elif name == "Receipts":
            consumers = ["public/receipts-inbox.json", "receiptPipeline"]
        elif name == "Inspiration":
            consumers = ["researchBoards", "Instagram embed URLs"]
        pages.append({"name": name, "route": f"tab:{key}", "purpose": {"Map":"spatial itinerary and place drawer", "Calendar":"day timeline", "Inspiration":"saved reels and ideas", "Receipts":"bookings, receipts, spend"}[name], "components": ["App.jsx"], "data_sources": consumers, "status": status})
    components = []
    for row in files:
        if row["path"].startswith("src/") and row["path"].endswith((".jsx", ".js")):
            components.append({"name": Path(row["path"]).stem, "file": row["path"], "used_by": refs.get(row["path"], []), "status": row["state"]})
    data_sources = []
    for row in files:
        if row["path"].startswith("src/data/") or row["path"].startswith("public/") and row["path"].endswith(".json"):
            data_sources.append({"name": Path(row["path"]).name, "file": row["path"], "kind": "static", "consumers": refs.get(row["path"], []), "writers": [], "backup": f"Google Sheet {BACKUP_SHEET_ID}"})
    backends = []
    for row in files:
        if row["path"].startswith(("src/lib/", "api/", "supabase/")):
            txt = (REPO / row["path"]).read_text(errors="ignore")
            if "supabase" in txt.lower() or "fetch(" in txt or row["path"].startswith(("api/", "supabase/")):
                backends.append({"name": row["path"], "status": "scaffolded" if "supabase" in row["path"] else "active", "purpose": "backend/helper integration", "endpoints": re.findall(r"['\"](/api/[^'\"]+|https?://[^'\"]+)", txt)[:10]})
    storage = [{"name": "localStorage tripStateStore", "kind": "browser", "purpose": "session persistence", "leak_risk": "tests must clear"}]
    return {"generated_at": now_iso(), "pages": pages, "components": components, "data_sources": data_sources, "backends": backends, "storage": storage, "sync_directions": parse_sync_directions()}


def generate_garage_index(files: list[dict], refs: dict[str, list[str]]) -> dict:
    root = REPO / "docs/garage"
    items = []
    if root.exists():
        for path in root.rglob("*"):
            if path.is_file():
                rel = path.relative_to(REPO).as_posix()
                refs_for = refs.get(rel, [])
                items.append({"path": rel, "moved_at": path.stat().st_mtime, "kind": path.suffix.lstrip(".") or "file", "size_kb": round(path.stat().st_size / 1024, 1), "still_referenced": bool(refs_for), "still_referenced_by": refs_for})
    return {"generated_at": now_iso(), "items": sorted(items, key=lambda x: x["moved_at"])}


def generate_previews() -> dict:
    previews = []
    code, out = run(f"script -q /dev/null vercel ls {VERCEL_PROJECT} 2>&1 | head -80", timeout=120)
    # `vercel ls ... | head` may return a nonzero SIGPIPE-style code even when
    # useful output was produced, so parse whenever deployment output is present.
    if "Deployments for" in out or "https://" in out:
        for line in out.splitlines():
            if "Preview" in line and "https://" in line:
                url = re.search(r"https://\S+", line)
                age = line.split()[0] if line.split() else ""
                previews.append({"url": url.group(0) if url else "", "branch": "unknown", "purpose": "preview deployment", "owner": "unknown", "created_at": age, "age_days": None, "status": "pending-review", "merge_decision": None, "delete_recommendation": None})
    ok = bool(previews) or code == 0
    return {"generated_at": now_iso(), "previews": previews[:20], "source": "vercel cli" if ok else "unavailable", "error": "" if ok else out[:500]}


def generate() -> dict:
    generated = now_display()
    _, git_status = run("git status --short --branch")
    _, branches = run("git branch --all --sort=-committerdate | head -40")
    _, worktree_out = run("git worktree list")
    _, git_log = run("git log --oneline --decorate --all --max-count=15")
    _, vercel_project = run("python3 -m json.tool .vercel/project.json 2>/dev/null || true")
    files = scan_files()
    refs = reverse_reference_index(files)
    markers = scan_legacy_markers(files)
    h = health(files, git_status)
    substrate_rows = {"changelog": read_substrate(REPO / "docs/changelog.md"), "decisions": read_substrate(REPO / "docs/decisions.md"), "cleanup": read_substrate(REPO / "docs/cleanup-log.md"), "checkpoints": read_substrate(REPO / "docs/checkpoint-log.md")}
    substrate_tail = {key: [row["raw"] for row in rows[-12:]] for key, rows in substrate_rows.items()}
    next_checkpoint = compute_next_checkpoint(substrate_rows["changelog"], substrate_rows["checkpoints"], h)
    architecture_map = generate_architecture_map(files, refs)
    garage_index = generate_garage_index(files, refs)
    previews = generate_previews()
    data = {"generated": generated, "project": PROJECT, "canonical": {"app_url": APP_URL, "vercel_project": VERCEL_PROJECT, "repo": str(REPO), "backup_sheet_id": BACKUP_SHEET_ID, "receipts_drive_id": RECEIPTS_DRIVE_ID, "receipt_thread_id": RECEIPT_THREAD_ID}, "git": {"status": git_status, "branches": branches, "worktrees": worktree_out, "recent_log": git_log, "vercel_project_json": vercel_project}, "health": h, "next_checkpoint": next_checkpoint, "workstreams": workstreams(), "largest_files": files[:20], "legacy_markers": markers, "substrate": substrate_tail, "substrate_rows": substrate_rows, "architecture_map": architecture_map, "garage_index": garage_index, "previews": previews, "cleanup_queue": [{"item": "src/App.jsx", "type": "large file", "why": "Data + UI + helpers combined", "action": "Split after Phase 0 / Mission Control foundation"}, {"item": "src/App.css", "type": "large file", "why": "Accumulated iterative styles", "action": "Split by feature after app structure stabilizes"}, {"item": "old V1 tab components", "type": "possible legacy", "why": "V2 app uses Map/Calendar/Inspiration/Receipts", "action": "Verify imports, then garage/archive if unused"}, {"item": "mock HTML files", "type": "experiments", "why": "Design artifacts, not runtime", "action": "Move to dated garage after accepted"}, {"item": "branch/worktree state", "type": "execution hygiene", "why": "Multiple surfaces open", "action": "Decide merge/archive policy"}]}
    return data


def md_table(rows: list[dict], keys: list[str]) -> str:
    out = "| " + " | ".join(keys) + " |\n" + "|" + "---|" * len(keys) + "\n"
    for row in rows:
        out += "| " + " | ".join(str(row.get(k, "")).replace("\n", "<br>") for k in keys) + " |\n"
    return out


def render_markdown(data: dict) -> str:
    h = data["health"]
    arch = data["architecture_map"]
    garage = data["garage_index"]
    previews = data["previews"]
    nc = data["next_checkpoint"]
    md = f"""# BearBunny Mission Control — Korea Trip App

**Generated:** {data['generated']}  
**Freshness:** Fresh  
**Health:** {h['rating'].upper()} / risk points {h['risk_points']}  
**Next Checkpoint:** {nc['label']} — {nc['trigger']}  
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
| Garage items | {len(garage['items'])} |
| Active previews | {len(previews['previews'])} |

### Why this health rating

"""
    md += "\n".join(f"- {r}" for r in h["reasons"]) if h["reasons"] else "- No major risk signals detected by generator."
    md += "\n\n---\n\n## Architecture Map\n\n### Pages\n\n" + md_table(arch["pages"], ["name", "route", "purpose", "status"])
    md += "\n### Data sources\n\n" + md_table(arch["data_sources"], ["name", "file", "kind", "backup"])
    md += "\n### Backends\n\n" + md_table(arch["backends"], ["name", "status", "purpose"])
    md += "\n### Sync directions\n\n" + md_table(arch["sync_directions"], ["from", "to", "kind", "frequency", "status"])
    md += "\n---\n\n## Active workstreams\n\n" + md_table(data["workstreams"], ["name", "status", "risk", "scope", "decision"])
    md += "\n---\n\n## Cleanup queue\n\n" + md_table(data["cleanup_queue"], ["item", "type", "why", "action"])
    md += "\n---\n\n## Garage\n\n" + md_table(garage["items"], ["path", "kind", "size_kb", "still_referenced"])
    md += "\n---\n\n## Preview deployments\n\n" + md_table(previews["previews"], ["url", "branch", "purpose", "owner", "status"])
    md += "\n---\n\n## Recent decisions\n\n"
    for row in data["substrate_rows"]["decisions"][-10:][::-1]:
        md += f"- **{row['timestamp']}** — {row['text']} (`{row['sha']}`)\n"
    md += "\n---\n\n## Largest files\n\n" + md_table(data["largest_files"], ["path", "lines", "state", "why"])
    md += f"\n---\n\n## Git status\n\n```text\n{data['git']['status']}\n```\n\n## Worktrees\n\n```text\n{data['git']['worktrees']}\n```\n"
    md += "\n---\n\n## Substrate logs — recent entries\n\n"
    for key in ["changelog", "decisions", "cleanup", "checkpoints"]:
        md += f"### {key.title()}\n"
        for line in data["substrate"].get(key, []):
            md += f"- {line}\n"
    return md


def main() -> None:
    data = generate()
    (REPO / "docs").mkdir(exist_ok=True)
    (REPO / "docs/mission-control.json").write_text(json.dumps(data, indent=2, ensure_ascii=False))
    (REPO / "docs/architecture-map.json").write_text(json.dumps(data["architecture_map"], indent=2, ensure_ascii=False))
    (REPO / "docs/garage-index.json").write_text(json.dumps(data["garage_index"], indent=2, ensure_ascii=False))
    (REPO / "docs/previews.json").write_text(json.dumps(data["previews"], indent=2, ensure_ascii=False))
    markdown = render_markdown(data)
    (REPO / "docs/mission-control.md").write_text(markdown)
    OBSIDIAN_MIRROR.parent.mkdir(parents=True, exist_ok=True)
    OBSIDIAN_MIRROR.write_text(markdown + "\n\n---\n\nGenerated mirror from repo `docs/mission-control.md`. Do not hand-edit.\n")
    print(f"Generated docs/mission-control.md and Obsidian mirror: {OBSIDIAN_MIRROR}")


if __name__ == "__main__":
    main()
