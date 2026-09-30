import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
test('public lookup filters records and opens the selected member',async()=>{
  const html=await readFile(new URL('../src/index.html',import.meta.url),'utf8');
  const dom=new JSDOM(html,{runScripts:'outside-only',url:'https://receipts.shin86.dev/'});
  try{
    dom.window.RECEIPTS_DATA=JSON.parse(await readFile(new URL('../data/politicians.json',import.meta.url),'utf8'));
    dom.window.eval(await readFile(new URL('../src/core.js',import.meta.url),'utf8'));
    dom.window.eval(await readFile(new URL('../src/site.js',import.meta.url),'utf8'));
    const input=dom.window.document.getElementById('member-search');
    input.value='Ocasio-Cortez';input.dispatchEvent(new dom.window.Event('input'));
    const links=dom.window.document.querySelectorAll('.member');
    assert.equal(links.length,1);assert.match(links[0].href,/receipt.html\?id=O000172$/);
    input.value='zzzzzz';input.dispatchEvent(new dom.window.Event('input'));
    assert.equal(dom.window.document.querySelectorAll('.member').length,0);
    assert.match(dom.window.document.getElementById('result-count').textContent,/No matching/);
  }finally{dom.window.close();}
});

test('lookup exposes every member, resets pagination, and shows dated coverage',async()=>{
  const dom=new JSDOM(await readFile(new URL('../src/index.html',import.meta.url),'utf8'),{runScripts:'outside-only'});
  try{
    dom.window.RECEIPTS_DATA=JSON.parse(await readFile(new URL('../data/politicians.json',import.meta.url),'utf8'));
    for(const file of ['core.js','site.js'])dom.window.eval(await readFile(new URL(`../src/${file}`,import.meta.url),'utf8'));
    const doc=dom.window.document,more=doc.getElementById('show-more'),input=doc.getElementById('member-search');
    assert.equal(doc.querySelectorAll('.member').length,30);
    more.click();
    assert.equal(doc.querySelectorAll('.member').length,60);
    assert.equal(doc.activeElement,doc.querySelectorAll('.member')[30]);
    while(!more.hidden)more.click();
    assert.equal(doc.querySelectorAll('.member').length,dom.window.RECEIPTS_DATA.politicians.length);
    input.value='TX Senate';input.dispatchEvent(new dom.window.Event('input'));
    assert.equal(doc.querySelectorAll('.member').length,2);
    assert.match(doc.getElementById('snapshot-date').textContent,/Sep 8, 2026.*not live/);
    assert.match(doc.querySelector('.member').textContent,/Report through/);
    input.value='';input.dispatchEvent(new dom.window.Event('input'));
    assert.equal(doc.querySelectorAll('.member').length,30);
    const missing=dom.window.RECEIPTS_DATA.politicians.find(p=>p.finance.status==='unavailable');
    input.value=missing.name;input.dispatchEvent(new dom.window.Event('input'));
    assert.match(doc.getElementById('members').textContent,/Campaign summary unavailable/);
  }finally{dom.window.close();}
});

test('invalid receipt identity provides a working lookup recovery link',async()=>{
  const dom=new JSDOM(await readFile(new URL('../src/receipt.html',import.meta.url),'utf8'),{url:'https://receipts.test/receipt.html?id=invalid',runScripts:'outside-only'});
  try{
    dom.window.RECEIPTS_DATA={politicians:[]};
    dom.window.eval(await readFile(new URL('../src/receipt.js',import.meta.url),'utf8'));
    assert.match(dom.window.document.title,/Member not found/);
    assert.equal(dom.window.document.querySelector('#receipt a').getAttribute('href'),'index.html');
  }finally{dom.window.close();}
});

test('member deep links expose affiliation without encoding finance as party color',async()=>{
  const data=JSON.parse(await readFile(new URL('../data/politicians.json',import.meta.url),'utf8'));
  const html=await readFile(new URL('../src/receipt.html',import.meta.url),'utf8');
  for(const party of ['Democrat','Republican','Independent']) {
    const member=data.politicians.find(p=>p.party===party);
    const dom=new JSDOM(html,{url:`https://receipts.test/receipt.html?id=${member.id}`,runScripts:'outside-only'});
    try {
      dom.window.RECEIPTS_DATA=data;
      for(const file of ['core.js','receipt.js'])dom.window.eval(await readFile(new URL(`../src/${file}`,import.meta.url),'utf8'));
      const doc=dom.window.document;
      assert.equal(doc.getElementById('member-name').textContent,member.name);
      assert.equal(doc.querySelector('.party-label').textContent,party);
      assert.equal(doc.querySelector('.party-label').dataset.party,party==='Democrat'?'democrat':party==='Republican'?'republican':'neutral');
      assert.equal(doc.querySelector('.player-card').dataset.party,doc.querySelector('.party-label').dataset.party);
      assert.equal(doc.body.hasAttribute('data-party'),false);
      assert.match(doc.querySelector('.compare-action').href,new RegExp(`compare.html\\?id=${member.id}$`));
      assert.equal(dom.window.ReceiptsCore.partyKind('unknown'),'neutral');
      assert.match(doc.getElementById('record-snapshot').textContent,/Sep 8, 2026/);
    } finally {dom.window.close();}
  }
});
