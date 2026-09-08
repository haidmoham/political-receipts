// Build conservative same-race FEC candidate comparisons. No ballot status is inferred.
// node scripts/data-races.mjs [--candidate-master PATH_TO_CN26_ZIP]
// node scripts/data-races.mjs --offline  (validate the saved snapshot)
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateRawSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'data/races.json');
const people = JSON.parse(await fs.readFile(path.join(root, 'data/politicians.json'), 'utf8'));
function validate(data) {
  assert.equal(data.races.length, people.politicians.length);
  assert.equal(new Set(data.races.map(r => r.memberId)).size, data.races.length);
  for (const race of data.races) {
    const person = people.politicians.find(p => p.id === race.memberId);
    assert(person);
    assert.equal(new Set(race.candidates.map(c => c.fecId)).size, race.candidates.length);
    if (race.status !== 'registered-candidates') assert.equal(race.candidates.length, 0);
    for (const candidate of race.candidates) {
      assert(!person.fecIds.includes(candidate.fecId));
      assert.equal(candidate.registration.electionYear, 2026);
      assert.equal(candidate.registration.status, 'C');
      assert.equal(candidate.registration.state, race.state);
      assert.equal(candidate.registration.office, race.office);
      assert.equal(candidate.registration.district, race.district);
      assert.equal(candidate.finance.corporateContributions, null);
    }
  }
}
if (process.argv.includes('--offline')) {
  const data = JSON.parse(await fs.readFile(output, 'utf8'));
  validate(data);
  console.log(JSON.stringify(data.meta.counts));
  process.exit(0);
}
function unzip(zip, expected) {
  let eocd = -1;
  for (let i = zip.length - 22; i >= Math.max(0, zip.length - 65557); i--) if (zip.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('Invalid ZIP');
  let entry = zip.readUInt32LE(eocd + 16);
  for (let n = 0; n < zip.readUInt16LE(eocd + 10); n++) {
    assert.equal(zip.readUInt32LE(entry), 0x02014b50);
    const nameLength = zip.readUInt16LE(entry + 28);
    const name = zip.subarray(entry + 46, entry + 46 + nameLength).toString();
    if (name === expected) {
      const offset = zip.readUInt32LE(entry + 42);
      const start = offset + 30 + zip.readUInt16LE(offset + 26) + zip.readUInt16LE(offset + 28);
      const bytes = zip.subarray(start, start + zip.readUInt32LE(entry + 20));
      const method = zip.readUInt16LE(entry + 10);
      assert([0, 8].includes(method));
      return (method === 8 ? inflateRawSync(bytes) : bytes).toString('utf8');
    }
    entry += 46 + nameLength + zip.readUInt16LE(entry + 30) + zip.readUInt16LE(entry + 32);
  }
  throw new Error(`ZIP entry missing: ${expected}`);
}
const masterUrl = 'https://www.fec.gov/files/bulk-downloads/2026/cn26.zip';
const supplied = process.argv.indexOf('--candidate-master');
let masterZip;
if (supplied >= 0) masterZip = await fs.readFile(process.argv[supplied + 1]);
else {
  const response = await fetch(masterUrl, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Candidate master HTTP ${response.status}`);
  masterZip = Buffer.from(await response.arrayBuffer());
}
const master = unzip(masterZip, 'cn.txt').trim().split(/\r?\n/).map(line => line.split('|'));
assert(master.every(row => row.length === 15));
assert.equal(new Set(master.map(r => r[0])).size, master.length);
const eligible = master.filter(r => r[3] === '2026' && r[8] === 'C' && ['H', 'S'].includes(r[5]));
const financeZip = await fs.readFile(path.join(root, 'data/weball26.zip'));
const financeRows = unzip(financeZip, 'weball26.txt').trim().split(/\r?\n/).map(line => line.split('|'));
assert(financeRows.every(row => row.length === 30));
const finances = new Map(financeRows.map(r => [r[0], r]));
const roster = JSON.parse(await fs.readFile(path.join(root, 'data/legislators-current.json'), 'utf8'));
const terms = new Map(roster.map(p => [p.id.bioguide, p.terms.at(-1)]));
const senateAmbiguousStates = new Set(roster.filter(p => {
  const t = p.terms.at(-1);
  return t.type === 'sen' && (t.how === 'appointment' || (t.class !== 2 && eligible.some(r => p.id.fec?.includes(r[0]) && r[5] === 'S')));
}).map(p => p.terms.at(-1).state));
function finance(row) {
  const amount = i => {
    if (!row || row[i] === '') return null;
    assert(/^-?(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/.test(row[i]), JSON.stringify({id:row[0],index:i,value:row[i]}));
    return Number(row[i]);
  };
  const m = row?.[27].match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const end = m ? `${m[3]}-${m[1]}-${m[2]}` : null;
  if (row && (!end || end < '2025-01-01' || end > people.meta.retrievedAt.slice(0, 10))) {
    return { ...finance(null), unavailableReason: 'The FEC summary coverage date is absent or outside this snapshot cycle.' };
  }
  return { status: row ? 'available' : 'unavailable', unavailableReason: row ? null : 'No financial summary in the bundled FEC snapshot.',
    coverageStart: '2025-01-01', coverageEnd: end,
    receipts: amount(5), individualContributions: amount(17), otherCommitteeContributions: amount(25), partyCommitteeContributions: amount(26),
    cashOnHand: amount(10), transfersFromAuthorized: amount(6), transfersToAuthorized: amount(8), corporateContributions: null };
}
const party = code => ({ DEM: 'Democrat', REP: 'Republican', IND: 'Independent', LIB: 'Libertarian', GRE: 'Green' })[code] ?? code;
const races = people.politicians.map(p => {
  const term = terms.get(p.id);
  const office = p.chamber;
  const district = office === 'House' ? p.district : null;
  const sourceUrl = office === 'House' ? `https://www.fec.gov/data/elections/house/${p.state}/${String(district).padStart(2, '0')}/2026/` : `https://www.fec.gov/data/elections/senate/${p.state}/2026/`;
  const base = { memberId: p.id, office, state: p.state, district, electionYear: 2026, status: 'unavailable', note: '', sourceUrl, candidates: [] };
  if (office === 'Senate' && senateAmbiguousStates.has(p.state)) return { ...base, note: 'This state has a possible special Senate election or appointed senator. The master file does not distinguish Senate seats. Check the FEC directory.' };
  if (office === 'Senate' && term?.class !== 2) return { ...base, status: 'not-up-this-cycle', note: 'This Senate seat is not in the regular 2026 election class. No opponent comparison is inferred.' };
  const sameRace = eligible.filter(r => r[5] === (office === 'House' ? 'H' : 'S') && r[4] === p.state && (office !== 'House' || Number(r[6]) === district));
  const incumbent = sameRace.filter(r => p.fecIds.includes(r[0]));
  if (incumbent.length !== 1) return { ...base, note: 'The incumbent does not have one unambiguous 2026 statutory-candidate record for this seat. Registration may be absent, changed, or duplicated. Check the FEC directory.' };
  const others = sameRace.filter(r => !p.fecIds.includes(r[0]));
  // A shared principal committee can signal duplicate candidate IDs. Omit both.
  const candidates = others.filter(r => !r[9] || sameRace.filter(other => other[9] === r[9]).length === 1).map(r => ({
    fecId: r[0], name: r[1], party: party(r[2]), sourceUrl: `https://www.fec.gov/data/candidate/${r[0]}/?cycle=2026`,
    registration: { electionYear: 2026, status: 'C', office, state: r[4], district, principalCommitteeId: r[9] || null },
    finance: finance(finances.get(r[0])),
  })).sort((a, b) => a.name.localeCompare(b.name));
  if (!candidates.length) return { ...base, note: 'No other unambiguous 2026 statutory candidates appear for this seat in the snapshot. This does not establish an uncontested election.' };
  return { ...base, status: 'registered-candidates', note: 'FEC-registered candidates for this seat and year. This can include primary candidates and withdrawn candidates. It is not a confirmed ballot-opponent list. Financial coverage dates can differ.', candidates };
});
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const data = { schemaVersion: 1, meta: { retrievedAt: new Date().toISOString(), financeRetrievedAt: people.meta.retrievedAt,
  sources: [{ name: 'FEC candidate master 2026', url: masterUrl, sha256: hash(masterZip), dictionaryUrl: 'https://www.fec.gov/campaign-finance-data/candidate-master-file-description/' },
    { name: 'FEC all candidates 2026', url: 'https://www.fec.gov/files/bulk-downloads/2026/weball26.zip', sha256: hash(financeZip) }],
  counts: { members: races.length, registeredCandidates: races.filter(r => r.status === 'registered-candidates').length, unavailable: races.filter(r => r.status === 'unavailable').length, notUpThisCycle: races.filter(r => r.status === 'not-up-this-cycle').length, candidateRecords: races.reduce((n, r) => n + r.candidates.length, 0) },
  limitations: ['FEC registration does not establish current ballot status, nomination, or continuing candidacy.', 'Only 2026 election-year records with statutory-candidate status C are included.', 'Senate states with appointment or multiple-seat ambiguity are withheld.', 'Incumbents must have one matching statutory-candidate record for their current seat.', 'Candidates sharing a principal campaign committee are omitted to avoid duplicate identities.', 'Amounts retain candidate-specific coverage dates and raw FEC transfer caveats.'],
}, races };
validate(data);
await fs.writeFile(output, JSON.stringify(data, null, 2) + '\n');
console.log(JSON.stringify(data.meta.counts));
