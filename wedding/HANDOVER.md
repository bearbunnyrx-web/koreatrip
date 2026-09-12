# Three Celebrations: local setup handover

This document is for a local AI agent (or a person) setting up the wedding planner on a Mac mini so it runs on
the home network. Follow the steps in order. Every step has a check. Do not edit any file in the `wedding`
folder; the app is one large HTML file and changes belong in the shared repository, not here.

## What you are setting up

- A one-file web app in `wedding/index.html`.
- A tiny server in `wedding/server.mjs` that serves that file and stores one shared save file at
  `wedding/data/state.json`. Both partners open the same address on the same Wi-Fi and see the same saves.
- No database, no build step, no npm install. Node.js 18 or newer is the only requirement.

## Facts you need

| Item | Value |
|---|---|
| Repository | `https://github.com/bearbunnyrx-web/koreatrip.git` |
| Branch | `claude/la-wedding-planning-2028-kaiy58` |
| Folder to run from | `koreatrip` (the repo root) |
| Start command | `node wedding/server.mjs` |
| Default port | `3000` (change with `PORT=3100 node wedding/server.mjs`) |
| Install location | `~/koreatrip` |

## Step 1: check Node

```bash
node -v
```

Check: prints `v18` or higher. If the command is missing or the version is lower, install Node:

```bash
brew install node
```

If Homebrew is missing, stop and report that Node must be installed first.

## Step 2: get the code

If `~/koreatrip` does not exist:

```bash
cd ~
git clone -b claude/la-wedding-planning-2028-kaiy58 https://github.com/bearbunnyrx-web/koreatrip.git
```

If it already exists:

```bash
cd ~/koreatrip
git fetch origin
git checkout claude/la-wedding-planning-2028-kaiy58
git pull
```

Check: `ls ~/koreatrip/wedding` lists `index.html`, `server.mjs`, `README.md`, `HANDOVER.md`.

If the clone asks for a username and password, the repository is private. Stop and ask the owner to clone it
once by hand, then continue from Step 3.

## Step 3: start the server once, by hand

```bash
cd ~/koreatrip
node wedding/server.mjs
```

Check: it prints two addresses, like

```
Three Celebrations running:
  this computer  http://localhost:3000
  home network   http://192.168.1.23:3000
```

Open the `localhost` address in a browser on the Mac mini. The page shows "Learn" and "Everything" tabs. Near
the Notes section at the bottom of Everything it says "Shared on the home server". Press Ctrl+C to stop the
server after this check.

If port 3000 is busy, run `PORT=3100 node wedding/server.mjs` and use 3100 everywhere below.

## Step 4: keep it running after reboots

Create a launchd job so macOS starts the server at login and restarts it if it crashes.

```bash
mkdir -p ~/Library/LaunchAgents ~/koreatrip/wedding/logs
cat > ~/Library/LaunchAgents/com.threecelebrations.server.plist <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.threecelebrations.server</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/sh</string>
    <string>-c</string>
    <string>cd "$HOME/koreatrip" &amp;&amp; exec "$(command -v node)" wedding/server.mjs</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>/Users/USERNAME/koreatrip/wedding/logs/server.log</string>
  <key>StandardErrorPath</key><string>/Users/USERNAME/koreatrip/wedding/logs/server.err</string>
</dict>
</plist>
EOF
sed -i '' "s|/Users/USERNAME|$HOME|g" ~/Library/LaunchAgents/com.threecelebrations.server.plist
launchctl unload ~/Library/LaunchAgents/com.threecelebrations.server.plist 2>/dev/null
launchctl load ~/Library/LaunchAgents/com.threecelebrations.server.plist
```

If `node` is not on the PATH that launchd uses, replace `"$(command -v node)"` in the plist with the full path
printed by `which node` (usually `/opt/homebrew/bin/node`), then unload and load again.

Check:

```bash
sleep 2
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
cat ~/koreatrip/wedding/logs/server.log
```

The first command prints `200`. The log shows the two addresses.

## Step 5: confirm it works from a phone

On a phone connected to the same Wi-Fi, open the "home network" address from the log, for example
`http://192.168.1.23:3000`. Type a name on the first screen and press Save. Reload on a second device. The
name is there.

If the phone cannot reach it: System Settings, Network, Firewall on the Mac mini. Allow incoming connections
for Node, or turn the firewall off for the test.

## Step 6: report back

Send the owner:

1. The home network address from the log.
2. Confirmation that Step 5 worked.
3. Anything that failed, with the exact error text.

## Updating later

When the owner says there is a new version:

```bash
cd ~/koreatrip
git pull
launchctl kickstart -k gui/$(id -u)/com.threecelebrations.server
```

Check: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/` prints `200`.

Saves live in `wedding/data/state.json`, which git ignores, so updates never erase them. To back up the plan,
copy that one file.

## Do not

- Do not edit `wedding/index.html`, `wedding/server.mjs`, or anything else in the repo. Report requested
  changes to the owner instead.
- Do not run `npm install`. Nothing needs installing for the local server. The `package.json` in the folder
  is for Vercel only.
- Do not delete `wedding/data`. That is the shared save.
- Do not expose the port to the internet. Home network only.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `EADDRINUSE` in the log | Port 3000 is taken | Set `PORT=3100` in the plist command and use 3100 |
| Page loads but says "Saved on this device" | The file was opened directly, not through the server | Use the `http://` address, not a `file://` path |
| Save says "Could not reach the server" | Server stopped | `launchctl kickstart -k gui/$(id -u)/com.threecelebrations.server` |
| Phone cannot connect | Firewall or different Wi-Fi | Allow Node in the firewall; confirm the phone is on the same network |
| Videos do not play | No internet on the Mac mini, or YouTube blocked | Check the Mac mini can open youtube.com in a browser |
| `git pull` fails with local changes | Someone edited a repo file | `git stash` then `git pull`, and report it |
