/* Akaora Inventory Pro v80: one-click topbar owner lock, using the existing v39 security gate. */
(function(){
'use strict';
const LOCK_ICON='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10" width="14" height="11" rx="2.6"/><path d="M8.5 10V7a3.5 3.5 0 0 1 7 0v3"/></svg>';
function requestWorkspaceLock(){
 // Never replace the credential check with a cosmetic overlay.
 if(!window.AkaoraEmailGate?.canAccess?.())return;
 const security=window.AkaoraExperience;
 if(!security){if(typeof toast==='function')toast('Security is loading. Please try again.');return}
 if(settings?.adminLockScope==='app' && !!settings?.adminPasswordHash){
   security.lockNow(); // Existing owner PIN/password/pattern, recovery and attempt limits.
 }else{
   // Billing-only/disabled protection cannot secure the entire application.
   // Open the existing configuration instead of pretending that the screen is locked.
   security.openSecurity();
 }
}
function mountTopbarLock(){
 const actions=document.querySelector('header.topbar .top-actions');
 if(!actions||actions.querySelector('#ak80TopbarLock'))return;
 const button=document.createElement('button');
 button.type='button';button.id='ak80TopbarLock';
 button.className='secondary ak80-topbar-lock';
 button.setAttribute('aria-label','Lock workspace');
 button.title='Lock workspace · password, PIN or pattern';
 button.innerHTML=LOCK_ICON+'<span class="ak80-lock-label">Lock</span>';
 button.addEventListener('click',requestWorkspaceLock);
 const anchor=actions.querySelector('#akaoraNotifyButton, .account-trigger');
 actions.insertBefore(button,anchor||null);
}
// App shell is recreated on route changes. Inject the control after existing UI hooks.
if(typeof appShell==='function'){
 const previousShell=appShell;
 appShell=function(){const out=previousShell.apply(this,arguments);mountTopbarLock();return out};
}
if(typeof pageRender==='function'){
 const previousRender=pageRender;
 pageRender=function(){const out=previousRender.apply(this,arguments);mountTopbarLock();return out};
}
mountTopbarLock();
window.AkaoraQuickLock={mount:mountTopbarLock};
})();
