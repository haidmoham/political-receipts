const $=id=>document.getElementById(id);
let tab,origin,scriptId;
const files=['dataset.js','core.js','card-style.js','content.js'];
const report=t=>$('status').textContent=t;
async function scan(){try{await chrome.scripting.executeScript({target:{tabId:tab.id},files});const [result]=await chrome.scripting.executeScript({target:{tabId:tab.id},func:()=>globalThis.__receiptsStatus?.()});report(`${result.result?.count || 0} names highlighted. Hover or focus a name to see its receipt.`);}catch{report('This page cannot be scanned. Try a normal article tab. Chrome settings and store pages are protected.');}}
$('scan').addEventListener('click',scan);
$('clear').addEventListener('click',async()=>{try{await chrome.scripting.executeScript({target:{tabId:tab.id},func:()=>globalThis.__receiptsStop?.()});report('Highlights removed from this page.');}catch{report('No accessible page to clear.');}});
$('auto').addEventListener('click',async()=>{
  if(!origin)return;
  try{
    const enabled=$('auto').getAttribute('aria-pressed')==='true';
    if(enabled){await chrome.scripting.unregisterContentScripts({ids:[scriptId]});try{await chrome.scripting.executeScript({target:{tabId:tab.id},func:()=>globalThis.__receiptsStop?.()});}catch{}await chrome.permissions.remove({origins:[origin]});report('Automatic scanning stopped here. Reload other open pages on this site to stop their existing scans.');}
    else if(await chrome.permissions.request({origins:[origin]})){await chrome.scripting.registerContentScripts([{id:scriptId,matches:[origin],js:files,runAt:'document_idle',persistAcrossSessions:true}]);await scan();}
    const scripts=await chrome.scripting.getRegisteredContentScripts({ids:[scriptId]});$('auto').setAttribute('aria-pressed',String(scripts.length>0));$('auto').textContent=scripts.length?'On':'Off';
  }catch{report('Site access could not be changed. Try again from a regular web page.');}
});
$('search').addEventListener('input',()=>{
  const q=$('search').value.trim().toLowerCase();$('results').replaceChildren();if(q.length<2)return;
  const results=RECEIPTS_DATA.politicians.filter(p=>`${p.name} ${p.aliases.join(' ')} ${p.state} ${p.party}`.toLowerCase().includes(q)).slice(0,6);
  for(const p of results){const button=document.createElement('button');button.className='result';button.innerHTML=`${ReceiptsCore.escape(p.name)}<span>${ReceiptsCore.escape(p.state)} · ${ReceiptsCore.escape(p.chamber)}</span>`;button.addEventListener('click',()=>chrome.tabs.create({url:chrome.runtime.getURL(`receipt.html?id=${encodeURIComponent(p.id)}`)}));$('results').append(button);}
  if(!results.length)$('results').textContent='No supported member found.';
});
$('coverage').textContent=`${RECEIPTS_DATA.politicians.length} members · ${RECEIPTS_DATA.meta.cycle} cycle · Snapshot ${ReceiptsCore.date(RECEIPTS_DATA.meta.retrievedAt)}`;
(async()=>{[tab]=await chrome.tabs.query({active:true,currentWindow:true});try{const url=new URL(tab.url);if(!['http:','https:'].includes(url.protocol))throw Error();origin=`${url.protocol}//${url.hostname}/*`;scriptId=`site-${Array.from(origin,c=>c.charCodeAt(0).toString(16).padStart(2,'0')).join('')}`;$('site-name').textContent=url.hostname;const scripts=await chrome.scripting.getRegisteredContentScripts({ids:[scriptId]});$('auto').setAttribute('aria-pressed',String(scripts.length>0));$('auto').textContent=scripts.length?'On':'Off';}catch{$('auto').disabled=true;$('site-name').textContent='Open a normal web page first.';}})();
