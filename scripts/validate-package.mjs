import {readFile,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'../dist');
const manifest=JSON.parse(await readFile(resolve(root,'manifest.json'),'utf8'));
assert.equal(manifest.manifest_version,3);
assert.ok(manifest.name.length<=75 && manifest.description.length<=132);
assert.deepEqual(manifest.permissions,['activeTab','scripting']);
assert.equal(manifest.host_permissions,undefined);
for(const [size,path] of Object.entries(manifest.icons)){const bytes=await readFile(resolve(root,path));assert.equal(bytes.readUInt32BE(16),Number(size));assert.equal(bytes.readUInt32BE(20),Number(size));}
for(const path of [manifest.action.default_popup,manifest.background.service_worker,'core.js','content.js','dataset.js','card-style.js','compare.html','races.js'])assert.ok((await stat(resolve(root,path))).size>0);
const source=(await Promise.all(['content.js','core.js','popup.js','background.js','compare.js'].map(p=>readFile(resolve(root,p),'utf8')))).join('\n');
assert.doesNotMatch(source,/\beval\s*\(|\bnew Function\s*\(|\bfetch\s*\(|\bXMLHttpRequest\b/);
console.log('Manifest, icon sizes, required files, permissions, and local-only runtime checks passed. Actual Chrome validation is still required.');
