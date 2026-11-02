/* Akaora Inventory Pro v95 GitHub Pages compatible offline shell: mobile billing simplified, dashboard polished and backup actions aligned. */
const SHELL='akaora-inventory-shell-v95';
const SDK='akaora-firebase-modules-v70';
const ASSETS=[
 "./",
 "./index.html",
 "./v82-android-mobile.js",
 "./v82-android-mobile.css",
 "./v86-products-mobile.css",
 "./v87-unified-light.css",
 "./v88-light-modal-fixes.css",
 "./v89-toolbar-account-fixes.css",
 "./v89-toolbar-account-fixes.js",
 "./v90-responsive-stock.css",
 "./v90-responsive-stock.js",
 "./v91-light-contrast.css",
 "./v94-printer-settings.css",
 "./v94-printer-settings.js",
 "./v80-topbar-lock.js",
 "./v80-topbar-lock.css",
 "./v79-premium-mobile.css",
 "./v79-structured.css",
 "./v79-structured.js",
 "./v79-premium-mobile.js",
 "./manifest.webmanifest",
 "./icon-192.png",
 "./icon-512.png",
 "./akaora-offline.js",
 "./invoice-studio.css",
 "./invoice-studio.js",
 "./invoice-studio-v49.css",
 "./studio-workspace-v52.css",
 "./v60-glass-motion.css",
 "./v60-glass-motion.js",
 "./v62-typography-barcode.css",
 "./quotation-builder.css",
 "./quotation-builder.js",
 "./accounts-v65.css",
 "./accounts-v65.js",
 "./cloud-sync-v81.js"
];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(SHELL).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith('akaora-inventory-shell-')||k.startsWith('akaora-firebase-modules-')||k.startsWith('akaora-barcode-studio-')).filter(k=>k!==SHELL&&k!==SDK).map(k=>caches.delete(k)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;
 const url=new URL(req.url);
 const local=url.origin===self.location.origin;
 // Removed v62 standalone barcode editor must not be served from an old shell cache.
 if(local && /\/barcode-studio(?:\/|$)/.test(url.pathname)){
  event.respondWith(new Response('Removed: Advanced Barcode Studio is no longer included.',{
   status:410,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}
  }));return;
 }
 const firebaseModule=url.origin==='https://www.gstatic.com'&&url.pathname.startsWith('/firebasejs/13.1.0/');
 if(!local&&!firebaseModule)return; // Never cache Firebase Auth API responses or account credentials.
 if(firebaseModule){
  event.respondWith((async()=>{
   const cache=await caches.open(SDK);const saved=await cache.match(req);
   if(saved)return saved;
   const response=await fetch(req);
   if(response.ok||response.type==='opaque')event.waitUntil(cache.put(req,response.clone()).catch(()=>{}));
   return response;
  })());return;
 }
 // GitHub Pages project sites run at /<repository>/, not at domain root.
 // Derive the app base from this worker registration instead of assuming '/'.
 const scopePath = new URL(self.registration.scope).pathname;
 const relativePath = url.pathname.startsWith(scopePath) ? url.pathname.slice(scopePath.length) : null;
 if (relativePath === null) return;
 if (req.mode === 'navigate' && relativePath !== '' && relativePath !== 'index.html') return;
 event.respondWith((async()=>{
  const cache=await caches.open(SHELL);
  // Network-first for HTML navigations makes upgrades visible without deleting business data.
 // Cached files are still available during outages and on verified offline sessions.
  if(req.mode==='navigate'){
   try{const response=await fetch(req);if(response.ok)event.waitUntil(cache.put(req,response.clone()).catch(()=>{}));return response}
   catch(err){return (await cache.match(req,{ignoreSearch:true}))||(await cache.match('./index.html'))||Response.error()}
  }
  // Application shell uses cache-first except when the browser requests an explicit reload.
  // Versioned filename changes ensure older workers fetch the latest mobile UI.
  if(req.cache==='reload'||req.cache==='no-store'){
   try {const fresh=await fetch(req);if(fresh.ok)event.waitUntil(cache.put(req,fresh.clone()).catch(()=>{}));return fresh}
   catch(_){/* use offline cache */}
  }
  const saved=await cache.match(req,{ignoreSearch:true});
  if(saved)return saved;
  const response=await fetch(req);
  if(response.ok)event.waitUntil(cache.put(req,response.clone()).catch(()=>{}));
  return response;
 })());
});
