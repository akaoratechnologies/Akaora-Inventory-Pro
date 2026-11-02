/* Akaora Inventory Pro v89 — professional account popup */
(function(){
 function $(sel){return document.querySelector(sel)}
 function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
 function renderAccountModal(){
   const auth=window.AkaoraAuth;
   if(!auth)return;
   if(!(window.AkaoraEmailGate&&window.AkaoraEmailGate.canAccess&&window.AkaoraEmailGate.canAccess())){
     if(typeof auth._originalOpen==='function')return auth._originalOpen();
     return;
   }
   const user=auth.user||{};
   const email=user.email||'';
   const initial=(email||'A').trim().charAt(0).toUpperCase()||'A';
   const shop=(typeof profile!=='undefined'&&profile&&profile.shopName)||'Your workspace';
   const owner=(typeof profile!=='undefined'&&profile&&profile.owner)||'Owner';
   const status=auth.offline?'Offline ready':'Connected';
   const statusNote=auth.offline?'You can continue working on this device even without internet after verified sign-in.':'Your account is active and synced session checks are available.';
   const syncNote=auth.offline?'Some cloud-only features may wait until internet is available again.':'You can securely continue in the app, switch pages, or sign out anytime.';
   const modal=$('#modalback .modal');
   $('#modalTitle').textContent='My account';
   $('#modalBody').innerHTML=`<section class="ak89-account-sheet"><div class="ak89-account-top"><div class="ak89-account-id"><div class="ak89-account-avatar">${esc(initial)}</div><div class="ak89-account-copy"><div class="ak89-account-eyebrow">Akaora Inventory Pro</div><h2 class="ak89-account-title">My account</h2><div class="ak89-account-email">Signed in as ${esc(email)}</div></div></div><button type="button" class="secondary ak89-account-close" aria-label="Close account panel" onclick="closeModal()">✕</button></div><div class="ak89-account-grid"><div class="ak89-account-stat"><strong>Workspace</strong><span>${esc(shop)}</span></div><div class="ak89-account-stat"><strong>Owner</strong><span>${esc(owner)}</span></div><div class="ak89-account-stat"><strong>Session status</strong><span>${esc(status)}</span></div><div class="ak89-account-stat"><strong>Security</strong><span>Verified email sign-in</span></div></div><div class="ak89-account-note"><strong style="display:block;color:var(--text);margin-bottom:6px">Professional access panel</strong>${esc(statusNote)} ${esc(syncNote)}</div></section>`;
   $('#modalFoot').innerHTML=`<div class="ak89-account-footer-actions"><button type="button" class="secondary" id="ak89BackToApp">Back to app</button><button type="button" class="danger" id="ak89SignOut">Sign out</button></div>`;
   $('#modalback').style.display='flex';
   modal.classList.add('ak89-account-modal-wrap');
   $('#ak89BackToApp').onclick=()=>closeModal();
   $('#ak89SignOut').onclick=async()=>{ closeModal(); try{ await auth.logout(); }catch(e){ console.error(e);} };
 }
 const oldClose=window.closeModal;
 if(typeof oldClose==='function'&&!oldClose._ak89Wrapped){
   window.closeModal=function(){const modal=$('#modalback .modal'); if(modal) modal.classList.remove('ak89-account-modal-wrap'); return oldClose.apply(this,arguments)};
   window.closeModal._ak89Wrapped=true;
 }
 function install(){
   const auth=window.AkaoraAuth;
   if(!auth||auth._ak89Wrapped)return false;
   auth._originalOpen=typeof auth.open==='function'?auth.open.bind(auth):null;
   auth.open=renderAccountModal;
   auth._ak89Wrapped=true;
   return true;
 }
 if(!install()){
   let tries=0;
   const t=setInterval(()=>{tries++; if(install()||tries>120) clearInterval(t)},250);
 }
})();
