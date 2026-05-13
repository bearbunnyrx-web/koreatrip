#!/usr/bin/env python3
"""Localhost-only Mission Control dashboard.

This intentionally serves only on 127.0.0.1 by default so internal project
architecture is not exposed in the public Korea trip app or on Vercel.
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
from datetime import datetime
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, quote, urlparse

REPO = Path(__file__).resolve().parents[1]
DATA_PATH = REPO / "docs/mission-control.json"
GENERATOR = REPO / "scripts/regenerate_mission_control.py"
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8765


def run(cmd: list[str]) -> tuple[int, str]:
    proc = subprocess.run(cmd, cwd=REPO, text=True, capture_output=True, timeout=180)
    return proc.returncode, (proc.stdout + proc.stderr).strip()


def ensure_data() -> None:
    if not DATA_PATH.exists():
        run([sys.executable, str(GENERATOR)])


def load_data() -> dict:
    ensure_data()
    return json.loads(DATA_PATH.read_text())


def freshness_label(generated: str) -> tuple[str, str]:
    try:
        naive = " ".join(generated.split()[:2])
        dt = datetime.strptime(naive, "%Y-%m-%d %H:%M")
        age_hours = max(0, (datetime.now() - dt).total_seconds() / 3600)
        if age_hours > 72:
            return "STALE", f"{age_hours:.0f}h old — regenerate"
        return "FRESH", f"{age_hours:.0f}h old"
    except Exception:
        return "UNKNOWN", generated


def rel_time(ts: str) -> str:
    try:
        dt = datetime.strptime(ts[:16], "%Y-%m-%d %H:%M")
        hours = max(0, int((datetime.now() - dt).total_seconds() // 3600))
        if hours < 1:
            return "just now"
        if hours < 24:
            return f"{hours}h ago"
        return f"{hours // 24}d ago"
    except Exception:
        return ts


def esc(value) -> str:
    return str(value).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def pill(text: str, tone: str = "slate") -> str:
    return f'<span class="pill {tone}">{esc(text)}</span>'


def table(headers, rows):
    out = '<table><thead><tr>' + ''.join(f'<th>{esc(h)}</th>' for h in headers) + '</tr></thead><tbody>'
    for row in rows:
        out += '<tr>' + ''.join(f'<td>{cell}</td>' for cell in row) + '</tr>'
    return out + '</tbody></table>'


def render_architecture(data: dict) -> str:
    arch = data.get("architecture_map", {})
    pages = arch.get("pages", [])
    syncs = arch.get("sync_directions", [])
    backends = arch.get("backends", [])
    components = arch.get("components", [])
    page_cards = ''.join(
        f'<div class="mini-card"><b>{esc(p["name"])}</b>{pill(p.get("status",""), "green" if p.get("status") == "production" else "yellow")}<div class="mini">{esc(p.get("purpose",""))}</div><code>{esc(p.get("route",""))}</code></div>'
        for p in pages
    )
    flow_rows = [[esc(s.get("from", "")), "→", esc(s.get("to", "")), pill(s.get("status", ""), "green"), esc(s.get("kind", ""))] for s in syncs]
    backend_rows = [[f'<code>{esc(b.get("name",""))}</code>', pill(b.get("status", ""), "green" if b.get("status") == "active" else "yellow"), esc(b.get("purpose", ""))] for b in backends]
    comp_rows = [[esc(c.get("name", "")), f'<code>{esc(c.get("file", ""))}</code>', esc(len(c.get("used_by", []))), pill(c.get("status", ""), "slate")] for c in components[:40]]
    return f"""
    <div class="card"><h2>Architecture Map</h2><div class="pad">
      <div class="page-strip">{page_cards}</div>
      <h3>Data / sync flow</h3>{table(['From','','To','Status','Kind'], flow_rows)}
      <h3>Backends</h3>{table(['Backend','Status','Purpose'], backend_rows or [['None detected','','']])}
      <details><summary>Components ({len(components)})</summary>{table(['Name','File','Used by count','Status'], comp_rows)}</details>
    </div></div>"""


def render(data: dict, notice: str = "") -> str:
    health = data["health"]
    fresh_state, fresh_text = freshness_label(data["generated"])
    health_tone = {"green": "green", "yellow": "yellow", "red": "red"}.get(health["rating"], "slate")
    fresh_tone = "green" if fresh_state == "FRESH" else "yellow"
    largest = data.get("largest_files", [])[:12]
    workstreams = data.get("workstreams", [])
    cleanup = data.get("cleanup_queue", [])
    substrate = data.get("substrate", {})
    rows = data.get("substrate_rows", {})
    markers = data.get("legacy_markers", [])[:25]
    git = data.get("git", {})
    canonical = data.get("canonical", {})
    nc = data.get("next_checkpoint", {})
    garage = data.get("garage_index", {}).get("items", [])
    previews = data.get("previews", {}).get("previews", [])

    work_table = table(["Workstream", "Status", "Risk", "Decision"], [[esc(w["name"]), pill(w["status"], "blue"), pill(w["risk"], "yellow" if "medium" in w["risk"] else "green"), esc(w["decision"])] for w in workstreams])
    clean_table = table(["Item", "Type", "Why", "Action"], [[f'<code>{esc(c["item"])}</code>', esc(c["type"]), esc(c["why"]), esc(c["action"])] for c in cleanup])
    file_table = table(["Path", "Lines", "State", "Why"], [[f'<code>{esc(f["path"])}</code>', esc(f["lines"]), pill(f["state"], "purple" if f["state"] != "active" else "slate"), esc(f["why"])] for f in largest])
    garage_table = table(["Item", "Kind", "Size", "Referenced", "Action"], [[f'<code>{esc(g["path"])}</code>', esc(g.get("kind", "")), esc(g.get("size_kb", "")) + ' KB', pill('yes' if g.get('still_referenced') else 'no', 'red' if g.get('still_referenced') else 'green'), pill('review' if g.get('still_referenced') else 'safe-to-delete candidate', 'yellow' if g.get('still_referenced') else 'green')] for g in garage] or [["No garage items", "", "", "", ""]])
    preview_table = table(["URL", "Branch", "Purpose", "Owner", "Status"], [[f'<a href="{esc(p.get("url", ""))}">{esc(p.get("url", ""))[:48]}</a>', esc(p.get("branch", "")), esc(p.get("purpose", "")), esc(p.get("owner", "")), pill(p.get("status", ""), "yellow")] for p in previews] or [["No active previews detected", "", "", "", pill("empty", "green")]])
    decision_lines = rows.get("decisions", [])[-10:][::-1]
    decisions_html = ''.join(f'<details class="decision"><summary><b>{esc(rel_time(d["timestamp"]))}</b> — {esc(d["text"])}</summary><code>{esc(d["raw"])}</code></details>' for d in decision_lines)
    log_html = ""
    for label, key, tone in [("Change", "changelog", "blue"), ("Decision", "decisions", "green"), ("Cleanup", "cleanup", "yellow"), ("Checkpoint", "checkpoints", "purple")]:
        log_html += f'<div class="log-block"><h3>{label}</h3>'
        for line in substrate.get(key, [])[-5:]:
            log_html += f'<div class="log-line"><span class="dot {tone}"></span>{esc(line)}</div>'
        log_html += '</div>'
    markers_html = ''.join(f'<li><code>{esc(m)}</code></li>' for m in markers) or '<li>No markers found.</li>'

    return f"""<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>BearBunny Mission Control</title><style>
:root{{--bg:#f4f6f8;--paper:#fff;--ink:#17212b;--muted:#667085;--line:#d9dee7;--green:#147a35;--yellow:#a86600;--red:#b42318;--blue:#2563eb;--purple:#6941c6;}}*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",Arial,sans-serif;color:var(--ink)}}.top{{position:sticky;top:0;z-index:10;background:linear-gradient(135deg,#101828,#1d2939 58%,#253e68);color:#fff;padding:18px 22px;box-shadow:0 10px 30px rgba(16,24,40,.18)}}.top-row{{display:flex;gap:14px;align-items:center}}.logo{{width:42px;height:42px;border-radius:13px;background:#fff;color:#101828;font-weight:900;display:flex;align-items:center;justify-content:center}}h1{{margin:0;font-size:22px;letter-spacing:-.02em}}.sub{{color:#cbd5e1;font-size:13px;margin-top:4px}}.actions{{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}}button,a.btn{{border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.12);color:#fff;border-radius:999px;padding:8px 12px;text-decoration:none;font-weight:700;cursor:pointer}}.wrap{{max-width:1500px;margin:18px auto;padding:0 18px}}.grid{{display:grid;grid-template-columns:310px 1fr 360px;gap:16px}}.card{{background:var(--paper);border:1px solid var(--line);border-radius:16px;box-shadow:0 8px 26px rgba(16,24,40,.06);overflow:hidden;margin-bottom:16px}}.card h2{{margin:0;padding:13px 15px;background:#f8fafc;border-bottom:1px solid #edf0f5;font-size:14px}}.pad{{padding:14px 15px}}.cards{{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:16px}}.metric{{background:#fff;border:1px solid var(--line);border-radius:16px;padding:15px;min-height:112px}}.metric .label{{font-size:12px;color:var(--muted);margin-bottom:8px}}.metric .value{{font-size:25px;font-weight:900;letter-spacing:-.04em}}.note,.mini{{font-size:12px;color:var(--muted);line-height:1.35;margin-top:8px}}.kv{{display:grid;grid-template-columns:104px 1fr;gap:8px;font-size:12px}}.kv .k{{color:var(--muted)}}.kv .v{{font-weight:700;overflow:hidden;text-overflow:ellipsis}}code{{font-family:"SF Mono",Menlo,monospace;font-size:11px;background:#f1f5f9;border-radius:5px;padding:1px 4px}}.pill{{display:inline-flex;border-radius:999px;padding:4px 8px;font-size:11px;font-weight:900;white-space:nowrap}}.green{{background:#e9f7ee;color:var(--green)}}.yellow{{background:#fff4d6;color:var(--yellow)}}.red{{background:#ffeceb;color:var(--red)}}.blue{{background:#eaf1ff;color:#174ea6}}.purple{{background:#f2eaff;color:var(--purple)}}.slate{{background:#eef2f7;color:#344054}}table{{width:100%;border-collapse:separate;border-spacing:0;font-size:12px;border:1px solid var(--line);border-radius:12px;overflow:hidden}}th{{text-align:left;background:#eff4fb;color:#344054;text-transform:uppercase;letter-spacing:.04em;font-size:11px;padding:10px}}td{{border-top:1px solid #eef1f5;padding:10px;vertical-align:top}}.notice{{background:#ecfdf3;border:1px solid #bbf7d0;color:#166534;border-radius:12px;padding:10px 12px;margin-bottom:14px;font-size:13px}}.pre{{white-space:pre-wrap;font-family:"SF Mono",Menlo,monospace;font-size:11px;line-height:1.45;background:#0f172a;color:#dbeafe;padding:12px;border-radius:12px;max-height:230px;overflow:auto}}.log-line{{font-size:12px;line-height:1.4;padding:7px 0;border-bottom:1px solid #eef1f5}}.dot{{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:7px}}.dot.green{{background:var(--green)}}.dot.yellow{{background:#eab308}}.dot.blue{{background:var(--blue)}}.dot.purple{{background:var(--purple)}}ul{{margin:0;padding-left:18px}}li{{font-size:12px;margin:7px 0;color:#475467}}.footer{{text-align:center;color:#667085;font-size:12px;padding:24px}}.page-strip{{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px}}.mini-card{{border:1px solid var(--line);border-radius:12px;padding:10px;background:#fbfcff}}details{{margin:8px 0}}summary{{cursor:pointer;font-weight:800}}.decision{{border-bottom:1px solid #eef1f5;padding:8px 0}}@media(max-width:1150px){{.grid{{grid-template-columns:1fr}}.cards{{grid-template-columns:1fr 1fr}}.page-strip{{grid-template-columns:1fr 1fr}}.actions{{margin-left:0}}.top-row{{align-items:flex-start;flex-wrap:wrap}}}}@media(max-width:640px){{.cards,.page-strip{{grid-template-columns:1fr}}}}
</style></head><body>
<header class="top"><div class="top-row"><div class="logo">BB</div><div><h1>BearBunny Mission Control — Korea Trip App</h1><div class="sub">Localhost-only dashboard · generated from repo logs + live scans · not part of public Vercel app</div></div><form class="actions" method="post" action="/regenerate"><button type="submit">Regenerate</button><a class="btn" href="/data.json">JSON</a><a class="btn" href="/decisions">Decisions</a><a class="btn" href="/">Refresh</a></form></div></header>
<div class="wrap">{f'<div class="notice">{esc(notice)}</div>' if notice else ''}
<div class="cards"><div class="metric"><div class="label">Health</div><div class="value">{esc(health['rating']).upper()}</div>{pill('risk points '+str(health['risk_points']), health_tone)}<div class="note">Actionable architecture debt, not panic.</div></div><div class="metric"><div class="label">Freshness</div><div class="value">{fresh_state}</div>{pill(fresh_text, fresh_tone)}<div class="note">Warn at >72h old.</div></div><div class="metric"><div class="label">Next Checkpoint</div><div class="value">{esc(nc.get('label',''))}</div>{pill(nc.get('trigger',''), 'red' if nc.get('due_now') else 'yellow')}<div class="note">{esc(str(nc.get('changes_since_last',0)))} slices since last.</div></div><div class="metric"><div class="label">Largest files</div><div class="value">{health['app_css_lines']}</div>{pill('App.css lines', 'yellow')}<div class="note">App.jsx: {health['app_js_lines']} lines.</div></div><div class="metric"><div class="label">Execution surfaces</div><div class="value">{health['worktree_count']}</div>{pill('worktrees open', 'yellow' if health['worktree_count']>1 else 'green')}<div class="note">Merge/archive decision still needed.</div></div></div>
<div class="grid"><aside><div class="card"><h2>Canonical Truth</h2><div class="pad kv"><div class="k">App</div><div class="v"><a href="{esc(canonical.get('app_url',''))}">{esc(canonical.get('app_url',''))}</a></div><div class="k">Vercel</div><div class="v"><code>{esc(canonical.get('vercel_project',''))}</code></div><div class="k">Repo</div><div class="v"><code>{esc(canonical.get('repo',''))}</code></div><div class="k">Sheet</div><div class="v"><code>{esc(canonical.get('backup_sheet_id',''))}</code></div><div class="k">Receipts</div><div class="v"><code>{esc(canonical.get('receipt_thread_id',''))}</code></div></div></div><div class="card"><h2>Why this rating</h2><div class="pad"><ul>{''.join(f'<li>{esc(r)}</li>' for r in health.get('reasons', []))}</ul></div></div><div class="card"><h2>Request Gate</h2><div class="pad"><p>{pill('Patch','green')} direct edit</p><p>{pill('Feature','blue')} plan + tests</p><p>{pill('Experiment','purple')} preview only</p><p>{pill('Architecture','red')} checkpoint first</p></div></div><div class="card"><h2>Recent Decisions</h2><div class="pad">{decisions_html}<p class="note"><a href="/decisions">View all decisions →</a></p></div></div></aside><main><div class="card"><h2>Active Workstreams</h2><div class="pad">{work_table}</div></div>{render_architecture(data)}<div class="card"><h2>Cleanup Queue</h2><div class="pad">{clean_table}</div></div><div class="card"><h2>Garage</h2><div class="pad"><p>{pill('Garage: '+str(len(garage))+' items','yellow')} {pill(str(sum(1 for g in garage if not g.get('still_referenced')))+' ready to review','green')}</p>{garage_table}</div></div><div class="card"><h2>Preview Deployments</h2><div class="pad">{preview_table}</div></div><div class="card"><h2>Largest Files / Code Health</h2><div class="pad">{file_table}</div></div></main><aside><div class="card"><h2>Substrate Logs</h2><div class="pad">{log_html}</div></div><div class="card"><h2>Git Status</h2><div class="pad"><div class="pre">{esc(git.get('status',''))}</div></div></div><div class="card"><h2>Markers</h2><div class="pad"><ul>{markers_html}</ul></div></div></aside></div></div><div class="footer">Run locally with <code>npm run mission-control:serve</code>. This dashboard binds to 127.0.0.1 only by default.</div></body></html>"""


class Handler(BaseHTTPRequestHandler):
    def send_html(self, html: str, status: HTTPStatus = HTTPStatus.OK) -> None:
        body = html.encode("utf-8")
        self.send_response(status); self.send_header("Content-Type", "text/html; charset=utf-8"); self.send_header("Content-Length", str(len(body))); self.end_headers(); self.wfile.write(body)

    def send_json(self, data: dict) -> None:
        body = json.dumps(data, indent=2, ensure_ascii=False).encode("utf-8")
        self.send_response(HTTPStatus.OK); self.send_header("Content-Type", "application/json; charset=utf-8"); self.send_header("Content-Length", str(len(body))); self.end_headers(); self.wfile.write(body)

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path == "/data.json": self.send_json(load_data()); return
        if parsed.path == "/decisions":
            data = load_data(); lines = data.get("substrate_rows", {}).get("decisions", [])
            html = "<h1>Decisions</h1><p><a href='/'>← Back</a></p>" + "".join(f"<p><code>{esc(row['raw'])}</code></p>" for row in lines)
            self.send_html("<!doctype html><meta charset='utf-8'><body style='font-family:-apple-system;padding:24px'>" + html + "</body>"); return
        if parsed.path not in {"/", "/index.html"}: self.send_error(HTTPStatus.NOT_FOUND); return
        notice = parse_qs(parsed.query).get("notice", [""])[0]
        self.send_html(render(load_data(), notice=notice))

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path != "/regenerate": self.send_error(HTTPStatus.NOT_FOUND); return
        code, out = run([sys.executable, str(GENERATOR)])
        notice = "Mission Control regenerated." if code == 0 else f"Regeneration failed: {out[:300]}"
        self.send_response(HTTPStatus.SEE_OTHER); self.send_header("Location", "/?notice=" + quote(notice)); self.end_headers()

    def log_message(self, fmt: str, *args) -> None:
        sys.stderr.write("[mission-control] " + fmt % args + "\n")


def main() -> None:
    host = os.environ.get("MISSION_CONTROL_HOST", DEFAULT_HOST)
    port = int(os.environ.get("MISSION_CONTROL_PORT", DEFAULT_PORT))
    ensure_data()
    server = ThreadingHTTPServer((host, port), Handler)
    print(f"Mission Control serving at http://{host}:{port}")
    print("Press Ctrl+C to stop.")
    try: server.serve_forever()
    except KeyboardInterrupt: print("\nStopping Mission Control.")


if __name__ == "__main__":
    main()
