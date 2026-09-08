import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
test('public lookup filters records and opens the selected member',async()=>{
  const html=await readFile(new URL('../src/index.html',import.meta.url),'utf8');
  const dom=new JSDOM(html,{runScripts:'outside-only',url:'https://receipts.shin86.dev/'});
  try{
    dom.window.RECEIPTS_DATA=JSON.parse(await readFile(new URL('../data/politicians.json',import.meta.url),'utf8'));
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
