const person = RECEIPTS_DATA.politicians.find(p => p.id === new URLSearchParams(location.search).get('id'));
const receipt = document.getElementById('receipt');
document.title = person ? `${person.name} - Receipts` : 'Member not found - Receipts';
if (!person) {
  receipt.innerHTML = '<p class="missing-record">Member not found in this snapshot. <a href="index.html">Find a member of Congress</a>.</p>';
  document.getElementById('member-name').textContent = 'Member not found';
  document.querySelector('.record-notes').hidden = true;
} else {
  const {escape:e,money,date,partyKind} = ReceiptsCore;
  const f = person.finance || {}, available = f.status === 'available';
  const amount = key => money(available ? f[key] : null);
  document.getElementById('member-name').textContent = person.name;
  document.getElementById('record-id').textContent = person.id;
  document.getElementById('member-meta').innerHTML = `${e(person.state)} · ${e(person.chamber)} · <span class="party-label" data-party="${partyKind(person.party)}">${e(person.party || 'Party not reported')}</span>`;
  receipt.innerHTML = `<article class="player-card profile-card" data-party="${partyKind(person.party)}">
    <div class="card-hero profile-top"><h2>Campaign funding</h2><span>${e(person.party || 'Party not reported')}</span></div>
    <div class="funding-main"><p>Total reported receipts</p><strong class="funding-total">${amount('receipts')}</strong><p id="record-period">${date(f.coverageStart)} – ${date(f.coverageEnd)}</p><p class="short-note">Includes more than donations. Transfers can be counted twice.</p>
    ${!available ? `<p>${e(f.unavailableReason || 'Campaign summary unavailable.')} Unknown does not mean zero.</p>` : ''}
    ${available ? `<dl class="funding-split"><div><dt>From individuals</dt><dd>${amount('individualContributions')}</dd></div><div><dt>From other political committees</dt><dd>${amount('otherCommitteeContributions')}</dd></div><div><dt>From party committees</dt><dd>${amount('partyCommitteeContributions')}</dd></div></dl>` : ''}
    <details class="record-detail"><summary>Accounting and sources</summary><p>This is the FEC candidate summary for ${e(person.fecId || 'an unavailable candidate ID')}, combining authorized committees. Receipts may include loans and transfers; contributions below are not a complete breakdown of receipts. Transfers received: ${amount('transfersFromAuthorized')}. Transfers sent: ${amount('transfersToAuthorized')}.</p><p>Snapshot: <span id="record-snapshot">${date(RECEIPTS_DATA.meta.retrievedAt)}</span>. Missing means unknown.</p><p><a href="${e(person.sourceUrl || 'https://www.fec.gov/data/candidates/')}">Candidate’s FEC record</a> · <a href="https://www.fec.gov/campaign-finance-data/all-candidates-file-description/">Field definitions</a></p></details>
    <a class="compare-action" href="compare.html?id=${encodeURIComponent(person.id)}">Compare campaign records <span aria-hidden="true">→</span></a></div></article>`;
  const records = globalThis.RECEIPTS_RECORDS;
  const decisions = (records?.rollCalls || []).filter(r => Object.hasOwn(r.votes, person.id))
    .sort((a,b) => b.date.localeCompare(a.date) || b.number - a.number);
  const reports = (records?.investmentReports || []).filter(r => r.memberId === person.id);
  const history = document.querySelector('.record-notes');
  const stance = value => ({Aye:'Yes',Yea:'Yes',No:'No',Nay:'No','Not Voting':'Not voting',Present:'Present'}[value] || value);
  const questionLabel = r => ({
    'On Passage':'Pass the bill',
    'On Passage of the Bill':'Pass the bill',
    'On the Nomination':'Confirm the nomination',
    'On the Cloture Motion':'Limit debate on the nomination',
    'On Motion to Concur in the Senate Amendment':'Agree with the Senate amendment',
    'On Motion to Suspend the Rules and Pass':'Pass under suspended rules',
    'On Ordering the Previous Question':'End debate on the rule',
    'On Agreeing to the Resolution':'Approve the resolution',
    'On Motion to Reconsider':'Reconsider an earlier vote'
  }[r.question] || r.question);
  const decisionRows = decisions.map(r => {
    const title = (r.title || '').length <= 110 ? r.title : r.question;
    return `<li class="decision"><details><summary><span class="decision-meta"><span>${date(r.date)} · ${e(r.chamber)} ${r.number}</span><strong class="decision-vote">${e(stance(r.votes[person.id]))}</strong></span><span class="decision-title">${e(r.bill)}${title ? ` · ${e(title)}` : ''}</span><span class="decision-question">${e(questionLabel(r))}</span></summary><div class="decision-detail"><p>Official question: ${e(r.question)}.</p><p>${e(r.title)}</p>${r.context && r.context !== r.title ? `<p>${e(r.context)}</p>` : ''}${r.question === 'On the Cloture Motion' ? '<p>This limits debate; it is not the vote to confirm the nominee.</p>' : ''}<p>Recorded vote: ${e(r.votes[person.id])}. Result: ${e(r.result)}.</p><p>This is the decision on this specific motion, bill or nomination; no reason for the member’s vote is inferred.</p><a href="${e(r.url)}">Official ${e(r.chamber)} roll call ${r.number}</a></div></details></li>`;
  }).join('');
  const reportRows = reports.map(report => {
    const count = report.transactions.length;
    const trades = report.transactions.map(t => `<li class="transaction"><div><strong>${e(t.asset)}${t.ticker ? ` <span class="ticker">${e(t.ticker)}</span>` : ''}</strong><span>${date(t.date)}</span></div><p>${e(t.action)} · ${e(t.assetType)} · ${e(t.owner)}</p><strong>${money(t.amountMin)} – ${money(t.amountMax)}</strong><details><summary>Transaction details and source</summary><p>${e(t.description)}</p><p>Notification: ${date(t.notificationDate)}. Reported range, not an exact price. Not current holdings or profit.${t.sourceOwner == null ? ' The owner column is blank in this source; we do not assign an owner.' : ''}</p><a href="${e(report.url)}#page=${t.sourcePages[0]}">Official report · row ${e(t.id.split(':')[1])}, page ${t.sourcePages.join(' / ')}</a></details></li>`).join('');
    return `<p>${count} ${count === 1 ? 'transaction' : 'transactions'} · <strong>${e(report.ownerSummary)}</strong></p><p>Filed ${date(report.filed)}. Transactions: ${date(report.periodStart)}${report.periodEnd !== report.periodStart ? ` – ${date(report.periodEnd)}` : ''}.</p><details class="all-transactions"><summary>Read all ${count} reported ${count === 1 ? 'transaction' : 'transactions'}</summary><ol class="transactions">${trades}</ol></details><a href="${e(report.url)}">Read the official disclosure</a>`;
  }).join('');
  const coverageWindow = records?.coverage?.votes?.[person.chamber];
  history.innerHTML = `${decisions.length ? `<section class="history-section"><p class="kicker">PUBLIC DECISIONS</p><h2>Recorded decisions</h2><p class="feed-caption">${decisions.length} decisions · ${date(coverageWindow?.start)} – ${date(coverageWindow?.end)}</p><p id="decision-help" class="short-note">Scroll for more. Open a decision for its source.</p><div class="decision-feed" role="region" tabindex="0" aria-label="Recorded decisions for ${e(person.name)}" aria-describedby="decision-help"><ol class="decisions">${decisionRows}</ol></div><p class="short-note">Selected consecutive roll calls, not a complete history.</p></section>` : ''}
    ${reports.length ? `<section class="history-section"><p class="kicker">FINANCIAL DISCLOSURES</p><h2>Reported investments</h2>${reportRows}<p class="short-note">Selected original reports. Later filings and amendments are not reconciled; this is not a complete history.</p></section>` : ''}
    <details class="record-detail coverage-detail"><summary>Coverage and omitted information</summary><p>Funding uses the September 8, 2026 snapshot. Decisions cover 12 consecutive House roll calls (July 3–17, 2025) and 12 Senate roll calls (July 1–10, 2025), matched by official identity, chamber and state to the bundled roster. That reaches 522 roster members. Financial disclosures cover four selected complete House reports: Pelosi, Collins, Foxx and Beyer. Each record keeps its own date.</p><p>Donor-size and lobbyist totals are not measured here. Decision and investment sections appear only with matched source evidence. Omitted information means outside this coverage, not zero activity.</p><p>These records do not establish motive, influence, misconduct or a link between a transaction and a decision.</p><a href="privacy.html">Full methodology</a></details>`;
}
