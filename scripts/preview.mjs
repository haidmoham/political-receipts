import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve(import.meta.dirname,'../dist');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png'};
const server=createServer(async(req,res)=>{try{const path=resolve(root,`.${decodeURIComponent(new URL(req.url,'http://localhost').pathname==='/'?'/demo.html':new URL(req.url,'http://localhost').pathname)}`);if(!path.startsWith(root+sep))throw Error();res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(await readFile(path));}catch{res.statusCode=404;res.end('Not found');}});
server.listen(Number(process.env.PORT||4178),'127.0.0.1',()=>console.log(`Receipts preview: http://127.0.0.1:${process.env.PORT||4178}/index.html`));
