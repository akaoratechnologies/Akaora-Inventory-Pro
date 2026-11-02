/* Akaora Inventory Pro v77: one enhancement layer; no changes to customer/stock/printing data. */
(function(){
'use strict';
const themeNames=['purple','blue','green','rose','amber'];
const iconNames=['minimal','rounded','bold'];
const quick=[['home','Home','home'],['products','Stock','stock'],['billing','Billing','receipt'],['printer','Print','printer']];
const featured=[['invoiceStudio','Studio','Design receipts','receipt'],['bills','Bills','Sales history','file'],['settings','Settings','Personalize app','settings']];
const operations=[
 ['reports','Reports','chart'],['customers','Customers','users'],['parties','Parties','users'],
 ['purchases','Purchases','package'],['expenses','Expenses','wallet'],['accounts','Accounts','wallet'],
 ['quotations','Quotations','file'],['staff','Staff & payroll','users'],['offers','Offers','tag'],
 ['coupons','Coupons','tag']
];
const shapes={
 home:'<rect x="3" y="3" width="8" height="8" rx="1.8"/><rect x="13" y="3" width="8" height="8" rx="1.8"/><rect x="3" y="13" width="8" height="8" rx="1.8"/><rect x="13" y="13" width="8" height="8" rx="1.8"/>',
 stock:'<path d="m12 2 9 5-9 5-9-5 9-5ZM3 7v10l9 5 9-5V7M12 12v10"/>',
 receipt:'<path d="M5 3h14v18l-3.5-2.2L12 21l-3.5-2.2L5 21V3Z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
 printer:'<path d="M6 8V3h12v5M6 17H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6Z"/>',
 more:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
 file:'<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7Z"/><path d="M13 2v7h7M8 14h8M8 18h8"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M9.7 3.4 10 2h4l.3 1.4 2 1 .9-.6 2.8 2.8-.7 1.1 1 2 1.7.4v4l-1.7.3-1 2 .7 1.1-2.8 2.8-1-.7-2 1-.2 1.4h-4l-.4-1.4-2-1-1 .7-2.8-2.8.7-1.1-1-2L2 14v-4l1.5-.4 1-2-.6-1.1 2.8-2.8 1.1.6 1.9-1Z"/>',
 chart:'<path d="M4 20V12M9 20V6M14 20v-9M19 20V3M2 21h20"/>',
 users:'<circle cx="9" cy="8" r="4"/><path d="M2 21v-2a7 7 0 0 1 14 0v2M17 5a4 4 0 0 1 0 7M18 15a5 5 0 0 1 4 5"/>',
 package:'<path d="m12 2 9 5-9 5-9-5 9-5ZM3 7v10l9 5 9-5V7"/>',
 wallet:'<rect x="2" y="6" width="20" height="14" rx="3"/><path d="M4 6V4a2 2 0 0 1 2-2h13M16 11h6v5h-6a2.5 2.5 0 0 1 0-5Z"/>',
 tag:'<path d="M3 10 10 3h11v11l-7 7a2 2 0 0 1-3 0l-8-8a2 2 0 0 1 0-3Z"/><circle cx="16.5" cy="7.5" r="1"/>',
 barcode:'<path d="M3 5v14M6 5v14M10 5v14M13 5v14M17 5v14M21 5v14"/>',
 close:'<path d="M5 5 19 19M19 5 5 19"/>',
 crown:'<path d="M3 8 7 12 12 5l5 7 4-4-2 11H5L3 8Z"/><path d="M5 21h14"/>',
 download:'<path d="M12 3v12m-5-5 5 5 5-5M4 20h16"/>',
 upload:'<path d="M12 17V5m-5 5 5-5 5 5M4 20h16"/>',
 plus:'<path d="M12 5v14M5 12h14"/>'
};
function svg(name,filled=false){return '<svg viewBox="0 0 24 24" fill="'+(filled?'currentColor':'none')+'" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(shapes[name]||shapes.file)+'</svg>'}
function pref(name,fallback){return (settings&&settings[name])||fallback}
function colorize(){
 const accent=themeNames.includes(pref('accentColor','purple'))?pref('accentColor','purple'):'purple';
 const icons=iconNames.includes(pref('iconStyle','rounded'))?pref('iconStyle','rounded'):'rounded';
 document.body.classList.remove(...themeNames.map(v=>'ak77-'+v),...iconNames.map(v=>'ak-icon-'+v));
 document.body.classList.add('ak77-'+accent,'ak-icon-'+icons);
}
let observedTopbar=null,topbarObserver=null;
function header(){
 const bar=document.querySelector('.topbar');const root=bar?.querySelector('.shop-top-brand');if(!root)return;
 // Legacy v44 can asynchronously reinsert a shortened mobile-only title.
 bar.querySelector('.ak44-mobile-brand')?.remove();
 // v44 hides .topbar-left on phones; move the full product identity out of it.
 const left=bar.querySelector('.topbar-left');
 if(window.matchMedia('(max-width:850px)').matches && root.parentElement!==bar){bar.insertBefore(root,bar.querySelector('.top-actions'))}
 else if(!window.matchMedia('(max-width:850px)').matches && root.parentElement===bar && left){left.prepend(root)}
 if(!root.querySelector('.ak77-product-row')){
  root.classList.add('ak77-product-identity');
  root.innerHTML='<span class="ak77-brand-icon">'+akaoraBrandMark()+'</span><span class="ak77-product-copy"><span class="ak77-product-row"><strong class="ak77-product-name">Akaora Inventory</strong><span class="ak77-pro">'+svg('crown',true)+' Pro</span></span><small class="ak77-product-subtitle">'+esc(profile?.shopName||'Business workspace')+'</small></span>';
 }
 if(observedTopbar!==bar){
  topbarObserver?.disconnect();observedTopbar=bar;
  topbarObserver=new MutationObserver(()=>{
   const legacy=bar.querySelector('.ak44-mobile-brand');if(legacy)legacy.remove();
   const product=bar.querySelector('.shop-top-brand');if(product&&!product.querySelector('.ak77-product-row'))header();
  });
  topbarObserver.observe(bar,{childList:true,subtree:true});
 }
}
function nav(){
 const root=document.querySelector('.mobile-nav');if(!root)return;
 const main=quick.some(([route])=>route===page);
 root.innerHTML=quick.map(([route,title,key])=>'<button type="button" data-ak77-nav="'+route+'" class="'+(page===route?'active':'')+'" aria-current="'+(page===route?'page':'false')+'">'+svg(key)+'<span>'+title+'</span></button>').join('')+'<button type="button" data-ak77-more="1" aria-label="More options" aria-haspopup="dialog" class="'+(main?'':'active')+'">'+svg('more')+'<span>More</span></button>';
 root.querySelectorAll('[data-ak77-nav]').forEach(btn=>btn.addEventListener('click',()=>go(btn.dataset.ak77Nav)));
 root.querySelector('[data-ak77-more]')?.addEventListener('click',openMore);
}
let lastMoreTrigger=null;
function closeMore(){document.querySelector('.ak77-more-backdrop')?.remove();document.body.classList.remove('ak77-modal-open');lastMoreTrigger?.focus?.();lastMoreTrigger=null}
function openMore(){
 document.querySelector('.ak77-more-backdrop')?.remove();
 lastMoreTrigger=document.activeElement;
 const backdrop=document.createElement('div');backdrop.className='ak77-more-backdrop';
 const tiles=featured.map(([route,title,hint,ic])=>'<button type="button" data-ak77-route="'+route+'" aria-current="'+(page===route?'page':'false')+'" class="ak77-featured-btn"><span class="ak77-feature-icon">'+svg(ic)+'</span><span class="ak77-feature-copy"><strong>'+title+'</strong><small>'+hint+'</small></span></button>').join('');
 const menuGroups=[
  ['Sales & customers',['reports','customers','parties']],
  ['Business operations',['purchases','expenses','accounts','quotations']],
  ['Team & tools',['staff','offers','coupons']]
 ];
 const items=menuGroups.map(([title,routes])=>'<div class="ak78-menu-group"><div class="ak77-more-section-title">'+title+'</div><div class="ak77-operations">'+routes.map(route=>{const entry=operations.find(x=>x[0]===route);if(!entry)return '';const [,label,ic]=entry;return '<button type="button" data-ak77-route="'+route+'" data-ak78-search="'+label.toLowerCase()+'" aria-current="'+(page===route?'page':'false')+'" class="ak77-operation">'+svg(ic)+'<span>'+label+'</span></button>'}).join('')+'</div></div>').join('');
 backdrop.innerHTML='<section class="ak77-more-panel" role="dialog" aria-modal="true" aria-labelledby="ak77-more-title"><div class="ak77-sheet-grip"></div><div class="ak77-more-heading"><div><h2 id="ak77-more-title">Your workspace</h2><p>Find a tool or open a section</p></div><button class="ak77-more-close" type="button" aria-label="Close menu">'+svg('close')+'</button></div><label class="ak78-menu-search-label" for="ak78-menu-search">Search tools</label><input id="ak78-menu-search" class="ak78-menu-search" type="search" placeholder="Search features..." autocomplete="off"><div class="ak78-featured-section"><div class="ak77-more-section-title">Quick access</div><div class="ak77-featured">'+tiles+'</div></div>'+items+'<p class="ak78-menu-empty" role="status" hidden>No matching tools. Try a different word.</p><div class="ak77-more-footer">'+svg('crown',true)+'<span>Akaora Inventory Pro</span></div></section>';
 const search=backdrop.querySelector('#ak78-menu-search');
 search.addEventListener('input',()=>{
  const term=search.value.trim().toLowerCase();let count=0;
  backdrop.querySelectorAll('[data-ak77-route]').forEach(el=>{const visible=!term||el.textContent.toLowerCase().includes(term);el.hidden=!visible;if(visible)count++});
  backdrop.querySelectorAll('.ak78-menu-group,.ak78-featured-section').forEach(group=>{group.hidden=!group.querySelector('[data-ak77-route]:not([hidden])')});
  backdrop.querySelector('.ak78-menu-empty').hidden=count!==0;
 });
 backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeMore()});
 backdrop.querySelector('.ak77-more-close').addEventListener('click',closeMore);
 backdrop.querySelectorAll('[data-ak77-route]').forEach(btn=>btn.addEventListener('click',()=>{const r=btn.dataset.ak77Route;closeMore();go(r)}));
 document.body.append(backdrop);document.body.classList.add('ak77-modal-open');
 backdrop.querySelector('[data-ak77-route="invoiceStudio"]')?.focus();
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('.ak77-more-backdrop')){e.preventDefault();closeMore()}});
function home(){
 if(page!=='home')return;
 const content=document.getElementById('content');const heading=content?.querySelector(':scope > .heading');if(!heading)return;
 let actions=heading.querySelector('.actions');
 if(actions&&!actions.querySelector('[data-ak77-import]')&&!Array.from(actions.querySelectorAll('button')).some(b=>/Import\s*\.akaora/i.test(b.textContent))){
  const input=document.createElement('input');input.type='file';input.accept='.akaora,.apora,application/json';input.hidden=true;input.setAttribute('aria-label','Import Akaora backup');input.addEventListener('change',()=>{if(input.files?.length)importData(input.files[0])});
  const button=document.createElement('button');button.type='button';button.className='secondary';button.dataset.ak77Import='1';button.innerHTML=svg('upload')+' Import .akaora';button.onclick=()=>input.click();
  actions.insertBefore(button,actions.querySelector('.amber')||null);actions.append(input);
 }
 const bottom=document.createElement('section');bottom.className='ak77-home-last';bottom.append(heading);content.append(bottom);
}
function customizer(){
 if(page!=='settings')return;
 const content=document.getElementById('content');if(!content||content.querySelector('#ak77UiCard'))return;
 const anchor=content.querySelector('.ak31-settings-main .ak32-pane')||content.querySelector('.settings-grid')||content.querySelector('.ak31-settings-main')||content;
 const card=document.createElement('section');card.className='card ak77-ui-card';card.id='ak77UiCard';
 const accent=pref('accentColor','purple'),icons=pref('iconStyle','rounded');
 const iconPreview=['home','stock','receipt','settings'].map(k=>'<span>'+svg(k)+'</span>').join('');
 card.innerHTML='<h3>'+svg('settings')+' UI Customize</h3><p class="ak77-ui-subtitle">Choose the colors and SVG icon style that suit your workspace. Changes apply immediately and are saved automatically.</p><div class="ak77-ui-form"><div class="ak77-ui-field"><label for="ak77-color">Accent color</label><select id="ak77-color">'+themeNames.map(n=>'<option value="'+n+'"'+(accent===n?' selected':'')+'>'+n[0].toUpperCase()+n.slice(1)+'</option>').join('')+'</select></div><div class="ak77-ui-field"><label for="ak77-icons">SVG icon style</label><select id="ak77-icons">'+iconNames.map(n=>'<option value="'+n+'"'+(icons===n?' selected':'')+'>'+n[0].toUpperCase()+n.slice(1)+'</option>').join('')+'</select><div class="ak77-preview-icon-set">'+iconPreview+'</div></div></div><div class="ak77-swatches" role="group" aria-label="Choose app color">'+themeNames.map((n,j)=>'<button class="ak77-swatch" type="button" data-ak77-color="'+n+'" aria-pressed="'+(accent===n)+'"><span class="ak77-swatch-dot" style="--swatch:'+['#9678ee','#4289ec','#20ad77','#e5668c','#d4a443'][j]+'"></span>'+n[0].toUpperCase()+n.slice(1)+'</button>').join('')+'</div>';
 anchor.prepend(card);
 function applyValue(field,value){
  settings[field]=value;save();colorize();
  const color=document.getElementById('ak77-color');const style=document.getElementById('ak77-icons');
  if(color)color.value=settings.accentColor||'purple';if(style)style.value=settings.iconStyle||'rounded';
  card.querySelectorAll('[data-ak77-color]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ak77Color===settings.accentColor)));
 }
 card.querySelector('#ak77-color').addEventListener('change',e=>applyValue('accentColor',e.target.value));
 card.querySelector('#ak77-icons').addEventListener('change',e=>applyValue('iconStyle',e.target.value));
 card.querySelectorAll('[data-ak77-color]').forEach(b=>b.addEventListener('click',()=>applyValue('accentColor',b.dataset.ak77Color)));
}
const oldApply=applyPreferences;
applyPreferences=function(){const v=oldApply.apply(this,arguments);colorize();return v};
const oldShell=appShell;
appShell=function(){const v=oldShell.apply(this,arguments);header();nav();colorize();return v};
const oldRender=pageRender;
pageRender=function(){const v=oldRender.apply(this,arguments);header();nav();home();customizer();colorize();return v};
colorize();
window.addEventListener('resize',header,{passive:true});
window.AkaoraV77UI={openMore,closeMore,refresh:()=>{header();nav();home();customizer();colorize()}};
})();
