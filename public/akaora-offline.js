/* Akaora Inventory Pro v81 - offline worker bootstrap. No cached credentials. */
(function(){
 'use strict';
 const state={supported:('serviceWorker' in navigator),status:'initializing'};
 window.AkaoraOffline=state;
 state.ready=(async()=>{
  if(!state.supported||!(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
   state.status='unsupported';return false;
  }
  try{
   const registration=await navigator.serviceWorker.register('./service-worker.js?v=82',{scope:'./'});
   await navigator.serviceWorker.ready;
   if(!navigator.serviceWorker.controller){
    await Promise.race([
     new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true})),
     new Promise(resolve=>setTimeout(resolve,5000))
    ]);
   }
   state.status=navigator.serviceWorker.controller?'ready':'limited';
   return !!navigator.serviceWorker.controller;
  }catch(error){
   state.status='unavailable';
   console.warn('[Akaora] Offline cache registration failed:',error);
   return false;
  }
 })();
})();
