/* Akaora Inventory Pro v81 — change-triggered legacy-schema-compatible sync.
 * Keeps the v66 Firestore document format; no wholesale data migration.
 * Firestore usage varies with actual record mutations, not dashboard refreshes.
 */
const SYNC_KEYS=['apora_profile','apora_products','apora_invoices','apora_parties','apora_expenses','apora_purchases','apora_moves','apora_settings','apora_staff','apora_attendance','apora_advances','apora_attendanceLogs','apora_salaryPayments','apora_offers','apora_notifications','apora_quotations','apora_quotation_sequence','apora_accounts_v65','apora_coupons_v15'];
const OWNER_KEY='akaora_inventory_owner_uid_v1',META_KEY='akaora_cloud_sync_v66_meta',CHUNK=180000;
const watched=new Set(SYNC_KEYS),priority=new Set(['apora_products','apora_invoices','apora_accounts_v65','apora_quotations','apora_purchases','apora_expenses']);
const deviceId=(()=>{try{let v=sessionStorage.getItem('akaora_sync_device_v81');if(!v){v=crypto.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);sessionStorage.setItem('akaora_sync_device_v81',v)}return v}catch{return Date.now().toString(36)}})();
let sdk,db,uid='',started=false,ready=false,applying=false,disconnected=false,unsubscribe=null;
let syncTimer=null,pollTimer=null,refreshTimer=null,inflight=null,remoteQueue=Promise.resolve(),lastStatus='';
const baseline={},remoteIndex=new Map(),dirty=new Set(),conflicts=new Set();
let meta=readMeta();
function readMeta(){try{return JSON.parse(localStorage.getItem(META_KEY)||'{}')||{}}catch{return {}}}
function persistMeta(){try{localStorage.setItem(META_KEY,JSON.stringify(meta))}catch{}}
function clean(value,key=''){
 if(value==null||typeof value==='number'||typeof value==='boolean')return value;
 if(typeof value==='string'){
  if(/^data:image\//i.test(value)||/^blob:/i.test(value))return '';
  if(value.length>200000&&/base64|image|photo|logo|signature|watermark|attachment|document/i.test(key))return '';
  return value;
 }
 if(Array.isArray(value))return value.map(v=>clean(v,key)).filter(v=>v!==undefined);
 if(typeof value==='object'){
  const output={};for(const [k,v] of Object.entries(value)){
   if(/image|photo|avatar|logo|signature|watermark|binary|blob|bytes|cipher|attachment|staffDocuments|idDoc/i.test(k))continue;
   if(typeof Blob!=='undefined'&&(v instanceof Blob))continue;
   if(typeof ArrayBuffer!=='undefined'&&(v instanceof ArrayBuffer||ArrayBuffer.isView(v)))continue;
   output[k]=clean(v,k);
  }return output;
 }
 return undefined;
}
function localValue(key){const raw=localStorage.getItem(key);if(raw===null)return null;try{return clean(JSON.parse(raw),key)}catch{return clean(raw,key)}}
function preserveLocalAssets(incoming,previous){
 if(incoming===null||incoming===undefined)return incoming;
 if(Array.isArray(incoming)){
  const previousById=new Map(Array.isArray(previous)?previous.filter(x=>x&&typeof x==='object'&&x.id!=null).map(x=>[String(x.id),x]):[]);
  return incoming.map((item,index)=>{
   const old=item&&typeof item==='object'&&item.id!=null?previousById.get(String(item.id)):undefined;
   return preserveLocalAssets(item,old);
  });
 }
 if(typeof incoming==='object'){
  const original=previous&&typeof previous==='object'&&!Array.isArray(previous)?previous:{};
  const result={};
  for(const [k,v] of Object.entries(incoming))result[k]=preserveLocalAssets(v,original[k]);
  for(const [k,v] of Object.entries(original)){
   if(!Object.hasOwn(result,k)&&/image|photo|avatar|logo|signature|watermark|binary|blob|bytes|cipher|attachment|staffDocuments|idDoc/i.test(k))result[k]=v;
  }
  return result;
 }
 return incoming;
}
const stable=v=>JSON.stringify(v);
async function digest(value){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function status(state,message){lastStatus=state;window.AkaoraCloudSync={state,message,uid,flush:()=>requestFlush(0),get conflicts(){return [...conflicts]}};window.dispatchEvent(new CustomEvent('akaora-sync-status',{detail:{state,message}}))}
function refresh(){clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>window.AkaoraReloadSyncedWorkspace?.(),150)}
function requestFlush(delay=1300){if(!ready||disconnected||conflicts.size||!navigator.onLine)return;clearTimeout(syncTimer);syncTimer=setTimeout(()=>{void flush().catch(e=>status('error','Account sync temporarily unavailable; changes remain on this device.'))},delay)}
function markDirty(keys){for(const key of keys||[])if(watched.has(key))dirty.add(key);if(dirty.size)requestFlush(keys?.some?.(k=>priority.has(k))?250:1300)}
async function scan(){if(!ready||disconnected)return;for(const key of SYNC_KEYS){const hash=await digest(stable(localValue(key)));if(hash!==baseline[key])dirty.add(key)}if(dirty.size)requestFlush(500)}
function hasData(value){if(value==null)return false;if(Array.isArray(value))return value.length>0;if(typeof value==='object')return Object.keys(value).length>0;return value!==''}
async function remoteChange(doc){
 const key=doc.id;if(!watched.has(key))return;
 const remote=doc.data();if(!remote?.hash)return;
 remoteIndex.set(key,{hash:remote.hash,version:remote.version,chunks:Number(remote.chunks)||0});
 const value=localValue(key),localHash=await digest(stable(value));
 if(remote.hash===localHash){baseline[key]=remote.hash;meta[key]={hash:remote.hash,version:remote.version};persistMeta();dirty.delete(key);return}
 if(doc.metadata?.hasPendingWrites||remote.writer===deviceId){return}
 // Never overwrite local changes made since the last confirmed server version.
 // For a new browser with no metadata and populated records, require manual review.
 const previous=meta[key]?.hash;
 if(previous&&localHash!==previous&&previous===remote.hash){dirty.add(key);return} // Local edit, remote still at known version.
 if((previous&&localHash!==previous)||(!previous&&hasData(value))){
  const first=!conflicts.has(key);conflicts.add(key);dirty.delete(key);status('conflict','A different device changed shared data. Export a backup before resolving the conflict.');
  if(first&&typeof window.toast==='function')window.toast('Cloud sync paused: conflicting device changes. Export a backup.');return;
 }
 const count=Number(remote.chunks||0);if(count>495||count<1){status('error','Cloud data version requires support review.');return}
 const promises=[];for(let i=0;i<count;i++)promises.push(sdk.getDoc(sdk.doc(db,'users',uid,'akaoraSyncChunks',key+'__'+i)));
 const chunks=await Promise.all(promises);
 if(chunks.some((chunk,i)=>!chunk.exists()||chunk.data().version!==remote.version||Number(chunk.data().index)!==i))return;
 let incoming;try{incoming=JSON.parse(chunks.map(c=>c.data().data).join(''))}catch{return}
 // Guard against writes occurring while chunk downloads were in progress.
 if(await digest(stable(localValue(key)))!==localHash){dirty.add(key);return}
 applying=true;
 try{
  if(incoming===null)localStorage.removeItem(key);else localStorage.setItem(key,JSON.stringify(preserveLocalAssets(incoming,value)));
  baseline[key]=remote.hash;meta[key]={hash:remote.hash,version:remote.version};persistMeta();dirty.delete(key)
 }finally{applying=false}
 refresh();
}
async function upload(key){
 if(!ready||applying||conflicts.has(key))return;
 const value=localValue(key),json=stable(value),hash=await digest(json);
 if(hash===baseline[key]){dirty.delete(key);return}
 const current=remoteIndex.get(key);
 if(current?.hash===hash){baseline[key]=hash;meta[key]={hash,version:current.version};persistMeta();dirty.delete(key);return}
 const parts=[];for(let i=0;i<json.length;){let end=Math.min(i+CHUNK,json.length);if(end<json.length&&end>i){const unit=json.charCodeAt(end-1);if(unit>=0xD800&&unit<=0xDBFF)end--;}parts.push(json.slice(i,end));i=end;}if(!parts.length)parts.push('null');
 const oldChunks=Number(current?.chunks||0);if(parts.length+Math.max(0,oldChunks-parts.length)+1>490)throw Error('Backup too large for one sync batch');
 const version=deviceId+'-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),batch=sdk.writeBatch(db);
 parts.forEach((data,i)=>batch.set(sdk.doc(db,'users',uid,'akaoraSyncChunks',key+'__'+i),{data,version,index:i}));
 for(let i=parts.length;i<oldChunks;i++)batch.delete(sdk.doc(db,'users',uid,'akaoraSyncChunks',key+'__'+i));
 batch.set(sdk.doc(db,'users',uid,'akaoraSync',key),{key,chunks:parts.length,hash,version,writer:deviceId,updatedAt:sdk.serverTimestamp(),clientUpdatedAt:Date.now(),deleted:value===null});
 await batch.commit();remoteIndex.set(key,{chunks:parts.length,hash,version});baseline[key]=hash;meta[key]={hash,version};persistMeta();dirty.delete(key);
 if(await digest(stable(localValue(key)))!==hash)dirty.add(key);
}
async function flush(){
 if(!ready||!db||!uid||applying||disconnected||conflicts.size||!navigator.onLine)return;
 if(inflight)return inflight;
 inflight=(async()=>{
  const user=window.AkaoraFirebaseContext?.auth?.currentUser;
  if(!user||user.uid!==uid)return;
  if(!dirty.size)return;
  status('syncing','Saving your latest changes…');
  for(const key of [...dirty])await upload(key);
  status('synced','Latest changes saved');
 })();
 try{await inflight}finally{inflight=null;if(dirty.size&&!conflicts.size)requestFlush(1800)}
}
async function start(){
 if(started)return;
 const ctx=window.AkaoraFirebaseContext,user=ctx?.auth?.currentUser;
 if(!ctx||!user?.uid||!user.emailVerified||localStorage.getItem(OWNER_KEY)!==user.uid)return;
 started=true;uid=user.uid;status('connecting','Checking saved changes…');
 sdk=await import('https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js');
 try{db=sdk.initializeFirestore(ctx.app,{localCache:sdk.persistentLocalCache({tabManager:sdk.persistentMultipleTabManager()})})}catch{db=sdk.getFirestore(ctx.app)}
 for(const key of SYNC_KEYS)baseline[key]=meta[key]?.hash||null;
 const collection=sdk.collection(db,'users',uid,'akaoraSync');
 unsubscribe=sdk.onSnapshot(collection,{includeMetadataChanges:true},snapshot=>{
  remoteQueue=remoteQueue.then(async()=>{
   // Wait for a confirmed server snapshot before applying remote data or uploading.
   // Metadata-only server confirmations are delivered by includeMetadataChanges:true.
   if(snapshot.metadata.fromCache)return;
   const changes=ready?snapshot.docChanges():snapshot.docs.map(doc=>({type:'added',doc}));
   for(const change of changes){
    if(change.type==='removed')continue;await remoteChange(change.doc);
   }
   if(!ready&&!snapshot.metadata.fromCache){
    ready=true;
    for(const key of SYNC_KEYS){if(!remoteIndex.has(key)){baseline[key]=null;if(hasData(localValue(key)))dirty.add(key)}else if(await digest(stable(localValue(key)))!==baseline[key])dirty.add(key)}
    if(dirty.size&&!conflicts.size)requestFlush(350);
    else status('synced','Account data is up to date');
   }
  }).catch(()=>status('error','Account sync temporarily unavailable; changes remain local.'));
 },()=>status('error','Unable to connect account sync. Your local workspace is still available.'));
 pollTimer=setInterval(()=>{void scan().catch(()=>{})},15000);
 window.addEventListener('online',()=>{void scan().catch(()=>{})});
 window.addEventListener('akaora-local-changed',e=>markDirty(e.detail?.keys||[]));
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)void scan().catch(()=>{})});
 window.addEventListener('beforeunload',stop,{once:true});
}
function stop(){disconnected=true;clearTimeout(syncTimer);clearTimeout(refreshTimer);clearInterval(pollTimer);unsubscribe?.()}
window.addEventListener('akaora-auth-ready',()=>{void start().catch(()=>status('error','Account sync could not start. Your local records remain available.'))});
if(window.AkaoraFirebaseContext?.auth?.currentUser)void start().catch(()=>status('error','Account sync could not start. Your local records remain available.'));
