import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
await import('../src/core.js');
const core=globalThis.ReceiptsCore;
const data=JSON.parse(await readFile(new URL('../data/politicians.json',import.meta.url),'utf8'));
test('full names match boundaries, punctuation and case without matching fragments',()=>{const match=core.makeMatcher(data.politicians);assert.equal(match('Ted Cruz met TED CRUZ.').length,2);assert.equal(match('Ted Cruzado met Cruz.').length,0);assert.equal(match('Ted Cruz’s office').length,1);});
test('ambiguous aliases are withheld',()=>{const match=core.makeMatcher([{id:'a',name:'Alex Smith'},{id:'b',name:'Alex Smith'}]);assert.deepEqual(match('Alex Smith'),[]);});
test('unavailable money stays distinct from reported zero',()=>{const p=data.politicians[0];const unknown=core.card({...p,finance:{status:'unavailable'}},data.meta);assert.match(unknown,/CATEGORY UNAVAILABLE/);assert.doesNotMatch(unknown,/ZERO REPORTED/);const zero=core.card({...p,finance:{...p.finance,status:'available',otherCommitteeContributions:0}},data.meta);assert.match(zero,/ZERO REPORTED/);assert.match(zero,/does not mean no lobbyist money/);});
test('card escapes records and only links to approved finance origin',()=>{const html=core.card({...data.politicians[0],name:'<img src=x onerror=alert(1)>',sourceUrl:'javascript:alert(1)'},data.meta);assert.doesNotMatch(html,/<img|href="javascript:/);assert.match(html,/&lt;img/);});
test('all available money has coverage and unavailable fields remain null',()=>{for(const p of data.politicians){assert.ok(p.id && p.name);if(p.finance.status==='available'){assert.match(p.finance.coverageEnd,/^202[56]-\d\d-\d\d$/);assert.ok(p.finance.coverageEnd>=p.finance.coverageStart);assert.ok(Number.isFinite(p.finance.receipts));}else assert.equal(p.finance.receipts,null);assert.equal(p.finance.corporateContributions,null);}});

test('committee share uses contribution categories rather than total receipts',()=>{
  const f={status:'available',individualContributions:60,otherCommitteeContributions:30,partyCommitteeContributions:10,receipts:1000};
  assert.deepEqual(core.committeeShare(f),{value:30,label:'30%'});
  assert.equal(core.committeeShare({...f,otherCommitteeContributions:0}).label,'0%');
  assert.equal(core.committeeShare({...f,individualContributions:10000,otherCommitteeContributions:1}).label,'&lt;1%');
});

test('committee share withholds incomplete, negative, and empty denominators',()=>{
  const base={status:'available',individualContributions:60,otherCommitteeContributions:30,partyCommitteeContributions:10};
  for(const field of ['individualContributions','otherCommitteeContributions','partyCommitteeContributions']){
    for(const value of [undefined,null,NaN,Infinity,-1])assert.deepEqual(core.committeeShare({...base,[field]:value}),{value:null,label:'—'});
  }
  assert.equal(core.committeeShare({...base,status:'unavailable'}).label,'—');
  assert.equal(core.committeeShare({...base,individualContributions:0,otherCommitteeContributions:0,partyCommitteeContributions:0}).label,'—');
});

test('small nonzero dollar amounts are never displayed as reported zero',()=>{
  assert.equal(core.money(0),'$0');
  for(const amount of [0.01,0.25,-0.01,-0.25])assert.doesNotMatch(core.money(amount),/^-?\$0(?:\.00)?$/);
  assert.equal(core.money(null),'Not reported');
});

test('card exposes snapshot, field definitions, balances, transfers, and missing reasons',()=>{
  const person=data.politicians.find(p=>p.finance.status==='available');
  const html=core.card(person,data.meta);
  assert.match(html,/Snapshot Sep 8, 2026 · bundled records, not live/);
  assert.match(html,/Compare FEC registrants/);
  assert.doesNotMatch(html,/Compare with their opponents/);
  for(const field of ['TTL_INDIV_CONTRIB','OTHER_POL_CMTE_CONTRIB','POL_PTY_CONTRIB','TTL_RECEIPTS','COH_COP','TRANS_FROM_AUTH','TRANS_TO_AUTH'])assert.match(html,new RegExp(field));
  assert.match(html,/balance, not money raised/);
  assert.match(html,/outgoing funds, not contributions received/);
  const unavailable=core.card({...person,finance:{status:'unavailable',receipts:123,unavailableReason:'No match <script>bad</script>'}},data.meta);
  assert.match(unavailable,/No match &lt;script&gt;bad&lt;\/script&gt;/);
  assert.doesNotMatch(unavailable,/<script>|\$123/);
  assert.match(unavailable,/Missing data does not mean zero/);
  const partial=core.card({...person,finance:{...person.finance,otherCommitteeContributions:null}},data.meta);
  assert.match(partial,/does not report the other political committee category/);
});

test('dates reject invalid or incomplete values without inventing a period',()=>{
  for(const value of [null,undefined,123,'bad','2026-02-30','2026-13-01','2026-09'])assert.equal(core.date(value),'Not reported');
  assert.equal(core.date('2026-09-08T14:49:03.1845010Z'),'Sep 8, 2026');
});
