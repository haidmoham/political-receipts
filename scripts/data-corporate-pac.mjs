// Build auditable corporate-connected PAC record examples. Totals remain unverified.
// node scripts/data-corporate-pac.mjs [--source-dir DIR_WITH_ZIPS]
// node scripts/data-corporate-pac.mjs --offline
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateRawSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'data/corporate-pac.json');
const people = JSON.parse(await fs.readFile(path.join(root, 'data/politicians.json'), 'utf8'));
function validate(data) {
  assert.equal(data.members.length, people.politicians.length);
  for (const member of data.members) {
    assert.equal(member.netContributions, null);
    assert.equal(member.grossContributions, null);
    assert.equal(member.noCorporateMoneyVerified, false);
    assert.equal(member.noLobbyistMoneyVerified, false);
    for (const donor of member.donors) {
      assert(['C', 'W'].includes(donor.organizationType));
      assert(['N', 'Q'].includes(donor.committeeType));
      assert.equal(donor.netContributions, null);
      assert.equal(donor.example.transactionType, '24K');
      assert.equal(donor.example.memoCode, '');
      assert(donor.example.amount > 0);
      assert(donor.example.date >= member.coverageStart && donor.example.date <= member.coverageEnd);
    }
  }
}
if (process.argv.includes('--offline')) {
  const data = JSON.parse(await fs.readFile(output, 'utf8'));
  validate(data); console.log(JSON.stringify(data.meta.counts)); process.exit(0);
}
function unzip(zip, expected) {
  let eocd = -1;
  for (let i = zip.length - 22; i >= Math.max(0, zip.length - 65557); i--) if (zip.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('Invalid ZIP');
  let entry = zip.readUInt32LE(eocd + 16);
  for (let n = 0; n < zip.readUInt16LE(eocd + 10); n++) {
    assert.equal(zip.readUInt32LE(entry), 0x02014b50);
    const len = zip.readUInt16LE(entry + 28);
    const name = zip.subarray(entry + 46, entry + 46 + len).toString();
    if (name === expected) {
      const offset = zip.readUInt32LE(entry + 42);
      const start = offset + 30 + zip.readUInt16LE(offset + 26) + zip.readUInt16LE(offset + 28);
      const data = zip.subarray(start, start + zip.readUInt32LE(entry + 20));
      const method = zip.readUInt16LE(entry + 10); assert([0, 8].includes(method));
      return (method === 8 ? inflateRawSync(data) : data).toString('utf8');
    }
    entry += 46 + len + zip.readUInt16LE(entry + 30) + zip.readUInt16LE(entry + 32);
  }
  throw new Error(`Missing ZIP entry ${expected}`);
}
const files = [['pas226.zip', 'itpas2.txt', 22], ['cm26.zip', 'cm.txt', 15], ['ccl26.zip', 'ccl.txt', 7]];
const dirArg = process.argv.indexOf('--source-dir');
const sources = [];
const tables = await Promise.all(files.map(async ([file, entry, columns]) => {
  const url = `https://www.fec.gov/files/bulk-downloads/2026/${file}`;
  let bytes;
  if (dirArg >= 0) bytes = await fs.readFile(path.join(process.argv[dirArg + 1], file));
  else { const response = await fetch(url, { signal: AbortSignal.timeout(60000) }); if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`); bytes = Buffer.from(await response.arrayBuffer()); }
  sources.push({ file, url, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
  const rows = unzip(bytes, entry).trim().split(/\r?\n/).map(line => line.split('|'));
  assert(rows.every(r => r.length === columns), `${entry}: unexpected columns`);
  return rows;
}));
const [transactions, committeeRows, linkage] = tables;
const committees = new Map(committeeRows.map(r => [r[0], r]));
assert.equal(committees.size, committeeRows.length);
const candidateMembers = new Map();
for (const p of people.politicians) for (const id of p.fecIds.filter(id => id.startsWith(p.chamber === 'Senate' ? 'S' : 'H'))) {
  if (candidateMembers.has(id)) throw new Error(`Candidate ID maps to multiple members: ${id}`);
  candidateMembers.set(id, p);
}
const links = new Set(linkage.filter(r => r[2] === '2026' && ['A', 'P'].includes(r[5])).map(r => `${r[0]}|${r[3]}`));
const audit = { inputRows: transactions.length, repeatedSubIds: 0, repeatedFilerReportTransactionIds: 0, repeatedFilerTransactionIdsAcrossReports: 0, matchingPositiveRows: 0, memoRowsExcluded: 0, nonpositiveRowsExcluded: 0, missingOrOutOfCoverageRowsExcluded: 0, unlinkedRowsExcluded: 0 };
const seen = new Map();
const reportKeys = new Map();
const filerKeys = new Map();
for (const r of transactions) {
  if (seen.has(r[21])) { assert.equal(seen.get(r[21]).join('|'), r.join('|')); audit.repeatedSubIds++; continue; }
  seen.set(r[21], r);
  if (r[17]) {
    const key = `${r[0]}|${r[18]}|${r[17]}`;
    reportKeys.set(key, (reportKeys.get(key) ?? 0) + 1);
    const filerKey = `${r[0]}|${r[17]}`;
    if (!filerKeys.has(filerKey)) filerKeys.set(filerKey, new Set());
    filerKeys.get(filerKey).add(r[18]);
  }
}
audit.repeatedFilerReportTransactionIds = [...reportKeys.values()].filter(n => n > 1).length;
audit.repeatedFilerTransactionIdsAcrossReports = [...filerKeys.values()].filter(s => s.size > 1).length;
const memberDonors = new Map();
for (const r of seen.values()) {
  const donor = committees.get(r[0]);
  const p = candidateMembers.get(r[16]);
  if (!p || !donor || !['C', 'W'].includes(donor[12]) || !['N', 'Q'].includes(donor[9]) || r[5] !== '24K') continue;
  if (!links.has(`${r[16]}|${r[15]}`)) { audit.unlinkedRowsExcluded++; continue; }
  if (r[19] || r[20]) { audit.memoRowsExcluded++; continue; }
  const dateMatch = r[13].match(/^(\d{2})(\d{2})(\d{4})$/);
  const date = dateMatch ? `${dateMatch[3]}-${dateMatch[1]}-${dateMatch[2]}` : null;
  if (!date || !p.finance.coverageEnd || date < '2025-01-01' || date > p.finance.coverageEnd) { audit.missingOrOutOfCoverageRowsExcluded++; continue; }
  if (!/^-?(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/.test(r[14])) continue;
  const amount = Number(r[14]);
  if (amount <= 0) { audit.nonpositiveRowsExcluded++; continue; }
  // Ambiguous rows are not selected as examples. No amendment chain is inferred.
  if (r[17] && ((reportKeys.get(`${r[0]}|${r[18]}|${r[17]}`) ?? 0) > 1 || (filerKeys.get(`${r[0]}|${r[17]}`)?.size ?? 0) > 1)) continue;
  audit.matchingPositiveRows++;
  if (!memberDonors.has(p.id)) memberDonors.set(p.id, new Map());
  const donors = memberDonors.get(p.id);
  const image = /^\d{11,18}$/.test(r[4]) ? `https://docquery.fec.gov/cgi-bin/fecimg/?${r[4]}` : null;
  const example = { amount, date, transactionType: r[5], memoCode: r[19], candidateId: r[16], recipientCommitteeId: r[15], transactionId: r[17] || null, reportId: r[18], amendmentIndicator: r[1], subId: r[21], imageNumber: r[4], sourceUrl: image ?? `https://www.fec.gov/data/committee/${r[0]}/?cycle=2026` };
  const current = donors.get(r[0]);
  if (!current) donors.set(r[0], { committeeId: r[0], name: donor[1], connectedOrganization: donor[13] || null, organizationType: donor[12], committeeType: donor[9], sourceUrl: `https://www.fec.gov/data/committee/${r[0]}/?cycle=2026`, observedRecordCount: 1, netContributions: null, example });
  else { current.observedRecordCount++; if (date > current.example.date || (date === current.example.date && r[21] > current.example.subId)) current.example = example; }
}
const members = people.politicians.map(p => {
  const donors = [...(memberDonors.get(p.id)?.values() ?? [])].sort((a, b) => a.name.localeCompare(b.name));
  return { memberId: p.id, status: donors.length ? 'records-found-total-unverified' : 'no-matching-records-total-unverified', coverageStart: '2025-01-01', coverageEnd: p.finance.coverageEnd,
    netContributions: null, grossContributions: null, noCorporateMoneyVerified: false, noLobbyistMoneyVerified: false,
    distinctObservedDonorCount: donors.length, donorsShown: Math.min(10, donors.length),
    note: donors.length ? 'Corporate-connected PAC contribution records found. Examples are disclosures, not a reconciled total. Refunds and amendment completeness remain unverified.' : 'No matching examples passed these filters. This is not evidence of zero corporate or lobbyist money.',
    donors: donors.slice(0, 10) };
});
const data = { schemaVersion: 1, meta: { retrievedAt: new Date().toISOString(), financeRetrievedAt: people.meta.retrievedAt,
  sources: sources.sort((a, b) => a.file.localeCompare(b.file)), status: 'evidence-only-totals-unverified', counts: { members: members.length, membersWithExamples: members.filter(m => m.donors.length).length, examples: members.reduce((n, m) => n + m.donors.length, 0) }, audit,
  methodology: 'data/corporate-methodology.md', limitations: ['No gross or net contribution total is verified.', 'Latest committee classification is not a historical classification at the contribution date.', 'Examples use non-memo positive 24K records linked to authorized campaign committees; this deliberately omits other activity.', 'Filer transaction IDs can recur across reports; all ambiguous example keys are excluded, not merged.', 'Ten donor examples per member, alphabetical by committee name. This is not a top-donor ranking.', 'No matching records does not establish zero corporate PAC or lobbyist funding.', 'PAC funds are not direct corporate treasury contributions. No causal influence claim is made.'] }, members };
validate(data);
await fs.writeFile(output, JSON.stringify(data, null, 2) + '\n');
console.log(JSON.stringify({ counts: data.meta.counts, audit }));
