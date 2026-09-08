(function (root) {
  'use strict';
  const money = value => Number.isFinite(value) ? new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', minimumFractionDigits: value!==0 && Math.abs(value)<1 ? 2 : 0, maximumFractionDigits: value!==0 && Math.abs(value)<1 ? 2 : 0}).format(value) : 'Not reported';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
  const date = value => value ? new Date(`${value.slice(0, 10)}T12:00:00Z`).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}) : 'Not reported';
  function makeMatcher(people) {
    const names = new Map();
    for (const person of people) for (const name of new Set([person.name, ...(person.aliases || [])])) {
      if (!name || name.trim().split(/\s+/).length < 2) continue;
      const key = name.toLocaleLowerCase('en-US');
      if (names.has(key) && names.get(key)?.id !== person.id) names.set(key, null);
      else if (!names.has(key)) names.set(key, person);
    }
    const alternatives = [...names].filter(([,p]) => p).map(([n]) => n).sort((a,b) => b.length-a.length).map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = alternatives.length ? new RegExp(`(?<![\\p{L}\\p{N}_])(?:${alternatives.join('|')})(?![\\p{L}\\p{N}_])`, 'giu') : null;
    return text => pattern ? [...text.matchAll(pattern)].map(m => ({start:m.index,end:m.index+m[0].length,person:names.get(m[0].toLocaleLowerCase('en-US'))})) : [];
  }
  function card(person, meta) {
    const p = person, f = p.finance || {}, e = escape;
    const available = f.status === 'available';
    const committee = available && Number.isFinite(f.otherCommitteeContributions) ? f.otherCommitteeContributions : null;
    const stamp = committee === null ? 'CATEGORY UNAVAILABLE' : committee === 0 ? 'ZERO REPORTED · OTHER COMMITTEES' : committee<0 ? 'NET NEGATIVE · OTHER COMMITTEES' : 'FROM OTHER POLITICAL COMMITTEES';
    const share = committeeShare(f);
    const portrait = (root.RECEIPTS_PORTRAITS || []).some(p=>p.id===person.id && p.status==='available');
    const base = root.chrome?.runtime?.getURL ? root.chrome.runtime.getURL('') : '';
    const photo = portrait && /^[A-Z][0-9]{6}$/.test(person.id) ? `<img class="portrait" src="${e(base)}portraits/${e(person.id)}.jpg" alt="Official portrait of ${e(person.name)}">` : '';
    const source = /^https:\/\/www\.fec\.gov\//.test(p.sourceUrl || '') ? p.sourceUrl : `https://www.fec.gov/data/candidates/?search=${encodeURIComponent(p.name)}`;
    return `<div class="player-card ${committee===0?'zero':committee===null||committee<0?'unknown':'received'}">
      <div class="card-hero"><div class="card-edition"><span>▥ RECEIPTS</span><span>PUBLIC OFFICE / ${e(String(meta.cycle).slice(-2))}</span></div>
      <div class="player-rating"><strong>${p.chamber==='Senate'?'SEN':'REP'}</strong><span>${e(p.chamber)}</span><div class="state-badge">${e(p.state)}</div><div class="party-badge">${e(p.party)}</div></div>
      <div class="portrait-zone">${photo || `<div class="portrait-initials">${e(p.name.split(' ').map(w=>w[0]).filter(Boolean).slice(0,2).join(''))}</div>`}</div>
      <div class="player-identity"><h2>${e(p.name)}</h2></div></div>
      <div class="headline-stat"><span>${stamp}</span><strong>${money(committee)}</strong><small>USD · ${date(f.coverageStart)} — ${date(f.coverageEnd)}</small></div>
      <div class="evidence-limit">Corporate / lobbyist split: <b>unavailable</b></div>
      <a class="compare-action" href="${e(base)}compare.html?id=${encodeURIComponent(p.id)}" target="_blank" rel="noopener noreferrer">Compare with their opponents <span>↗</span></a>
      <details><summary>Money breakdown & sources</summary>
      <div class="stat-grid">${[['Individual contributions',f.individualContributions],['Other committees',f.otherCommitteeContributions],['Party committees',f.partyCommitteeContributions],['Total receipts',f.receipts]].map(([label,value])=>`<div><b>${available?money(value):'Unknown'}</b><span>${label}</span></div>`).join('')}</div>
      ${policyContext(p.id)}
      <p><b>Committee share: ${share.label}</b> — other political committee contributions divided by the sum of individual, other political committee, and party committee contributions. It is a funding measure, not a morality rating. ${share.label==='—'?'Required categories are missing, negative, or total zero.':''}</p><p>Receipts include more than donations, such as loans and transfers. These contribution categories do not add up to total receipts. Other political committees are not necessarily corporate PACs. A zero in this category does not mean no lobbyist money. These totals do not establish influence or misconduct.</p><p>Snapshot retrieved ${date(meta.retrievedAt)}. Reports may change. A missing value does not mean zero. Each campaign has its own coverage end date. Dollar values of $1 or more are rounded to the nearest dollar. Share is rounded to a whole percent, with nonzero shares below 1% shown as &lt;1%.</p></details>
      <div class="receipt-bottom"><span class="barcode" aria-hidden="true"></span><a href="${e(source)}" target="_blank" rel="noopener noreferrer">CHECK THE RECEIPT ↗</a></div></div>`;
  }
  function committeeShare(f) {
    const values=[f.individualContributions,f.otherCommitteeContributions,f.partyCommitteeContributions];
    if(f.status!=='available'||values.some(v=>!Number.isFinite(v)||v<0))return {value:null,label:'—'};
    const total=values.reduce((a,b)=>a+b,0);
    if(!total)return {value:null,label:'—'};
    const value=100*f.otherCommitteeContributions/total;
    return {value,label:value>0&&value<1?'&lt;1%':`${Math.round(value)}%`};
  }
  function policyContext(id) {
    const p = (root.RECEIPTS_POLICY || []).find(p=>p.id===id);
    if(!p)return '';
    return `<div class="policy"><span class="eyebrow">WHERE PUBLIC POWER MEETS DAILY LIFE</span><h3>${escape(p.heading)}</h3><p>${escape(p.role)}</p><p>${escape(p.stakes)}</p><span class="connection-note">Committee jurisdiction. A donor-to-policy connection has not been established.</span>${p.evidence.filter(s=>/^https:\/\/[a-z0-9.-]+\.(gov|senate.gov)\//i.test(s.url)).map(s=>`<a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.label)} ↗</a>`).join('')}</div>`;
  }
  root.ReceiptsCore = {money, escape, date, makeMatcher, card, committeeShare};
})(globalThis);
