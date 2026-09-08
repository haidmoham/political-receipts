import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
const html=await readFile(new URL('../src/compare.html',import.meta.url),'utf8');
const scripts=await Promise.all(['../src/core.js','../src/compare.js'].map(p=>readFile(new URL(p,import.meta.url),'utf8')));
const data=JSON.parse(await readFile(new URL('../data/politicians.json',import.meta.url),'utf8'));
const races=JSON.parse(await readFile(new URL('../data/races.json',import.meta.url),'utf8'));
function open(id){const dom=new JSDOM(html,{url:`https://extension.test/compare.html?id=${id}`,runScripts:'outside-only'});dom.window.RECEIPTS_DATA=data;dom.window.RECEIPTS_RACES=races;for(const source of scripts)dom.window.eval(source);return dom;}
test('comparison shows same-seat registrants with explicit ballot limitation',()=>{const dom=open('O000172');try{const doc=dom.window.document;assert.equal(doc.getElementById('comparison').hidden,false);assert.ok(doc.querySelectorAll('option').length>0);assert.match(doc.querySelector('.notice').textContent,/not a confirmed ballot list/);assert.equal(doc.querySelectorAll('.mini-card').length,2);assert.equal(doc.querySelectorAll('#rows tr').length,4);const select=doc.getElementById('opponent');select.selectedIndex=1;select.dispatchEvent(new dom.window.Event('change'));assert.match(doc.getElementById('opponent-heading').textContent,/\S/);}finally{dom.window.close();}});
test('Senate seats not up do not manufacture opponent comparisons',()=>{const dom=open('C001098');try{const doc=dom.window.document;assert.equal(doc.getElementById('comparison').hidden,true);assert.match(doc.getElementById('empty').textContent,/not up for election/);assert.equal(doc.querySelectorAll('option').length,0);}finally{dom.window.close();}});
test('every registered candidate belongs to the same office state district and cycle',()=>{for(const r of races.races){if(r.status!=='registered-candidates'){assert.equal(r.candidates.length,0);continue;}const member=data.politicians.find(p=>p.id===r.memberId);for(const c of r.candidates){assert.equal(c.registration.electionYear,2026);assert.equal(c.registration.status,'C');assert.equal(c.registration.office,r.office);assert.equal(c.registration.state,r.state);assert.equal(c.registration.district,r.district);assert.ok(!member.fecIds.includes(c.fecId));}}});
