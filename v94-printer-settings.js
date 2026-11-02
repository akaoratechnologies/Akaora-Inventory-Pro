/* v94 Settings printer control: permission-safe Web Bluetooth device choice. */
(function(){
'use strict';
const CONFIG='akaora_printer_choice_v94';
let known=[];
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function getChoice(){try{const v=JSON.parse(localStorage.getItem(CONFIG)||'null');return v&&typeof v==='object'?v:{mode:'ble',paper:Number((typeof settings!=='undefined'&&settings?.blePaper)||58),deviceId:''}}catch(_){return {mode:'ble',paper:58,deviceId:''}}}
function setChoice(v){try{localStorage.setItem(CONFIG,JSON.stringify(v))}catch(_){}}
function current(){try{return window.AkaoraThermal?.status?.()||{connected:false,name:''}}catch(_){return {connected:false,name:''}}}
function refreshButtons(){
 const connected=current().connected;
 document.querySelectorAll('.ak94-printer-trigger').forEach(btn=>{
   const label=btn.querySelector('.ak94-printer-label'),dot=btn.querySelector('.ak94-printer-dot');
   if(label)label.textContent=connected?'Printer connected':'Connect printer';
   dot?.classList.toggle('on',connected);
 });
 const status=document.getElementById('ak94Status');
 if(status){const s=current();status.textContent=s.connected?'Connected · '+(s.name||'Bluetooth printer'):'Not connected';}
 const indicator=document.getElementById('ak94StatusDot');indicator?.classList.toggle('on',connected);
 const desc=document.getElementById('ak94StatusDetail');
 if(desc)desc.textContent=connected?'Connection established. Run a test print to confirm paper output.':'Select a compatible printer and connect. Bluetooth permission is handled by Chrome/Edge.';
 const disconnect=document.getElementById('ak94Disconnect');if(disconnect)disconnect.disabled=!connected;
}
function mount(){
 if(typeof page==='undefined'||page!=='settings')return;
 const content=document.getElementById('content');if(!content)return;
 content.querySelectorAll('.ak52-settings-handoff,.ak49-studio-link').forEach(n=>n.remove());
 const heading=content.querySelector('.ak31-settings-main > .heading,.ak32-settings-main > .heading,#content > .heading');
 if(!heading || heading.querySelector('.ak94-settings-entry'))return;
 let actions=heading.querySelector('.actions');
 if(!actions){actions=document.createElement('div');actions.className='actions';heading.append(actions)}
 const box=document.createElement('div');box.className='ak94-settings-entry';
 box.innerHTML='<button type="button" class="ak94-printer-trigger secondary"><span class="ak94-printer-dot"></span><span class="ak94-printer-label">Connect printer</span><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 9V4h12v5"/><rect x="3" y="9" width="18" height="10" rx="2"/><path d="M7 16h10v6H7v-6Z"/></svg></button>';
 box.querySelector('button').onclick=open;
 actions.append(box);refreshButtons();
}
function makeSelect(){
 const choice=getChoice();
 const select=document.getElementById('ak94Device');if(!select)return;
 const selected=select.value;
 const options=[['new','Find a new Bluetooth printer']];
 if(window.AkaoraAndroid?.enabled)options[0][1]='Choose printer in Android';
 known.forEach((d,i)=>options.push([String(i),d.name||'Unnamed Bluetooth device']));
 select.replaceChildren(...options.map(([id,name])=>{const el=document.createElement('option');el.value=id;el.textContent=name;return el}));
 if(known.length){const match=known.findIndex(d=>d.id===choice.deviceId);select.value=match>=0?String(match):'new'}
 else select.value='new';
 if(selected && select.querySelector('option[value="'+selected+'"]'))select.value=selected;
}
async function discover(){
 known=[];
 if(!window.AkaoraAndroid?.enabled && navigator.bluetooth?.getDevices){
   try{known=await navigator.bluetooth.getDevices()}catch(e){console.info('Previously allowed printer list unavailable:',e.message)}
 }
 if(document.getElementById('ak94Device'))makeSelect();
}
function open(){
 if(typeof page==='undefined'||page!=='settings'||typeof openModal!=='function')return;
 const choice=getChoice();
 const html=`<div class="ak94-chooser"><div class="ak94-chooser-status"><span class="ak94-printer-dot" id="ak94StatusDot"></span><div><div class="ak94-status-main" id="ak94Status">Not connected</div><div class="ak94-status-desc" id="ak94StatusDetail">Select your printer below.</div></div></div><div><label for="ak94Output">Printer type</label><select id="ak94Output"><option value="ble" ${choice.mode==='ble'?'selected':''}>Bluetooth thermal printer</option><option value="browser" ${choice.mode==='browser'?'selected':''}>System printer / PDF (browser print dialog)</option></select></div><div class="ak94-chooser-row" id="ak94BleSettings"><div><label for="ak94Paper">Paper width</label><select id="ak94Paper"><option value="58" ${Number(choice.paper)===58?'selected':''}>58 mm thermal</option><option value="80" ${Number(choice.paper)===80?'selected':''}>80 mm thermal</option></select></div><div><label for="ak94Device">Choose printer</label><select id="ak94Device"><option value="new">Find a new Bluetooth printer</option></select></div></div><div class="ak94-chooser-actions"><button type="button" class="amber" id="ak94Connect">Connect / Select</button><button type="button" class="secondary" id="ak94Disconnect">Disconnect</button></div><p id="ak94Message" role="status" aria-live="polite"></p><div class="ak94-printer-note">For Bluetooth, your browser or Android shows the real device permission picker. Only previously permitted devices can appear in this menu. System/PDF uses the browser print dialog and does not require Bluetooth pairing.</div></div>`;
 openModal('Printer connection',html,'Done',()=>{closeModal();refreshButtons()});
 const select=document.getElementById('ak94Output');
 const updateMode=()=>{const ble=select.value==='ble';document.getElementById('ak94BleSettings').hidden=!ble;document.getElementById('ak94Disconnect').hidden=!ble;document.getElementById('ak94Connect').textContent=ble?'Connect / Select':'Use system / PDF printer';};
 select.addEventListener('change',updateMode);updateMode();
 document.getElementById('ak94Connect').addEventListener('click',connectSelected);
 document.getElementById('ak94Disconnect').addEventListener('click',()=>{window.AkaoraThermal?.disconnect?.();refreshButtons();announce('Printer disconnected.')});
 refreshButtons();void discover();
}
function announce(message){const el=document.getElementById('ak94Message');if(el)el.textContent=message}
async function connectSelected(){
 const output=document.getElementById('ak94Output');if(!output)return;
 const mode=output.value;
 const paper=Number(document.getElementById('ak94Paper')?.value||58);
 const select=document.getElementById('ak94Device');
 const index=select?.value==='new'?-1:Number(select?.value||-1);
 const selected=index>=0?known[index]:null;
 const pref={mode,paper,deviceId:selected?.id||''};
 setChoice(pref);
 if(mode==='browser'){announce('System / PDF selected. Use Print / Save PDF from an invoice to choose your operating-system printer.');return}
 const api=window.AkaoraThermal;
 if(!api){announce('Printer engine is unavailable. Open Printing to check setup.');return}
 try{api.configure({width:paper});if(typeof settings==='object'&&settings){settings.blePaper=paper;if(typeof save==='function')save()}}catch(e){announce(e.message);return}
 const btn=document.getElementById('ak94Connect');if(btn){btn.disabled=true;btn.textContent='Connecting…'}
 // Important: the New device path invokes requestDevice synchronously with this click.
 try{
   const pending=selected?api.connectKnownDevice(selected):api.connect();
   const result=await pending;
   setChoice({mode:'ble',paper,deviceId:selected?.id||''});
   announce('Connected to '+(result.name||'Bluetooth printer')+'. Check the physical output with a test print.');
 }catch(e){announce('Connection failed: '+String(e?.message||e));}
 finally{if(btn){btn.disabled=false;btn.textContent='Connect / Select'}refreshButtons()}
}
const oldPageRender=window.pageRender;
if(typeof oldPageRender==='function')window.pageRender=function(){const value=oldPageRender.apply(this,arguments);if(typeof page!=='undefined'&&page==='settings')mount();return value};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
setInterval(()=>{if(typeof page!=='undefined'&&page==='settings')refreshButtons()},1800);
window.AkaoraPrinterSettingsV94={open,mount,refresh:refreshButtons};
})();
