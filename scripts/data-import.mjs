// Build the bundled snapshot from public sources. No API key is required.
// Run: node scripts/data-import.mjs [--offline]
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateRawSync } from 'node:zlib';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'data');
const cycle = 2026;
const urls = {
  legislators: 'https://raw.githubusercontent.com/unitedstates/congress-legislators/gh-pages/legislators-current.json',
  fec: 'https://www.fec.gov/files/bulk-downloads/2026/weball26.zip',
  dictionary: 'https://www.fec.gov/campaign-finance-data/all-candidates-file-description/',
};
await fs.mkdir(dir, { recursive: true });
const offline = process.argv.includes('--offline');
if (!offline) {
  for (const [url, filename] of [[urls.legislators, 'legislators-current.json'], [urls.fec, 'weball26.zip']]) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download failed: ${response.status} ${url}`);
    await fs.writeFile(path.join(dir, filename), Buffer.from(await response.arrayBuffer()));
  }
  await fs.writeFile(path.join(dir, 'retrieval.json'), JSON.stringify({ retrievedAt: new Date().toISOString() }, null, 2) + '\n');
}
const { retrievedAt } = JSON.parse(await fs.readFile(path.join(dir, 'retrieval.json'), 'utf8'));
const snapshotDate = retrievedAt.slice(0, 10);
const rosterBytes = await fs.readFile(path.join(dir, 'legislators-current.json'));
const zip = await fs.readFile(path.join(dir, 'weball26.zip'));
// Locate the central directory. Use its sizes because ZIP entries can use data descriptors.
let eocd = -1;
for (let i = zip.length - 22; i >= Math.max(0, zip.length - 65557); i--) {
  if (zip.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
}
if (eocd < 0) throw new Error('Invalid FEC ZIP');
let entry = zip.readUInt32LE(eocd + 16);
let csv;
for (let n = 0; n < zip.readUInt16LE(eocd + 10); n++) {
  if (zip.readUInt32LE(entry) !== 0x02014b50) throw new Error('Invalid central directory');
  const nameLength = zip.readUInt16LE(entry + 28);
  const name = zip.subarray(entry + 46, entry + 46 + nameLength).toString();
  if (name === 'weball26.txt') {
    const offset = zip.readUInt32LE(entry + 42);
    const start = offset + 30 + zip.readUInt16LE(offset + 26) + zip.readUInt16LE(offset + 28);
    const compressed = zip.subarray(start, start + zip.readUInt32LE(entry + 20));
    const method = zip.readUInt16LE(entry + 10);
    if (![0, 8].includes(method)) throw new Error('Unsupported ZIP compression');
    csv = (method === 8 ? inflateRawSync(compressed) : compressed).toString('utf8');
  }
  entry += 46 + nameLength + zip.readUInt16LE(entry + 30) + zip.readUInt16LE(entry + 32);
}
if (!csv) throw new Error('FEC ZIP has no expected data file');
const rows = new Map();
for (const line of csv.trim().split(/\r?\n/)) {
  const row = line.split('|');
  if (row.length !== 30 || rows.has(row[0])) throw new Error(`Invalid or duplicate FEC record ${row[0]}`);
  rows.set(row[0], row);
}
function amount(row, index) {
  if (!row || row[index] === '') return null;
  if (!/^-?\d+(\.\d{1,2})?$/.test(row[index])) throw new Error(`Invalid amount ${row[0]}:${index}`);
  return Number(row[index]);
}
function coverage(row) {
  if (!row?.[27]) return null;
  const match = row[27].match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) throw new Error(`Invalid date ${row[0]}`);
  const date = `${match[3]}-${match[1]}-${match[2]}`;
  if (date > snapshotDate || date < '2025-01-01') throw new Error(`Coverage outside snapshot period: ${date}`);
  return date;
}
const politicians = JSON.parse(rosterBytes).filter(p => {
  const term = p.terms.at(-1);
  return term.start <= snapshotDate && term.end > snapshotDate;
}).map(p => {
  const term = p.terms.at(-1);
  const prefix = term.type === 'sen' ? 'S' : 'H';
  const fecIds = p.id.fec ?? [];
  const eligible = fecIds.filter(id => id.startsWith(prefix) && rows.has(id) && rows.get(id)[18] === term.state);
  // Never combine multiple candidate IDs or choose by fundraising size.
  const fecId = eligible.length === 1 ? eligible[0] : (fecIds.filter(id => id.startsWith(prefix)).length === 1 ? fecIds.find(id => id.startsWith(prefix)) : null);
  const row = eligible.length === 1 ? rows.get(fecId) : null;
  const name = p.name.nickname ? `${p.name.nickname} ${p.name.last}` : p.name.official_full ?? `${p.name.first} ${p.name.last}`;
  const aliases = [...new Set([name, p.name.official_full, `${p.name.first} ${p.name.last}`, p.name.middle ? `${p.name.first} ${p.name.middle} ${p.name.last}` : null].filter(Boolean))];
  return {
    id: p.id.bioguide, name, aliases, party: term.party, state: term.state,
    chamber: term.type === 'sen' ? 'Senate' : 'House', district: term.district ?? null,
    fecIds, fecId, sourceUrl: fecId ? `https://www.fec.gov/data/candidate/${fecId}/?cycle=${cycle}` : 'https://www.fec.gov/data/candidates/',
    finance: {
      status: row ? 'available' : 'unavailable',
      unavailableReason: row ? null : eligible.length > 1 ? 'Multiple current-office FEC IDs; no automatic selection.' : 'No matching current-office FEC summary in this snapshot.',
      coverageStart: '2025-01-01', coverageEnd: coverage(row),
      receipts: amount(row, 5), individualContributions: amount(row, 17),
      otherCommitteeContributions: amount(row, 25), partyCommitteeContributions: amount(row, 26),
      cashOnHand: amount(row, 10), transfersFromAuthorized: amount(row, 6), transfersToAuthorized: amount(row, 8),
      corporateContributions: null,
    },
  };
}).sort((a, b) => a.name.localeCompare(b.name, 'en'));
if (new Set(politicians.map(p => p.id)).size !== politicians.length) throw new Error('Duplicate bioguide IDs');
const hash = b => createHash('sha256').update(b).digest('hex');
const result = {
  schemaVersion: 1,
  meta: {
    cycle, cycleStart: '2025-01-01', retrievedAt,
    sources: [
      { name: 'FEC all candidates file', url: urls.fec, dictionaryUrl: urls.dictionary, sha256: hash(zip) },
      { name: 'unitedstates/congress-legislators', url: urls.legislators, license: 'CC0-1.0', sha256: hash(rosterBytes) },
    ],
    counts: { politicians: politicians.length, financeAvailable: politicians.filter(p => p.finance.status === 'available').length },
    limitations: [
      'This is a bundled snapshot, not live data. Coverage end dates differ by candidate.',
      'The community roster may lag departures or special elections. Current means listed with an active term in that roster at retrieval.',
      'Receipts include more than donations. They are campaign totals, not personal income.',
      'Other political committee contributions are not a measure of corporate contributions.',
      'The FEC summary can double-count transfers between authorized committees. Raw reported totals are preserved; transfer fields are provided.',
      'Corporate-only totals, donor rankings, stock trades, outside spending, and integrity grades are not supplied.',
      'Null means unavailable. It does not mean zero. Name matches alone do not prove identity.',
    ],
  },
  politicians,
};
await fs.writeFile(path.join(dir, 'politicians.json'), JSON.stringify(result, null, 2) + '\n');
const dates = politicians.filter(p => p.finance.status === 'available').map(p => p.finance.coverageEnd);
const frequency = dates.reduce((all, date) => (all[date] = (all[date] ?? 0) + 1, all), {});
const commonEnd = Object.keys(frequency).sort((a, b) => frequency[b] - frequency[a] || b.localeCompare(a))[0];
const comparable = politicians.filter(p => p.finance.coverageEnd === commonEnd && ['Democrat', 'Republican'].includes(p.party));
const groups = [];
for (const chamber of ['House', 'Senate']) for (const party of ['Democrat', 'Republican']) {
  const cohort = comparable.filter(p => p.chamber === chamber && p.party === party);
  const values = cohort.map(p => p.finance.otherCommitteeContributions).filter(v => v !== null).sort((a, b) => a - b);
  const cents = values.reduce((total, value) => total + Math.round(value * 100), 0);
  groups.push({ chamber, party, memberCount: cohort.length, metricAvailableCount: values.length,
    totalOtherCommitteeContributions: cents / 100,
    meanOtherCommitteeContributions: values.length ? Math.round(cents / values.length) / 100 : null,
    medianOtherCommitteeContributions: values.length ? (values[Math.floor((values.length - 1) / 2)] + values[Math.floor(values.length / 2)]) / 2 : null,
    politicianIds: cohort.map(p => p.id),
  });
}
await fs.writeFile(path.join(dir, 'party-comparison.json'), JSON.stringify({ schemaVersion: 1, retrievedAt,
  metric: 'Contributions from other political committees', sourceField: 'OTHER_POL_CMTE_CONTRIB',
  coverageStart: '2025-01-01', coverageEnd: commonEnd,
  population: 'Snapshot roster members with FEC summaries ending on the most common coverage date; grouped separately by chamber and roster party.',
  limitations: ['This is a selected subset, not all party candidates or all members.', 'Different group sizes make totals unsuitable as a per-member comparison. Means and medians describe only these cohorts.', 'The metric includes multiple committee types. It does not measure lobbyist or corporate money.', 'This descriptive comparison cannot establish corruption, influence, or causation.'],
  groups,
}, null, 2) + '\n');
console.log(JSON.stringify(result.meta.counts));
