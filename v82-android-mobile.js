/* v82 Android-style responsive presentation layer. No data persistence, pricing,
   Firebase, login, owner lock, or printing logic is changed by this module. */
(function(){
'use strict';
function enhanceHome(){
 const content=document.getElementById('content');
 if(!content || !content.classList.contains('ak78-home'))return;
 const section=content.querySelector('.ak78-kpi-section');
 if(!section)return;
 const cards=[...section.querySelectorAll('.ak78-priority-grid > .metric')];
 cards.forEach(card=>{
  const label=(card.querySelector('.metric-label')?.textContent||'').trim().toLowerCase();
  let kind='other';
  if(label.includes("today's sales"))kind='sales';
  else if(label.includes("today's profit")||label.includes("today's loss"))kind='profit';
  else if(label.includes('expenses'))kind='expenses';
  else if(label.includes('low stock'))kind='stock';
  card.dataset.ak82Kpi=kind;
 });
 // All amounts remain original v81 live values, not cached or duplicated text.
 section.querySelector('.ak78-section-heading h2')?.replaceChildren(document.createTextNode('Today'));
 content.querySelectorAll('.ak78-trend-grid .barwrap').forEach(bar=>{
  const parts=[...bar.querySelectorAll(':scope > span')];
  if(parts.length>=2){bar.setAttribute('role','img');bar.setAttribute('aria-label',parts.at(-1).textContent.trim()+': '+parts[0].textContent.trim());bar.title=bar.getAttribute('aria-label');}
 });
 if(!content.querySelector('.ak82-backup-heading')){
  const bottom=content.querySelector(':scope > .ak77-home-last');
  const panel=bottom?.querySelector('.heading');
  if(panel){
   const title=document.createElement('div');title.className='ak82-backup-heading';
   title.innerHTML='<h2>Backup & restore</h2><p>Keep a secure copy of your shop data.</p>';
   panel.insertBefore(title,panel.firstChild);
  }
 }
}
function decorateMore(backdrop){
 const panel=backdrop.querySelector('.ak77-more-panel');
 if(!panel || panel.querySelector('.ak82-account-tools'))return;
 const section=document.createElement('section');
 section.className='ak82-account-tools';
 section.innerHTML='<div class="ak77-more-section-title">Account & security</div><div class="ak77-operations">'+
  '<button type="button" class="ak77-operation" data-ak82-action="account" aria-label="Open account"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></svg><span>Account</span></button>'+
  '<button type="button" class="ak77-operation" data-ak82-action="lock" aria-label="Lock workspace"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg><span>Lock workspace</span></button></div>';
 const footer=panel.querySelector('.ak77-more-footer');
 if(footer)footer.before(section);else panel.append(section);
 section.addEventListener('click',e=>{
  const target=e.target.closest('[data-ak82-action]');if(!target)return;
  const action=target.dataset.ak82Action;
  window.AkaoraV77UI?.closeMore?.();
  if(action==='account')document.querySelector('header.topbar .account-trigger')?.click();
  else if(action==='lock')document.querySelector('header.topbar #ak80TopbarLock')?.click();
 });
 // Existing More search still works; also include the two new shortcuts.
 const search=panel.querySelector('#ak78-menu-search');
 if(search){search.addEventListener('input',()=>{
  const term=search.value.trim().toLowerCase();
  let count=0;
  section.querySelectorAll('[data-ak82-action]').forEach(btn=>{
   const show=!term||btn.textContent.toLowerCase().includes(term);
   btn.hidden=!show;
   if(show)count++;
  });
  section.hidden=count===0;
  const oldEmpty=panel.querySelector('.ak78-menu-empty');
  if(oldEmpty && count>0)oldEmpty.hidden=true;
 });}
}
const observer=new MutationObserver(records=>{
 for(const record of records){
  for(const node of record.addedNodes){
   if(node.nodeType===1 && node.classList.contains('ak77-more-backdrop'))decorateMore(node);
  }
 }
});
function boot(){
 if(document.body)observer.observe(document.body,{childList:true});
 decorateMore(document.querySelector('.ak77-more-backdrop')||document.createElement('div'));
 enhanceHome();
}
if(typeof pageRender==='function'){
 const previous=pageRender;
 pageRender=function(){const result=previous.apply(this,arguments);enhanceHome();return result};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.AkaoraV82Mobile={enhanceHome,decorateMore};
})();
