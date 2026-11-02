/* v60: progressive motion enhancement. Keeps billing data, auth and print engines untouched. */
(function(){'use strict';
 const KEY='akaora-v60-glass-level';
 const levels=new Set(['full','light','off']);
 let level='full';try{const found=localStorage.getItem(KEY);if(levels.has(found))level=found}catch(e){}
 function applyGlass(){
   document.body.classList.toggle('v60-glass-light',level==='light');
   document.body.classList.toggle('v60-glass-off',level==='off');
 }
 applyGlass();
 function addControl(){
   const pane=document.getElementById('ak39-motion-pane');
   if(!pane || pane.querySelector('#v60-glass-level'))return;
   const card=pane.querySelector('.ak39-experience-card');if(!card)return;
   const wrapper=document.createElement('div');wrapper.className='v60-glass-preference';
   wrapper.innerHTML='<label for="v60-glass-level">Glass blur & transparency</label><select id="v60-glass-level" aria-label="Glass blur intensity"><option value="full">Full glass · immersive</option><option value="light">Light glass · faster</option><option value="off">No glass · maximum performance</option></select><p>Works across navigation, cards, editor and dialogs. Print previews and paper receipts remain sharp. Animation Off stops motion but retains your chosen glass appearance.</p>';
   const preview=card.querySelector('.ak39-motion-preview');if(preview)card.insertBefore(wrapper,preview);else card.appendChild(wrapper);
   const select=wrapper.querySelector('select');select.value=level;
   select.addEventListener('change',()=>{if(!levels.has(select.value))return;level=select.value;try{localStorage.setItem(KEY,level)}catch(e){}applyGlass()});
 }
 const activated=new WeakSet();
 let currentContent=null,contentObserver=null,scheduled=false,rootObserver=null;
 function motionEnabled(){return document.body.classList.contains('ak39-motion') && !document.body.classList.contains('reduce-motion') && document.body.dataset.ak39Motion!=='off' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches}
 function enhance(){
   scheduled=false;
   addControl();
   const c=document.getElementById('content');if(!c || c.dataset.syncStable==='true' || !motionEnabled())return;
   const selectors=[':scope > .heading',':scope > .grid.metrics > .metric',':scope > .grid > .card',':scope > .card',':scope > .ak31-settings-shell',':scope > #ak46-settings-pane',':scope > .ak46-studio',':scope > .ak32-settings-shell',':scope > .ak33-home-heading'];
   let targets=[];
   for(const selector of selectors){try{targets.push(...c.querySelectorAll(selector))}catch(e){}}
   // Stagger only visible page-level elements: never create hundreds of moving product rows.
   let index=0;
   for(const element of targets.slice(0,30)){
     if(activated.has(element) || element.closest('[hidden]') || element.hasAttribute('hidden'))continue;
     activated.add(element);element.classList.add('v60-arrive');
     element.style.setProperty('--v60-delay',String(Math.min(index++*48,288))+'ms');
   }
 }
 function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(enhance)}
 function bindContent(){
   const c=document.getElementById('content');
   if(c!==currentContent){
     contentObserver?.disconnect();currentContent=c;
     if(c){contentObserver=new MutationObserver(schedule);contentObserver.observe(c,{childList:true,subtree:false})}
   }
   schedule();
 }
 function initialize(){
   const root=document.getElementById('root');
   if(root){rootObserver=new MutationObserver(bindContent);rootObserver.observe(root,{childList:true,subtree:false})}
   bindContent();
   // The animation pane is inserted after rendering; watch only its own parent in addition to page changes.
   const watch=new MutationObserver(()=>{if(document.getElementById('ak39-motion-pane') && !document.getElementById('v60-glass-level'))schedule()});
   if(root)watch.observe(root,{childList:true,subtree:true});
   document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
 window.AkaoraV60={getGlass:()=>level,setGlass(next){if(!levels.has(next))return false;level=next;try{localStorage.setItem(KEY,level)}catch(e){}applyGlass();const input=document.getElementById('v60-glass-level');if(input)input.value=level;return true}};
})();
