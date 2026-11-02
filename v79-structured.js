/* v78: presentation-only hierarchy over the existing functional v77 UI. */
(function(){
 'use strict';
 const S={
   chart:'<path d="M4 20V11M10 20V5M16 20v-8M22 20H2"/>',
   arrow:'<path d="M12 19V5m-6 6 6-6 6 6"/>',
   plus:'<path d="M12 5v14M5 12h14"/>',
   chevron:'<path d="m6 9 6 6 6-6"/>',
   spark:'<path d="m12 3 1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8L12 3Z"/>'
 };
 const icon=k=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(S[k]||S.spark)+'</svg>';
 function el(tag,classname,html){const e=document.createElement(tag);e.className=classname;if(html!==undefined)e.innerHTML=html;return e}
 function label(card){return (card.querySelector('.metric-label')?.textContent||'').trim().toLowerCase()}
 function enhanceHome(){
  if(page!=='home')return;
  const content=document.getElementById('content');
  if(!content||content.querySelector('.ak78-overview'))return;
  const profit=content.querySelector(':scope > .grid.metrics.profit-top');
  const basic=Array.from(content.querySelectorAll(':scope > .grid.metrics')).find(x=>x!==profit);
  if(!profit||!basic)return;
  const all=[...profit.children,...basic.children].filter(x=>x.classList.contains('metric'));
  if(all.length<4)return;
  const pick=(test)=>all.find(x=>!x.dataset.ak78Used&&test(label(x)));
  const primary=[];
  for(const match of [x=>x.includes("today's sales"),x=>/today's (profit|loss)/.test(x),x=>x.includes('today expenses')||x.includes("today's expenses"),x=>x.includes('low stock')]){
   const item=pick(match);if(item){item.dataset.ak78Used='1';primary.push(item)}
  }
  for(const item of all){if(primary.length>=4)break;if(!item.dataset.ak78Used){item.dataset.ak78Used='1';primary.push(item)}}
  const extra=all.filter(x=>!primary.includes(x));
  const welcome=el('header','ak78-overview');
  welcome.innerHTML='<div class="ak78-title-stack"><span class="ak78-kicker">BUSINESS DASHBOARD</span><h1>Overview</h1><p>Your important numbers in one place.</p></div><button type="button" class="ak78-new-bill">'+icon('plus')+'<span>New bill</span></button>';
  welcome.querySelector('button').addEventListener('click',()=>go('billing'));
  const current=el('section','ak78-kpi-section');
  current.innerHTML='<div class="ak78-section-heading"><div><span class="ak78-section-kicker">TODAY AT A GLANCE</span><h2>Key numbers</h2></div><span class="ak78-section-note">Live shop data</span></div>';
  const keyGrid=el('div','grid metrics ak78-priority-grid');primary.forEach(card=>keyGrid.appendChild(card));current.appendChild(keyGrid);
  const more=el('details','ak78-more-stats');
  more.innerHTML='<summary><span>'+icon('chart')+' More business metrics <small>Profit, stock and catalog</small></span>'+icon('chevron')+'</summary>';
  const otherGrid=el('div','grid metrics ak78-other-grid');extra.forEach(card=>otherGrid.appendChild(card));more.appendChild(otherGrid);
  // Desktop shows the entire scorecard. Mobile keeps the primary four immediately visible.
  more.open=window.matchMedia('(min-width:741px)').matches;
  profit.before(welcome,current,more);profit.remove();basic.remove();
  const charts=content.querySelector(':scope > .grid.cols');
  if(charts){
   const title=el('div','ak78-section-heading ak78-trend-heading','<div><span class="ak78-section-kicker">PERFORMANCE</span><h2>Trends & stock alerts</h2></div>');
   charts.before(title);charts.classList.add('ak78-trend-grid');
   for(const child of charts.children){if(child.classList.contains('card'))child.classList.add('ak78-trend-card')}
  }
  const history=Array.from(content.children).find(e=>e.classList?.contains('card')&&e.querySelector('h3')?.textContent.toLowerCase().includes('recent invoices'));
  if(history){history.classList.add('ak78-recent');history.insertAdjacentHTML('afterbegin','<div class="ak78-section-kicker">LATEST TRANSACTIONS</div>')}
  const last=content.querySelector(':scope > .ak77-home-last');
  if(last){last.classList.add('ak78-bottom-tools');const heading=last.querySelector('.heading');const eyebrow=heading?.querySelector('.ak33-eyebrow');if(eyebrow)eyebrow.textContent='WORKSPACE SHORTCUTS'}
  content.classList.add('ak78-home');
 }
 function enhanceSettings(){
  if(page!=='settings')return;
  const content=document.getElementById('content');if(!content)return;
  content.classList.add('ak78-settings');
  const card=content.querySelector('#ak77UiCard');
  if(card){
   card.querySelector('h3')?.classList.add('ak78-ui-heading');
   const prev=card.querySelector('.ak77-ui-subtitle');
   if(prev)prev.textContent='Pick a color and icon weight for your workspace. Changes are saved automatically.';
  }
  const general=content.querySelector('.ak32-pane[data-ak32-pane="0"]');
  if(general){
   const appearance=general.querySelector(':scope > .ak32-settings-card');
   // The theme comes first; personal color options follow it, and about info stays opt-in.
   if(card&&appearance&&appearance.nextElementSibling!==card)appearance.after(card);
   const about=general.querySelector('#akaora-v23-about');
   if(about&&!general.querySelector('.ak78-about-details')){
    const details=el('details','ak78-about-details');
    const summary=el('summary','',icon('chevron')+' <span>About Akaora Inventory Pro</span>');
    details.append(summary);about.before(details);details.appendChild(about);
   }
  }
  content.querySelectorAll('.ak32-pane-head').forEach(h=>h.classList.add('ak78-pane-head'));
  const rail=content.querySelector('.ak31-settings-rail');if(rail)rail.classList.add('ak78-settings-rail');
 }
 function enhanceOther(){
  const content=document.getElementById('content');if(!content||page==='home'||page==='settings')return;
  content.classList.add('ak78-workspace-content');
 }
 const prior=pageRender;
 pageRender=function(){const result=prior.apply(this,arguments);enhanceHome();enhanceSettings();enhanceOther();return result};
 // Support apps already rendered by bootstrapping before this script loads.
 if(document.getElementById('content')){enhanceHome();enhanceSettings();enhanceOther()}
 window.AkaoraV78UI={enhanceHome,enhanceSettings};
})();
