// Three Celebrations local server. No dependencies. Run: node wedding/server.mjs
// Serves the site and keeps one shared state file so both partners see the same saves on the home network.
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { networkInterfaces } from 'node:os';

const root = dirname(fileURLToPath(import.meta.url));
const dataDir = join(root, 'data');
const stateFile = join(dataDir, 'state.json');
const port = Number(process.env.PORT || 3000);
const types = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.md': 'text/plain; charset=utf-8' };

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/state') {
    if (req.method === 'GET') {
      if (!existsSync(stateFile)) { res.writeHead(404); return res.end('{}'); }
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(await readFile(stateFile));
    }
    if (req.method === 'PUT') {
      let body = '';
      for await (const chunk of req) body += chunk;
      try { JSON.parse(body); } catch { res.writeHead(400); return res.end('bad json'); }
      await mkdir(dataDir, { recursive: true });
      await writeFile(stateFile, body);
      res.writeHead(200); return res.end('ok');
    }
  }
  const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  try {
    const buf = await readFile(join(root, file));
    res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
    res.end(buf);
  } catch { res.writeHead(404); res.end('not found'); }
});

server.listen(port, '0.0.0.0', () => {
  const lan = Object.values(networkInterfaces()).flat().find(i => i && i.family === 'IPv4' && !i.internal);
  console.log(`Three Celebrations running:\n  this computer  http://localhost:${port}\n  home network   http://${lan ? lan.address : '<your-ip>'}:${port}\nShared saves are stored in wedding/data/state.json`);
});
