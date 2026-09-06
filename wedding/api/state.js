// Shared planner state on Vercel, stored in Vercel Blob.
// Setup: in the Vercel project, Storage → Create → Blob. That adds BLOB_READ_WRITE_TOKEN automatically.
// Optional: set PLANNER_PASSWORD in Environment Variables so only the two of you can save.
import { put, list } from '@vercel/blob';

const NAME = 'three-celebrations/state.json';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ error: 'Blob storage is not set up yet. In Vercel: Storage → Create → Blob, then redeploy.' });
  }
  const pw = process.env.PLANNER_PASSWORD;
  if (req.method === 'GET') {
    const { blobs } = await list({ prefix: NAME, limit: 1 });
    if (!blobs.length) return res.status(404).json({});
    const r = await fetch(blobs[0].url + '?t=' + Date.now(), { cache: 'no-store' });
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(await r.text());
  }
  if (req.method === 'PUT') {
    if (pw && req.headers['x-planner-password'] !== pw) return res.status(401).json({ error: 'wrong password' });
    let body = req.body;
    if (typeof body !== 'string') body = JSON.stringify(body);
    try { JSON.parse(body); } catch { return res.status(400).json({ error: 'bad json' }); }
    await put(NAME, body, { access: 'public', addRandomSuffix: false, contentType: 'application/json', cacheControlMaxAge: 0 });
    return res.status(200).json({ ok: true });
  }
  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).end();
}
