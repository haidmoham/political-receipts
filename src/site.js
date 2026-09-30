const input = document.getElementById('member-search');
const members = document.getElementById('members');
const more = document.getElementById('show-more');
let limit = 30;
function renderMembers() {
  const words = input.value.trim().toLocaleLowerCase('en-US').split(/\s+/).filter(Boolean);
  const matches = RECEIPTS_DATA.politicians.filter(person => {
    const text = [person.name, ...(person.aliases || []), person.state, person.chamber].join(' ').toLocaleLowerCase('en-US');
    return words.every(word => text.includes(word));
  });
  members.replaceChildren();
  for (const person of matches.slice(0, limit)) {
    const link = document.createElement('a');
    link.className = 'member';
    link.href = `receipt.html?id=${encodeURIComponent(person.id)}`;
    const name = document.createElement('strong');
    name.textContent = person.name;
    const detail = document.createElement('span');
    detail.textContent = `${person.state} · ${person.chamber} · ${person.party} ↗`;
    const coverage = document.createElement('span');
    coverage.textContent = person.finance?.status === 'available'
      ? `Report through ${ReceiptsCore.date(person.finance.coverageEnd)}`
      : 'Campaign summary unavailable';
    link.append(name, detail, coverage);
    members.append(link);
  }
  more.hidden = matches.length <= limit;
  more.textContent = `Show ${Math.min(30, matches.length - limit)} more members`;
  document.getElementById('result-count').textContent = matches.length
    ? `${matches.length} members in the snapshot · showing ${Math.min(limit, matches.length)}`
    : 'No matching members in this snapshot. Try a surname, state abbreviation, or chamber.';
}
input.addEventListener('input', () => { limit = 30; renderMembers(); });
more.addEventListener('click', () => {
  const previousCount = members.children.length;
  limit += 30;
  renderMembers();
  members.children[previousCount]?.focus();
});
document.getElementById('lookup').addEventListener('submit', event => event.preventDefault());
document.getElementById('snapshot-date').textContent = `${RECEIPTS_DATA.meta.cycle} cycle · Snapshot ${ReceiptsCore.date(RECEIPTS_DATA.meta.retrievedAt)} · bundled records, not live.`;
renderMembers();
