import {cp,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
await mkdir(resolve(root,'site-dist'),{recursive:true});
for(const file of ['index.html','site.js','theme.css','demo.html','demo.css','demo.js','receipt.html','receipt.css','receipt.js','compare.html','compare.css','compare.js','privacy.html','core.js','content.js','card.css','card-style.js','dataset.js','races.js','portraits','icons']) await cp(resolve(root,'dist',file),resolve(root,'site-dist',file),{recursive:true});
await writeFile(resolve(root,'site-dist/_headers'),'/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n');
console.log('Built public Receipts site.');
