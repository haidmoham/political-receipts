// Download unchanged public-domain portraits for an offline extension bundle.
// Run: node scripts/data-portraits.mjs [--offline]
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'data', 'portraits');
const manifestPath = path.join(root, 'data', 'portraits.json');
const roster = JSON.parse(await fs.readFile(path.join(root, 'data', 'politicians.json'), 'utf8')).politicians;
await fs.mkdir(dir, { recursive: true });
const offline = process.argv.includes('--offline');
const prior = await fs.readFile(manifestPath, 'utf8').then(JSON.parse).catch(() => null);
if (offline && !prior) throw new Error('No portrait manifest to verify offline');
const priority = ['C001098', 'O000172', 'S000033', 'W000817', 'S001184', 'C001075'];
const queue = [...roster].sort((a, b) => {
  const order = id => priority.includes(id) ? priority.indexOf(id) : priority.length;
  return order(a.id) - order(b.id);
});
const records = [];
function dimensions(bytes) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error('Response is not a JPEG');
  let offset = 2;
  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) throw new Error('Invalid JPEG marker');
    while (bytes[offset] === 0xff) offset++;
    const marker = bytes[offset++];
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    const length = bytes.readUInt16BE(offset);
    if (length < 2 || offset + length > bytes.length) throw new Error('Invalid JPEG segment');
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { height: bytes.readUInt16BE(offset + 3), width: bytes.readUInt16BE(offset + 5) };
    }
    offset += length;
  }
  throw new Error('JPEG dimensions unavailable');
}
async function worker() {
  while (queue.length) {
    const p = queue.shift();
    if (!/^[A-Z]\d{6}$/.test(p.id)) throw new Error(`Invalid bioguide ID: ${p.id}`);
    const sourceUrl = `https://unitedstates.github.io/images/congress/225x275/${p.id}.jpg`;
    const localPath = `data/portraits/${p.id}.jpg`;
    try {
      let bytes;
      if (offline) {
        const record = prior.portraits.find(r => r.id === p.id);
        if (!record) throw new Error(`No manifest record for ${p.id}`);
        if (record.status !== 'available') { records.push(record); continue; }
        bytes = await fs.readFile(path.join(root, localPath));
        const sha = createHash('sha256').update(bytes).digest('hex');
        if (sha !== record.sha256) throw new Error(`Hash mismatch for ${p.id}`);
      } else {
        const response = await fetch(sourceUrl, { signal: AbortSignal.timeout(20000) });
        if (!response.ok) {
          if (response.status === 404) {
            records.push({ id: p.id, status: 'missing', path: null, sourceUrl, reason: 'Source returned HTTP 404.' });
            continue;
          }
          throw new Error(`HTTP ${response.status}`);
        }
        bytes = Buffer.from(await response.arrayBuffer());
      }
      const size = dimensions(bytes);
      // The endpoint fits some source portraits inside the requested dimensions.
      if (size.width < 100 || size.width > 225 || size.height < 100 || size.height > 275) throw new Error(`Unexpected dimensions: ${size.width}x${size.height}`);
      if (!offline) await fs.writeFile(path.join(root, localPath), bytes);
      records.push({ id: p.id, status: 'available', path: localPath, sourceUrl,
        sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length, ...size });
    } catch (error) {
      if (offline) throw error;
      records.push({ id: p.id, status: 'missing', path: null, sourceUrl, reason: String(error.message) });
    }
    if (records.length % 100 === 0) console.log(`Processed ${records.length}/${roster.length} portraits`);
  }
}
const settled = await Promise.allSettled(Array.from({ length: 6 }, worker));
for (const result of settled) if (result.status === 'rejected') throw result.reason;
records.sort((a, b) => a.id.localeCompare(b.id));
const counts = { available: records.filter(r => r.status === 'available').length, missing: records.filter(r => r.status !== 'available').length };
if (!offline) await fs.writeFile(manifestPath, JSON.stringify({ schemaVersion: 1, meta: {
  retrievedAt: new Date().toISOString(), counts,
  source: 'unitedstates/images', sourceUrl: 'https://github.com/unitedstates/images',
  rights: 'Public-domain congressional portraits, per source repository; contributions under CC0-1.0.',
  licenseUrl: 'https://github.com/unitedstates/images/blob/gh-pages/LICENSE',
  rightsEvidenceUrl: 'https://github.com/propublica/sunlight-congress/issues/432',
  transform: 'None. JPEG bytes preserved from the source 225x275 endpoint.',
  privacy: 'Bundled local files. Do not fetch remote portraits while a user reads a page.',
}, portraits: records }, null, 2) + '\n');
console.log(JSON.stringify({ ...counts, totalBytes: records.reduce((n, r) => n + (r.bytes ?? 0), 0), missingIds: records.filter(r => r.status !== 'available').map(r => r.id) }));
