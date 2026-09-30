const person = RECEIPTS_DATA.politicians.find(p => p.id === new URLSearchParams(location.search).get('id'));
const receipt = document.getElementById('receipt');
receipt.innerHTML = person ? ReceiptsCore.card(person, RECEIPTS_DATA.meta) : '<p class="missing-record">Member not found in this snapshot. <a href="index.html">Find a member of Congress</a>.</p>';
document.title = person ? `${person.name} — Receipts` : 'Member not found — Receipts';
if (person) {
  const comparisonLink = receipt.querySelector('.compare-action');
  comparisonLink.removeAttribute('target');
  comparisonLink.querySelector('span').textContent = '→';
  document.getElementById('record-id').textContent = person.id;
  document.getElementById('member-name').textContent = person.name;
  const meta = document.getElementById('member-meta');
  meta.append(`${person.state} · ${person.chamber} · `);
  const party = document.createElement('span');
  party.className = 'party-label';
  party.dataset.party = ReceiptsCore.partyKind(person.party);
  party.textContent = person.party || 'Party not reported';
  meta.append(party);
  document.getElementById('record-period').textContent = `${ReceiptsCore.date(person.finance?.coverageStart)} — ${ReceiptsCore.date(person.finance?.coverageEnd)}`;
  document.getElementById('record-snapshot').textContent = ReceiptsCore.date(RECEIPTS_DATA.meta.retrievedAt);
} else {
  document.getElementById('member-name').textContent = 'Member not found';
  document.querySelector('.record-notes').hidden = true;
}
