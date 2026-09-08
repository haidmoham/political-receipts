import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';

const core = await readFile(new URL('../src/core.js', import.meta.url), 'utf8');
const content = await readFile(new URL('../src/content.js', import.meta.url), 'utf8');
async function setup(t) {
  const dom = new JSDOM('<button id="before">Before</button><p>Ted Cruz speaks.</p><button id="after">After</button>', {runScripts:'outside-only', pretendToBeVisual:true});
  t.after(()=>dom.window.close());
  const w=dom.window;
  let shadow;
  const attach=w.Element.prototype.attachShadow;
  w.Element.prototype.attachShadow=function(options){shadow=attach.call(this,options);return shadow;};
  w.eval(core);
  w.ReceiptsCore.card=p=>`<h2>${p.name}</h2><details><summary>Details</summary><p>Definition</p></details><a href="https://www.fec.gov/">Source</a>`;
  w.RECEIPTS_DATA={politicians:[{id:'cruz',name:'Ted Cruz'},{id:'sanders',name:'Bernie Sanders'}],meta:{}};
  w.RECEIPTS_CSS='';
  await w.eval(content);
  return {w,shadow,mark:()=>w.document.querySelector('[data-receipts-id]'),tick:()=>new Promise(r=>w.setTimeout(r,200))};
}
const key=(w,node,key,shiftKey=false)=>node.dispatchEvent(new w.KeyboardEvent('keydown',{key,shiftKey,bubbles:true,cancelable:true,composed:true}));

test('page text updates replace the original identity, including child replacement',async t=>{
  const h=await setup(t);
  h.mark().firstChild.data='Bernie Sanders';
  await h.tick();
  h.mark().focus();
  assert.equal(h.shadow.querySelector('h2').textContent,'Bernie Sanders');
  h.mark().textContent='Unrelated person';
  await h.tick();
  assert.equal(h.mark(),null);
  assert.equal(h.shadow.querySelector('.popover'),null);
});

test('page-controlled identity attributes cannot substitute receipt identity',async t=>{
  const h=await setup(t);
  h.mark().dataset.receiptsId='sanders';
  h.mark().focus();
  assert.equal(h.shadow.querySelector('h2').textContent,'Ted Cruz');
});

test('keyboard card boundaries return to the reading position',async t=>{
  const h=await setup(t);
  const mark=h.mark();mark.focus();key(h.w,mark,'Tab');
  assert.equal(h.shadow.activeElement,h.shadow.querySelector('.close'));
  key(h.w,h.shadow.activeElement,'Tab',true);
  assert.equal(h.w.document.activeElement,mark);
  assert.equal(h.shadow.querySelector('.popover'),null);
  key(h.w,mark,'Enter');
  const source=h.shadow.querySelector('a');source.focus();key(h.w,source,'Tab');
  assert.equal(h.w.document.activeElement,h.w.document.getElementById('after'));
  assert.equal(h.shadow.querySelector('.popover'),null);
});

test('stop removes marks and queued scans; reinjection has one active scanner',async t=>{
  const h=await setup(t);
  h.w.document.querySelector('p').append(' Bernie Sanders');
  h.w.__receiptsStop();await h.tick();
  assert.equal(h.mark(),null);
  assert.equal(h.w.document.querySelector('#shin86-receipts'),null);
  await h.w.eval(content);
  assert.equal(h.w.__receiptsStatus().count,2);
  h.mark().focus();key(h.w,h.mark(),'Enter');
  key(h.w,h.w.document,'Escape');
  assert.equal(h.w.document.activeElement,h.mark());
  assert.equal(h.mark().getAttribute('aria-expanded'),'false');
});
