import {mkdir,readFile,writeFile,copyFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {deflateSync} from 'node:zlib';
const root=resolve(import.meta.dirname,'..'),out=resolve(root,'dist');
await mkdir(out,{recursive:true});
const manifest=JSON.parse(await readFile(resolve(root,'manifest.json'),'utf8'));
const dataset=JSON.parse(await readFile(resolve(root,'data/politicians.json'),'utf8'));
if(dataset.politicians.length<500 || !dataset.meta.sources.length)throw Error('Incomplete data snapshot');
for(const file of await readdir(resolve(root,'src')))await copyFile(resolve(root,'src',file),resolve(out,file));
await writeFile(resolve(out,'public-records.js'),`globalThis.RECEIPTS_RECORDS=${await readFile(resolve(root,'data/public-records.json'),'utf8')};`);
await writeFile(resolve(out,'manifest.json'),JSON.stringify(manifest,null,2));
const policy=JSON.parse(await readFile(resolve(root,'data/policy-context.json'),'utf8'));
const comparison=JSON.parse(await readFile(resolve(root,'data/party-comparison.json'),'utf8'));
const portraits=JSON.parse(await readFile(resolve(root,'data/portraits.json'),'utf8'));
await writeFile(resolve(out,'races.js'),`globalThis.RECEIPTS_RACES=${JSON.stringify(JSON.parse(await readFile(resolve(root,'data/races.json'),'utf8')))};`);
await mkdir(resolve(out,'portraits'),{recursive:true});
for(const portrait of portraits.portraits.filter(p=>p.status==='available'))await copyFile(resolve(root,portrait.path),resolve(out,`portraits/${portrait.id}.jpg`));
await writeFile(resolve(out,'dataset.js'),`globalThis.RECEIPTS_DATA=${JSON.stringify(dataset)};\nglobalThis.RECEIPTS_POLICY=${JSON.stringify(policy)};\nglobalThis.RECEIPTS_COMPARISON=${JSON.stringify(comparison)};\nglobalThis.RECEIPTS_PORTRAITS=${JSON.stringify(portraits.portraits.map(({id,status})=>({id,status})))};`);
await writeFile(resolve(out,'card-style.js'),`globalThis.RECEIPTS_CSS=${JSON.stringify(await readFile(resolve(root,'src/card.css'),'utf8'))};`);
// Deterministic original geometric icon. PNG encoding requires no runtime dependency.
const crcTable=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function chunk(type,data){const tag=Buffer.from(type),payload=Buffer.concat([tag,data]);let crc=0xffffffff;for(const b of payload)crc=crcTable[(crc^b)&255]^(crc>>>8);const length=Buffer.alloc(4),end=Buffer.alloc(4);length.writeUInt32BE(data.length);end.writeUInt32BE((crc^0xffffffff)>>>0);return Buffer.concat([length,payload,end]);}
function icon(size){const raw=Buffer.alloc((size*4+1)*size);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const X=x/size,Y=y/size,p=y*(size*4+1)+1+x*4;let c=[43,57,42,255];if(X>.20&&X<.80&&Y>.13&&Y<.85)c=[248,245,231,255];if(X>.3&&X<.7&&Y>.28&&Y<.35)c=[156,52,44,255];if(Y>.47&&Y<.72&&X>.3&&X<.7&&[0,1,4,6,7,10,13,14,17].includes(Math.floor((X-.3)*50)))c=[43,57,42,255];for(let i=0;i<4;i++)raw[p+i]=c[i];}const ih=Buffer.alloc(13);ih.writeUInt32BE(size);ih.writeUInt32BE(size,4);ih[8]=8;ih[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);}
await mkdir(resolve(out,'icons'),{recursive:true});for(const size of [16,32,48,128])await writeFile(resolve(out,`icons/${size}.png`),icon(size));
console.log(`Built ${manifest.name} ${manifest.version}: ${dataset.politicians.length} members, ${dataset.meta.counts.financeAvailable} finance records.`);
