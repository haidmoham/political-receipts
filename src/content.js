(async function () {
  if (globalThis.__receiptsRunning) return;
  globalThis.__receiptsRunning = true;
  const core = globalThis.ReceiptsCore, dataset = globalThis.RECEIPTS_DATA;
  const match = core.makeMatcher(dataset.politicians);
  // Page attributes are display hooks. Keep the receipt identity in isolated memory.
  const identities = new WeakMap();
  const host = document.createElement('div');
  host.id = 'shin86-receipts';
  const shadow = host.attachShadow({mode:'closed'});
  const sheet = document.createElement('style');
  sheet.textContent = globalThis.RECEIPTS_CSS;
  shadow.append(sheet);
  document.documentElement.append(host);
  const marks = new Set();
  let popover, active, hideTimer, observer, stopped = false, pending = new Set(), scheduled = false, suppressFocus = false;
  const listeners = new AbortController();
  const skip = 'a,button,input,textarea,select,option,script,style,noscript,code,pre,svg,canvas,[contenteditable]:not([contenteditable="false"]),[role="textbox"],[data-receipts-id],#shin86-receipts';
  function dismiss() { clearTimeout(hideTimer); popover?.remove(); popover = null; active?.setAttribute('aria-expanded','false'); active=null; }
  function closeAndRestore(){const mark=active;dismiss();suppressFocus=true;mark?.focus({preventScroll:true});suppressFocus=false;}
  const focusableSelector='a[href],button,input,select,textarea,summary,[tabindex]';
  function focusable(root){return [...root.querySelectorAll(focusableSelector)].filter(el=>{
    if(el.tabIndex<0 || el.disabled || el.closest('[hidden],[inert]'))return false;
    for(let parent=el;parent;parent=parent.parentElement){
      const style=getComputedStyle(parent);if(style.display==='none'||style.visibility==='hidden')return false;
      if(parent.tagName==='DETAILS'&&!parent.open&&!parent.querySelector('summary')?.contains(el))return false;
    }
    return true;
  }).sort((a,b)=>(a.tabIndex>0?a.tabIndex:Infinity)-(b.tabIndex>0?b.tabIndex:Infinity));}
  function leaveCard(){
    const mark=active,order=focusable(document),index=order.indexOf(mark),next=index>=0?order[index+1]:null;
    closeAndRestore();next?.focus();
  }
  function place() {
    if (!popover || !active?.isConnected) return dismiss();
    const r=active.getBoundingClientRect(), p=popover.getBoundingClientRect();
    const left=Math.max(12,Math.min(r.left,innerWidth-p.width-12));
    const below=r.bottom+10, above=r.top-p.height-10;
    const top=below+p.height<=innerHeight-12 ? below : Math.max(40,above);
    popover.style.left=`${left}px`;popover.style.top=`${top}px`;
  }
  function show(mark) {
    const identity=identities.get(mark);
    if(!identity || !mark.isConnected || mark.textContent!==identity.text){dismiss();return;}
    clearTimeout(hideTimer); if(active===mark)return;
    dismiss();active=mark;mark.setAttribute('aria-expanded','true');
    popover=document.createElement('div');popover.className='popover';
    const box=document.createElement('section');box.className='receipt';box.setAttribute('role','dialog');box.setAttribute('aria-label',`${identity.person.name} campaign receipt`);
    box.innerHTML=core.card(identity.person,dataset.meta);
    const close=document.createElement('button');close.className='close';close.textContent='Close ×';close.setAttribute('aria-label','Close receipt');close.addEventListener('click',closeAndRestore);
    popover.append(close,box);shadow.append(popover);place();
    popover.addEventListener('pointerenter',()=>clearTimeout(hideTimer));
    popover.addEventListener('pointerleave',scheduleHide);
    popover.addEventListener('focusin',()=>clearTimeout(hideTimer));
    popover.addEventListener('focusout',()=>{hideTimer=setTimeout(()=>{if(!shadow.activeElement)dismiss();},180);});
    popover.addEventListener('keydown',e=>{
      if(e.key!=='Tab')return;
      const controls=focusable(popover);
      if(e.shiftKey&&shadow.activeElement===controls[0]){e.preventDefault();closeAndRestore();}
      else if(!e.shiftKey&&shadow.activeElement===controls.at(-1)){e.preventDefault();leaveCard();}
    });
    box.addEventListener('toggle',place,true);
  }
  function scheduleHide(){hideTimer=setTimeout(()=>{if(!shadow.activeElement)dismiss();},220);}
  function scan(root) {
    if(stopped || marks.size>=1500)return;
    if(root.nodeType===1 && root.closest(skip))return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){return n.parentElement && !n.parentElement.closest(skip) && n.textContent.trim().length>4 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;}});
    const nodes=[];let node;while((node=walker.nextNode()))nodes.push(node);
    for(const n of nodes){
      if(marks.size>=1500)break;
      const hits=match(n.textContent);if(!hits.length)continue;
      const frag=document.createDocumentFragment();let end=0;
      for(const hit of hits){
        frag.append(document.createTextNode(n.textContent.slice(end,hit.start)));
        const mark=document.createElement('span');mark.dataset.receiptsId=hit.person.id;
        mark.textContent=n.textContent.slice(hit.start,hit.end);mark.tabIndex=0;mark.setAttribute('role','button');mark.setAttribute('aria-expanded','false');mark.setAttribute('aria-label',`${mark.textContent}: campaign finance receipt`);
        identities.set(mark,{person:hit.person,text:mark.textContent});
        mark.style.cssText='text-decoration-line:underline!important;text-decoration-style:dotted!important;text-decoration-color:#9d482e!important;text-underline-offset:4px!important;cursor:help!important;';
        mark.addEventListener('pointerenter',()=>show(mark));mark.addEventListener('pointerleave',scheduleHide);mark.addEventListener('focus',()=>{if(!suppressFocus)show(mark);});mark.addEventListener('blur',scheduleHide);mark.addEventListener('click',()=>show(mark));
        mark.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show(mark);popover?.querySelector('button')?.focus();}if(e.key==='Tab'&&!e.shiftKey&&popover){e.preventDefault();popover.querySelector('button').focus();}});
        marks.add(mark);frag.append(mark);end=hit.end;
      }
      frag.append(document.createTextNode(n.textContent.slice(end)));n.replaceWith(frag);
    }
  }
  function observe(){observer.observe(document.body,{childList:true,subtree:true,characterData:true});}
  function flush(){
    scheduled=false;if(stopped)return;observer.disconnect();
    for(const mark of marks){
      if(!mark.isConnected){if(active===mark)dismiss();marks.delete(mark);identities.delete(mark);continue;}
      if(mark.textContent!==identities.get(mark).text){
        if(active===mark)dismiss();
        pending.add(mark.parentElement);
        mark.replaceWith(...mark.childNodes);marks.delete(mark);identities.delete(mark);
      }
    }
    for(const root of pending){if(root?.isConnected)scan(root.nodeType===3?root.parentElement:root);}
    pending.clear();observe();
  }
  observer=new MutationObserver(changes=>{for(const c of changes){pending.add(c.target);if(c.type==='childList')for(const n of c.addedNodes)if(n.nodeType===1||n.nodeType===3)pending.add(n);}if(!scheduled&&pending.size){scheduled=true;setTimeout(flush,150);}});
  scan(document.body);observe();
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&active)closeAndRestore();},{signal:listeners.signal});
  document.addEventListener('pointerdown',e=>{if(e.target!==host && !e.target.closest?.('[data-receipts-id]'))dismiss();},{signal:listeners.signal});
  window.addEventListener('scroll',dismiss,{passive:true,signal:listeners.signal});window.addEventListener('resize',dismiss,{signal:listeners.signal});
  globalThis.__receiptsStatus=()=>({count:[...marks].filter(m=>m.isConnected).length,active:!stopped});
  globalThis.__receiptsStop=()=>{stopped=true;observer.disconnect();listeners.abort();pending.clear();dismiss();for(const m of marks)if(m.isConnected)m.replaceWith(document.createTextNode(m.textContent));marks.clear();host.remove();globalThis.__receiptsRunning=false;};
})();
