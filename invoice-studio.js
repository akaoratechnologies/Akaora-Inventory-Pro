/* Akaora Inventory Pro v46 – Invoice Studio. Single invoice data model for screen and print. */
(function(){
'use strict';
const def={theme:'modern',paper:'A4',order:['header','customer','items','totals','footer'],showLogo:true,logoWidth:90,logoHeight:90,stretch:false,header:'',subheader:'',footer:'Thank you for your business!',footer2:'Please visit again.',documentTitle:'INVOICE',showAddress:true,showPhone:true,showGstin:true,showDate:true,showCustomer:true,showPayment:true,showOrder:true,fontFamily:'system',fontSize:13,headingSize:22,accentColor:'#7554ca',headerAlign:'left',lineSpacing:1.5,paperPadding:28,printSpeed:'balanced',printMode:'hybrid',receiptStyle:'centerClassic',includeLogoInText:true,logoPreset:'medium',logoCenter:true,logoAutoFit:true,headerAlignThermal:'center',footerAlignThermal:'center',itemsAlign:'left',totalsAlign:'right',storedLogoSlot:1,showPaymentQr:true,upiQrSize:200,receiptTerms:'',receiptPromo:'',paperSaver:'standard',showLogoPaperSaver:false,paperSaverContactAlign:'center',paperSaverInvoiceAlign:'center',paperSaverFooterAlign:'center'};
const AKAORA_FIXED_FOOTER='Powered By Akaora Technologies';
const sections={header:'Business header',customer:'Customer & details',items:'Itemized products',totals:'Totals & payment',footer:'Footer & message'};
const sv=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=(n)=>{const paths={bluetooth:'<path d="M7 7l10 10-5 4V3l5 4L7 17"/>',grip:'<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',receipt:'<path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3Z"/><path d="M8 8h8M8 12h8"/>',printer:'<path d="M6 8V3h12v5M6 17H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6Z"/>'};return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[n]||paths.receipt}</svg>`};
function config(){if(typeof settings==='undefined')return {...def};const saved=settings.invoiceStudio||{};const v={...def,...saved};if(v.printMode==='logo')v.printMode='hybrid';if(!Object.hasOwn(saved,'footer'))v.footer=settings.footer||def.footer;if(!Object.hasOwn(saved,'paper')){const original=String(settings.paper||'').toLowerCase();v.paper=original.includes('58')?'58mm':original.includes('80')?'80mm':'A4'}v.order=Array.isArray(saved.order)?saved.order.filter(t=>Object.hasOwn(sections,t)).concat(def.order.filter(t=>!saved.order.includes(t))):[...def.order];if(v.order.length!==5)v.order=[...def.order];return v}
function persist(v){settings.invoiceStudio=v;save()}
let selectedInvoiceId='demo';
function demoInvoice(){return {id:'preview-only',no:'DEMO-0001',date:new Date('2026-10-30T12:30:00').getTime(),customer:'Walk-in customer',method:'Cash',subtotal:567,discount:50,tax:0,total:517,paid:517,orderType:'Dine-in',tableNo:'T-04',restaurantOrder:true,items:[{name:'Margherita - Medium',qty:2,price:169,line:338},{name:'Shikarpur Lover - Medium',qty:1,price:229,line:229}]}}
function sample(){if(selectedInvoiceId==='demo-upi')return {...demoInvoice(),method:'UPI',paid:0};return selectedInvoiceId==='demo'?demoInvoice():(invById(selectedInvoiceId)||demoInvoice())}

function invById(id){return (typeof invoices!=='undefined'&&invoices.find(i=>String(i.id)===String(id)))||null}
function fmt(n){return '₹'+Number(n||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}
function payable(i){return Math.max(0,Number(i.total||0)-Number(i.paid||0))}
function safeLogo(){const v=settings?.shopLogo||window.AKAORA_BRAND_LOGO_DATA||'';return typeof v==='string'&&(/^(data:image\/(png|jpeg|webp);base64,)/i.test(v)||/^https:\/\//i.test(v))?v:''}
function details(i,c){const name=c.header||profile?.shopName||'Business';const address=[profile?.address,profile?.city,profile?.pin].filter(Boolean).join(', ');return {name,address,phone:profile?.phone||'',gstin:profile?.gstin||'',date:new Date(i.date||Date.now()).toLocaleString('en-IN'),customer:i.customer||'Walk-in customer',payment:(i.method||'Cash')+' / '+(payable(i)<.01?'Paid':i.paid>0?'Partial':'Due')};}
function sheetHTML(i,c){const D=details(i,c);const logo=safeLogo();const blocks={};blocks.header=`<header class="ak46-sheet-head"><div class="ak46-sheet-brand">${logo&&c.showLogo?`<div class="ak46-logo-box" style="width:${c.logoWidth}px;height:${c.logoHeight}px"><img alt="Shop logo" src="${sv(logo)}" style="object-fit:${c.stretch?'fill':'contain'}"></div>`:''}<div><h2>${sv(D.name)}</h2>${c.subheader?`<p>${sv(c.subheader)}</p>`:''}${c.showAddress&&D.address?`<p>${sv(D.address)}</p>`:''}${c.showPhone&&D.phone?`<p>${sv(D.phone)}</p>`:''}${c.showGstin&&D.gstin?`<p>GSTIN: ${sv(D.gstin)}</p>`:''}</div></div><div class="ak46-docmark"><b>${sv(c.documentTitle||'INVOICE')}</b><small>${sv(i.no||'')}</small>${c.showDate?`<br><small>${sv(D.date)}</small>`:''}</div></header>`;
blocks.customer=`<section class="ak46-sheet-meta">${c.showCustomer?`<div class="ak46-meta-block"><b>Customer</b>${sv(D.customer)}${i.customerPhone?`<br>${sv(i.customerPhone)}`:''}</div>`:''}${c.showPayment?`<div class="ak46-meta-block"><b>Payment</b>${sv(D.payment)}</div>`:''}${c.showOrder&&i.restaurantOrder?`<div class="ak46-meta-block"><b>Order</b>${sv(i.orderType||'Dine-in')}${i.tableNo?' · '+sv(i.tableNo):''}</div>`:''}</section>`;
blocks.items=`<table aria-label="Invoice line items"><thead><tr><th>Product</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>${(i.items||[]).map(x=>`<tr><td>${sv(x.name)}</td><td>${Number(x.qty)||0}</td><td>${fmt(x.price)}</td><td>${fmt(x.line??((Number(x.qty)||0)*(Number(x.price)||0)))}</td></tr>`).join('')}</tbody></table>`;
blocks.totals=`<section class="ak46-sheet-totals"><div><span>Subtotal</span><b>${fmt(i.subtotal)}</b></div><div><span>Discount</span><b>−${fmt(i.discount)}</b></div><div><span>Tax</span><b>${fmt(i.tax)}</b></div><div class="ak46-final-total"><span>Total</span><b>${fmt(i.total)}</b></div><div><span>Paid</span><b>${fmt(i.paid)}</b></div><div><span>Due</span><b>${fmt(payable(i))}</b></div></section>`;
if(paymentQrUri(i,c))blocks.totals+=`<section data-ak54-payment-qr class="ak54-a4-upi" style="text-align:center;margin:22px auto 8px;padding:18px;border-top:1px dashed #c9ccd9;color:#111;max-width:360px;font:13px Arial"></section>`;
blocks.footer=`<footer class="ak46-sheet-footer">${sv([c.footer,c.footer2].filter(Boolean).join('\n'))}</footer>`;
const families={system:'system-ui,-apple-system,Segoe UI,Arial,sans-serif',arial:'Arial,Helvetica,sans-serif',georgia:'Georgia,serif',mono:'Consolas,monospace'};const family=families[c.fontFamily]||families.system;const accent=/^#[0-9a-fA-F]{6}$/.test(c.accentColor)?c.accentColor:'#7554ca';const fontSize=Math.min(18,Math.max(10,Number(c.fontSize)||13));const headingSize=Math.min(36,Math.max(16,Number(c.headingSize)||22));const spacing=Math.min(2.2,Math.max(1.1,Number(c.lineSpacing)||1.5));const padding=Math.min(48,Math.max(12,Number(c.paperPadding)||28));const align=['left','center','right'].includes(c.headerAlign)?c.headerAlign:'left';return `<div class="ak46-sheet style-${sv(c.theme)} ak48-custom" style="--receipt-accent:${accent};--ak48-head-size:${headingSize}px;--ak48-align:${align};font-family:${family};font-size:${fontSize}px;line-height:${spacing};padding:${padding}px">${c.order.map(id=>blocks[id]||'').join('')}<div class="ak54-fixed-brand" aria-label="Powered By Akaora Technologies">${AKAORA_FIXED_FOOTER}</div></div>`}
const loadImage=(src)=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Logo could not load'));im.src=src});
function wrapText(ctx,str,maxWidth){const text=String(str??'');if(!text)return [''];const words=text.split(/\s+/);const lines=[];let line='';for(let word of words){if(!word)continue;const trial=line?line+' '+word:word;if(ctx.measureText(trial).width<=maxWidth){line=trial;continue}if(line)lines.push(line);line='';while(word&&ctx.measureText(word).width>maxWidth){let count=1;while(count<word.length&&ctx.measureText(word.slice(0,count+1)).width<=maxWidth)count++;lines.push(word.slice(0,count));word=word.slice(count)}line=word}if(line)lines.push(line);return lines.length?lines:['']}
const thermalPresets=[
 ['centerClassic','Center Classic','Centered shop details with tidy item and amount columns'],
 ['centerCompact','Center Compact','Compact centered heading and space-saving items'],
 ['centerRestaurant','Center Restaurant','Restaurant order and table emphasized'],
 ['centerBold','Center Bold Totals','Centered identity and high-emphasis totals'],
 ['centerMinimal','Minimal Clean','Quiet minimal separators with centered footer'],
 ['centerRetail','Retail Receipt','Retail price lines and clear totals'],
 ['centerPremium','Premium Center','Breathing space, double rules and elegant footer'],
 ['billbookClassic','Billbook Classic','Shop branding, tax total and retail receipt columns'],
 ['billbookQr','Billbook Premium QR','Detailed receipt, optional UPI payment QR and terms'],
 ['sleekMinimal','Sleek Minimal','Compact item numbers, quiet separators and clean totals'],
 ['classic','Classic POS','Standard plain receipt'],['compact','Compact Saver','Condensed receipt'],
 ['bold','Bold Totals','Strong separation at totals'],['restaurant','Restaurant','Table and order prominence'],
 ['minimal','Minimal Lines','Thin/minimal dividers'],['boxed','Boxed Header','Framed business heading'],
 ['center','Centered','Centered original format'],['premium','Premium','Airy headings'],
 ['double','Double Rule','Double separators'],['detailed','Detailed Invoice','Expanded price lines'],
 ['economy','Economy','Condensed items'],['receipt','Retail Ticket','Traditional retail style']
];

function asciiText(s){return String(s??'').replace(/[^\x20-\x7e]/g,'?')}
function referenceReceiptLines(i,c){
 // Reference-inspired layouts use only this shop's actual data, never third-party marks.
 const cols=c.paper==='80mm'?48:32, style=c.receiptStyle, D=details(i,c);
 const lines=[], add=(x='')=>lines.push(String(x));
 const wrap=x=>wrapCols(String(x??''),cols);
 const left=x=>wrap(x).forEach(add);
 const center=x=>wrap(x).forEach(t=>add(' '.repeat(Math.max(0,Math.floor((cols-t.length)/2)))+t));
 const sep=(ch='-')=>add(ch.repeat(cols));
 const pair=(a,b)=>{a=String(a);b=String(b);let n=cols-a.length-b.length;if(n>0)add(a+' '.repeat(n)+b);else{left(a);add(' '.repeat(Math.max(0,cols-b.length))+b)}};
 const fmtRs=n=>'Rs '+Number(n||0).toFixed(2);
 const label=String(c.documentTitle||'INVOICE');
 const name=c.header||D.name;
 const headerAlign=c.headerAlignThermal==='left'?left:center;
 const footerAlign=c.footerAlignThermal==='left'?left:center;
 const isPremium=style==='billbookQr', sleek=style==='sleekMinimal';
 for(const sec of c.order){
  if(sec==='header'){
   headerAlign(name);if(c.subheader)headerAlign(c.subheader);
   if(c.showAddress&&D.address)headerAlign(D.address);
   if(c.showPhone&&D.phone)headerAlign(D.phone);
   if(c.showGstin&&D.gstin)headerAlign('GSTIN: '+D.gstin);
   if(!sleek)add('');
   center(label);pair('Bill: '+String(i.no||''),c.showDate?new Date(i.date||Date.now()).toLocaleDateString('en-IN'):'');
   if(c.showDate&&!sleek)center(new Date(i.date||Date.now()).toLocaleTimeString('en-IN'));
   sep(sleek?'-':'=');
  }
  if(sec==='customer'){
   if(c.showCustomer)left('CUSTOMER: '+D.customer);
   if(c.showPayment)left('PAYMENT: '+D.payment);
   if(c.showOrder&&i.restaurantOrder)left('ORDER: '+String(i.orderType||'Dine-in')+(i.tableNo?' / '+i.tableNo:''));
   if(!sleek)sep();
  }
  if(sec==='items'){
   if(sleek){pair('ITEM / QTY / RATE','AMOUNT');sep();}
   else {center('ITEMS');pair('QTY x RATE','AMOUNT');sep();}
   (i.items||[]).forEach((item,index)=>{
    const qty=Number(item.qty)||0,rate=Number(item.price)||0,amount=Number(item.line??qty*rate)||0;
    const prefix=sleek?(index+1)+'. ':' ';
    left(prefix+String(item.name||'Item'));
    pair(qty+' x '+fmtRs(rate),fmtRs(amount));
    if(isPremium)add('');
   });
   sep();
  }
  if(sec==='totals'){
   pair('SUBTOTAL',fmtRs(i.subtotal));
   if(Number(i.discount||0)>0||!sleek)pair('DISCOUNT','-'+fmtRs(i.discount));
   if(Number(i.tax||0)>0||!sleek)pair('TAX TOTAL',fmtRs(i.tax));
   // Never manufacture CGST/SGST or HSN tax splits from a single tax total.
   sep(sleek?'-':'=');pair('GRAND TOTAL',fmtRs(i.total));
   if(!sleek){pair('PAID',fmtRs(i.paid));pair('DUE',fmtRs(payable(i)));}
   sep();
  }
  if(sec==='footer'){
   if(c.receiptPromo)footerAlign(c.receiptPromo);
   if(c.receiptTerms){sep();footerAlign(c.receiptTerms);}
   if(c.footer)footerAlign(c.footer);
   if(c.footer2)footerAlign(c.footer2);
   if(!sleek)add('');
  }
 }
 if(paymentQrUri(i,c)){sep('-');add('__AK51_PAYMENT_QR__');}
 sep('-');center(AKAORA_FIXED_FOOTER);
 return lines;
}
function paymentQrUri(i,c){
 if(c.showPaymentQr===false||String(i.method||'').toLowerCase()!=='upi')return '';
 const id=String(settings?.upiId||'').trim();
 if(!/^[\w.-]+@[\w.-]+$/.test(id))return '';
 const amount=Number(i.total||0);
 if(!Number.isFinite(amount)||amount<=0)return '';
 const params=new URLSearchParams({pa:id,pn:details(i,c).name,am:amount.toFixed(2),cu:'INR',tn:String(i.no||'Invoice')});
 return 'upi://pay?'+params.toString();
}
function paymentQrSize(c,width){return Math.min(width-48,Math.max(144,Math.min(256,Number(c.upiQrSize)||200)))}
function qrReceiptCanvas(i,c,width){
 const value=paymentQrUri(i,c);if(!value)return null;
 const size=paymentQrSize(c,width),qr=qrRenderer(i,c,size);
 const out=document.createElement('canvas');out.width=width;out.height=size+75;
 const ctx=out.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,width,out.height);
 ctx.fillStyle='#111';ctx.font='bold 19px Arial';ctx.textAlign='center';ctx.fillText('SCAN & PAY UPI',width/2,21);
 ctx.drawImage(qr,Math.floor((width-size)/2),30);
 ctx.font='16px Arial';ctx.fillText(String(settings.upiId||''),width/2,size+52);
 return out;
}
function renderA4Qr(root,i,c){
 const holder=root.querySelector('[data-ak54-payment-qr]');if(!holder)return;
 holder.replaceChildren();
 const qr=qrRenderer(i,c,paymentQrSize(c,300));
 qr.setAttribute('aria-label','UPI payment QR code');qr.style.cssText='width:200px;max-width:100%;height:auto;display:block;margin:8px auto';
 const label=root.ownerDocument.createElement('b');label.textContent='Scan & Pay via UPI';
 const upi=root.ownerDocument.createElement('div');upi.textContent='UPI: '+settings.upiId;
 const amount=root.ownerDocument.createElement('div');amount.textContent='Amount: '+fmt(i.total);
 holder.append(label,qr,upi,amount);
}

function qrRenderer(i,c,size){
 const value=paymentQrUri(i,c);if(!value)return null;
 if(!window.AkaoraV12?.qrCanvas)throw new Error('UPI QR library unavailable; cannot print a payment QR.');
 return window.AkaoraV12.qrCanvas(value,size);
}
// v72: selectable paper-saving receipts. Reduce physical lines rather than just scaling the preview.
function isPaperSaver(c){return c.paper!=='A4'&&['compact','mini'].includes(c.paperSaver)}
function showReceiptLogo(c){return c.showLogo!==false&&(!isPaperSaver(c)||c.showLogoPaperSaver===true)}
// v75: a single semantic line layout drives preview, ESC/POS and raster output.
// Do not apply left-padding and hardware/CSS centering to the same text.
function paperSaverSegments(i,c){
 const cols=c.paper==='80mm'?48:32,mini=c.paperSaver==='mini',D=details(i,c),segments=[];
 const mode=v=>['left','center','right'].includes(v)?v:'center';
 const contactAlign=mode(c.paperSaverContactAlign),invoiceAlign=mode(c.paperSaverInvoiceAlign),footerAlign=mode(c.paperSaverFooterAlign);
 const add=(value,align='left',more={})=>{
  for(const line of wrapCols(String(value??''),cols))segments.push({text:line,kind:'body',align,...more});
 };
 const addEmphasis=(value,kind)=>{
  const txt=String(value||'');
  const wideCols=Math.floor(cols/2),largeCols=Math.floor(cols/1.5);
  if(txt.length<=wideCols){segments.push({text:txt,kind,align:'center',bold:true,double:true});return}
  for(const line of wrapCols(txt,largeCols))segments.push({text:line,kind,align:'center',bold:true,tall:true});
 };
 const pair=(left,right)=>{
  const amount=String(right),available=Math.max(6,cols-amount.length-1);
  const parts=wrapCols(String(left),available);
  for(let k=0;k<parts.length-1;k++)add(parts[k]);
  const last=parts[parts.length-1]||'';
  const spaces=Math.max(1,cols-last.length-amount.length);
  segments.push({text:last+' '.repeat(spaces)+amount,kind:'pair',align:'left'});
 };
 const money=n=>'Rs '+Number(n||0).toFixed(2);
 const divider=()=>add('-'.repeat(cols));
 addEmphasis(c.header||D.name,'shop');
 if(c.showGstin&&D.gstin)add('GSTIN: '+D.gstin,contactAlign);
 if(!mini){
  if(c.showPhone&&D.phone)add('Tel: '+D.phone,contactAlign);
  if(c.showAddress&&D.address)add(D.address,contactAlign);
 }
 const dt=new Date(i.date||Date.now());
 const date=Number.isFinite(dt.getTime())?dt.toLocaleDateString('en-IN')+(mini?'':' '+dt.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})):'';
 add((c.documentTitle||'BILL')+' '+String(i.no||''),invoiceAlign);
 if(c.showDate&&date)add(date,invoiceAlign);
 if(c.showCustomer&&D.customer&&(!mini||!/walk.?in/i.test(D.customer)))add('Customer: '+D.customer);
 if(c.showOrder&&i.restaurantOrder)add((i.orderType||'Dine-in')+(i.tableNo?' / Table '+i.tableNo:''));
 if(!mini&&c.showPayment)add('Paid via: '+D.payment);
 divider();
 for(const item of i.items||[]){
  const qty=Number(item.qty)||0,amount=Number(item.line??qty*Number(item.price||0))||0;
  pair(qty+'x '+String(item.name||'Item'),money(amount));
  if(!mini&&qty>1)add('   @ '+money(item.price));
 }
 divider();
 const discount=Number(i.discount||0),tax=Number(i.tax||0);
 if(discount||tax)pair('SUBTOTAL',money(i.subtotal));
 if(discount)pair('DISCOUNT','-'+money(discount));
 if(tax)pair('TAX',money(tax));
 addEmphasis('TOTAL '+money(i.total),'total');
 const due=payable(i);if(due>0.009){pair('PAID',money(i.paid));pair('DUE',money(due))}
 if(!mini){if(c.footer)add(c.footer,footerAlign);if(c.footer2)add(c.footer2,footerAlign)}
 add(AKAORA_FIXED_FOOTER,footerAlign);
 if(paymentQrUri(i,c))segments.push({text:'__AK51_PAYMENT_QR__',kind:'qr'});
 return segments;
}
function paperSaverLines(i,c){
 const cols=c.paper==='80mm'?48:32;
 return paperSaverSegments(i,c).map(row=>{
  if(row.kind==='qr')return '__AK51_PAYMENT_QR__';
  const limit=row.double?Math.floor(cols/2):row.tall?Math.floor(cols/1.5):cols;
  const text=String(row.text||'');
  if(row.align==='center')return ' '.repeat(Math.max(0,Math.floor((limit-text.length)/2)))+text;
  if(row.align==='right')return ' '.repeat(Math.max(0,limit-text.length))+text;
  return text;
 });
}
function receiptLines(i,c){
 if(isPaperSaver(c))return paperSaverLines(i,c);
 if(['billbookClassic','billbookQr','sleekMinimal'].includes(c.receiptStyle))return referenceReceiptLines(i,c);
 const cols=c.paper==='80mm'?48:32,style=c.receiptStyle||'centerClassic',D=details(i,c),centered=style.startsWith('center')||['premium','receipt','center'].includes(style);
 const compact=['centerCompact','compact','economy'].includes(style),minimal=['centerMinimal','minimal'].includes(style),premium=['centerPremium','premium','double'].includes(style),bold=['centerBold','bold'].includes(style),restaurant=['centerRestaurant','restaurant'].includes(style),retail=['centerRetail','receipt','detailed'].includes(style);
 const rows=[];const push=(s='')=>rows.push(String(s));
 const cAlign=(s)=>wrapCols(s,cols).forEach(t=>push(' '.repeat(Math.max(0,Math.floor((cols-t.length)/2)))+t));
 const lAlign=(s)=>wrapCols(s,cols).forEach(push);
 const div=(mark=premium?'=':'-')=>{if(!minimal)push(mark.repeat(cols))};
 const kv=(label,value)=>{const a=String(label),b=String(value);const space=cols-a.length-b.length;if(space>=1)push(a+' '.repeat(space)+b);else{lAlign(a);push(' '.repeat(Math.max(0,cols-b.length))+b)}};
 const hdrAlign= c.headerAlignThermal==='left'?'left':c.headerAlignThermal==='right'?'right':'center';
 const footerAlign=c.footerAlignThermal==='left'?'left':c.footerAlignThermal==='right'?'right':'center';
 const align=(text,where)=>{for(const t of wrapCols(String(text),cols)){if(where==='center')push(' '.repeat(Math.max(0,Math.floor((cols-t.length)/2)))+t);else if(where==='right')push(' '.repeat(Math.max(0,cols-t.length))+t);else push(t)}};
 for(const sec of c.order){
  if(sec==='header'){
   align(D.name,hdrAlign);if(c.subheader)align(c.subheader,hdrAlign);
   if(c.showAddress&&D.address)align(D.address,hdrAlign);
   if(c.showPhone&&D.phone)align(D.phone,hdrAlign);
   if(c.showGstin&&D.gstin)align('GSTIN: '+D.gstin,hdrAlign);
   if(!compact)push('');align(c.documentTitle||'INVOICE','center');align(i.no||'','center');if(c.showDate)align(D.date,'center');div();
  }
  if(sec==='customer'){
   if(c.showCustomer)lAlign('CUSTOMER: '+D.customer);
   if(c.showPayment)lAlign('PAYMENT: '+D.payment);
   if(c.showOrder&&i.restaurantOrder){lAlign('ORDER: '+(i.orderType||'Dine-in'));if(i.tableNo)lAlign('TABLE: '+i.tableNo)}div();
  }
  if(sec==='items'){
   if(!compact)align('ITEMS','center');if(!compact)div();
   for(const item of i.items||[]){const qty=Number(item.qty)||0,price=Number(item.price)||0,amount=Number(item.line??qty*price)||0;
    const name=qty+' x '+String(item.name||'Item');align(name,c.itemsAlign==='center'?'center':'left');
    if(compact)kv('', 'Rs '+amount.toFixed(2));
    else if(retail){kv('  @ Rs '+price.toFixed(2),'Rs '+amount.toFixed(2));}
    else kv('  Rs '+price.toFixed(2)+' each','Rs '+amount.toFixed(2));
    if((premium||restaurant)&&!compact)push('');
   }div();
  }
  if(sec==='totals'){
   const totalAlign=c.totalsAlign==='left'?'left':c.totalsAlign==='center'?'center':'right';
   const pair=(name,value)=>{if(totalAlign==='right')kv(name,value);else if(totalAlign==='center')align(name+'  '+value,'center');else lAlign(name+' '+value)};
   pair('SUBTOTAL','Rs '+Number(i.subtotal||0).toFixed(2));pair('DISCOUNT','Rs '+Number(i.discount||0).toFixed(2));pair('TAX','Rs '+Number(i.tax||0).toFixed(2));
   if(bold||premium)div('=');pair('TOTAL','Rs '+Number(i.total||0).toFixed(2));
   if(bold)div('=');pair('PAID','Rs '+Number(i.paid||0).toFixed(2));pair('DUE','Rs '+payable(i).toFixed(2));div();
  }
  if(sec==='footer'){if(c.footer)align(c.footer,footerAlign);if(c.footer2)align(c.footer2,footerAlign);if(!compact)push('')}
 }
 if(paymentQrUri(i,c)){push('-'.repeat(cols));push('__AK51_PAYMENT_QR__');}
 push('-'.repeat(cols));align(AKAORA_FIXED_FOOTER,'center');
 return rows;
}

function wrapCols(s,cols){
 const out=[];for(const segment of String(s??'').split('\n')){
  const words=segment.split(/\s+/);let line='';
  for(let word of words){if(!word)continue;
   while(word.length>cols){if(line){out.push(line);line=''}out.push(word.slice(0,cols));word=word.slice(cols)}
   if(!word)continue;const next=line?line+' '+word:word;
   if(next.length>cols){if(line)out.push(line);line=word}else line=next;
  }out.push(line)
 }
 return out;
}

// v53 — same visual emphasis in raster and native ESC/POS output.
// A double-width native line carries half the normal number of characters.
function prominentReceiptSegments(i,c){
 const cols=c.paper==='80mm'?48:32,doubleCols=Math.floor(cols/2);
 const rows=receiptLines(i,c),name=String(details(i,c).name||'Business');
 if(isPaperSaver(c))return paperSaverSegments(i,c);
 const normalName=wrapCols(name,cols);
 const segments=[];let idx=-1;
 // Respect customized section order and avoid assuming that the header is first.
 for(let k=0;k<=rows.length-normalName.length;k++){
  if(normalName.every((part,j)=>rows[k+j]?.trim()===part.trim())){idx=k;break}
 }
 const totalPattern=/^\s*(?:GRAND\s+)?TOTAL\s+Rs[. ]?\s*[\d,]+(?:\.\d{2})?\s*$/i;
 for(let k=0;k<rows.length;k++){
  if(k===idx){const wide=name.length<=doubleCols;for(const part of wrapCols(name,wide?doubleCols:cols))segments.push({text:part,align:'center',bold:true,double:wide,tall:!wide,kind:'shop'});k+=normalName.length-1;continue}
  if(totalPattern.test(rows[k])){
   const amount='Rs '+Number(i.total||0).toFixed(2),one='TOTAL '+amount;
   segments.push({text:'='.repeat(cols),kind:'separator'});
   if(one.length<=doubleCols)segments.push({text:one,align:'center',bold:true,double:true,kind:'total'});
   else if(one.length<=cols)segments.push({text:one,align:'center',bold:true,tall:true,kind:'total'});else segments.push({text:'TOTAL',align:'center',bold:true,double:true,kind:'total'},{text:amount,align:'center',bold:true,double:true,kind:'total'});
   segments.push({text:'='.repeat(cols),kind:'separator'});
  }else segments.push({text:rows[k],kind:rows[k]==='__AK51_PAYMENT_QR__'?'qr':'body'});
 }
 return segments;
}

function textOutput(i,c){return receiptLines(i,c).filter(line=>line!=='__AK51_PAYMENT_QR__').join('\n').replace(/[^\x09\x0a\x0d\x20-\x7e]/g,'?')+'\n'}
function unicodeReceipt(i,c){const parts=[details(i,c).name,details(i,c).address,i.customer,c.subheader,c.documentTitle,c.footer,c.footer2,...(i.items||[]).map(x=>x.name)];return parts.some(s=>/[^\x09\x0a\x0d\x20-\x7e]/.test(String(s||'')))}

// v55 Kitchen Order Ticket – intentionally separate from the customer invoice.
let studioDocumentType='bill';
function kotPricesEnabled(){return typeof settings!=='undefined'&&settings.kotShowPrices===true}
function kotMoney(n){return 'Rs '+Number(n||0).toFixed(2)}
function kotSegments(i,c){
 const cols=c.paper==='80mm'?48:32;
 const lines=[];
 const push=(v='')=>{for(const line of wrapCols(String(v),cols))lines.push({text:line,kind:'kot',align:'left',bold:false})};
 const center=(v,bold=false,double=false)=>{for(const line of wrapCols(String(v),double?Math.floor(cols/2):cols))lines.push({text:line,kind:'kot',align:'center',bold,double})};
 center('KITCHEN ORDER TICKET',true,false);
 center(details(i,c).name,true,false);
 center(String(i.no||'DEMO-KOT'));
 center(new Date(i.date||Date.now()).toLocaleString('en-IN'));
 lines.push({text:'='.repeat(cols),kind:'separator'});
 push('ORDER: '+(i.orderType||'Dine-in'));
 if(i.tableNo)push('TABLE: '+i.tableNo);
 if(i.orderNo)push('ORDER NO: '+i.orderNo);
 lines.push({text:'-'.repeat(cols),kind:'separator'});
 center(kotPricesEnabled()?'ITEMS / QTY / PRICE':'ITEMS / QUANTITY',true);
 lines.push({text:'-'.repeat(cols),kind:'separator'});
 for(const item of i.items||[]){
  const qty=Number(item.qty)||0;
  for(const line of wrapCols(qty+' x '+String(item.name||'Item'),cols))lines.push({text:line,kind:'item',bold:true,align:'left'});
  if(kotPricesEnabled()){const price=kotMoney(item.price),amount=kotMoney(item.line??qty*Number(item.price||0));push('  @ '+price+'   = '+amount)}
  if(item.variant)push('  '+item.variant);
  if(item.note)push('  Note: '+item.note);
 }
 if(i.orderNote||i.kitchenNote){
  lines.push({text:'-'.repeat(cols),kind:'separator'});
  push('KITCHEN NOTE:');
  push(i.orderNote||i.kitchenNote);
 }
 lines.push({text:'='.repeat(cols),kind:'separator'});
 if(kotPricesEnabled()){push('TOTAL: '+kotMoney(i.total));center('KITCHEN COPY - WITH PRICES',true)}
 else center('KITCHEN COPY - NO PRICES',true);
 return lines;
}
function kotHasUnicode(i,c){return kotSegments(i,c).some(x=>/[^\x09\x0a\x0d\x20-\x7e]/.test(x.text))}
function kotCanvasReceipt(i,c){
 const width=c.paper==='80mm'?576:384,margin=14,size=c.paper==='80mm'?22:20,lineHeight=Math.ceil(size*1.65);
 const all=kotSegments(i,c),height=Math.min(12000,Math.max(180,all.reduce((acc,row)=>acc+Math.ceil(lineHeight*(row.double?2:1)),28)+32));
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);ctx.fillStyle='#111';ctx.textBaseline='top';
 let y=16;for(const row of all){const fontSize=row.double?size*2:size;ctx.font=(row.bold?'bold ':'')+fontSize+'px monospace';let text=row.text;
  const measure=ctx.measureText(text).width;if(measure>width-margin*2)ctx.font=(row.bold?'bold ':'')+Math.max(12,Math.floor(fontSize*(width-margin*2)/measure))+'px monospace';
  ctx.textAlign=row.align==='center'?'center':'left';ctx.fillText(text,row.align==='center'?width/2:margin,y);y+=Math.ceil(lineHeight*(row.double?2:1));
 }
 return canvas;
}
function kotA4Markup(i,c){
 const priced=kotPricesEnabled();
 const rows=(i.items||[]).map(x=>`<tr><td>${sv(x.name||'Item')}${x.variant?`<small> · ${sv(x.variant)}</small>`:''}${x.note?`<small> · ${sv(x.note)}</small>`:''}</td><td>${Number(x.qty)||0}</td>${priced?`<td>${sv(kotMoney(x.price))}</td><td>${sv(kotMoney(x.line??(Number(x.qty)||0)*(Number(x.price)||0)))}</td>`:''}</tr>`).join('');
 const date=new Date(i.date||Date.now()).toLocaleString('en-IN');
 return `<div class="ak55-kot-sheet" role="document"><div class="ak55-kot-heading">KITCHEN ORDER TICKET</div><h2>${sv(details(i,c).name)}</h2><p>${sv(i.no||'DEMO-KOT')} · ${sv(date)}</p><div class="ak55-kot-meta"><div><b>Order type</b>${sv(i.orderType||'Dine-in')}</div>${i.tableNo?`<div><b>Table</b>${sv(i.tableNo)}</div>`:''}</div><table><thead><tr><th>Ordered item</th><th>Quantity</th>${priced?'<th>Rate</th><th>Amount</th>':''}</tr></thead><tbody>${rows}</tbody>${priced?`<tfoot><tr><th colspan="3">Order total</th><th>${sv(kotMoney(i.total))}</th></tr></tfoot>`:''}</table>${i.orderNote||i.kitchenNote?`<div class="ak55-kot-note"><b>Kitchen note</b><p>${sv(i.orderNote||i.kitchenNote)}</p></div>`:''}<div class="ak55-kot-end">Kitchen copy · ${priced?'Prices shown':'No prices'}</div></div>`;
}
function kotPreview(target,i,c){
 if(c.paper==='A4'){target.innerHTML=kotA4Markup(i,c);return;}
 if(c.printMode==='raster'||kotHasUnicode(i,c)){
  const canvas=kotCanvasReceipt(i,c);canvas.className='ak46-thermal ak55-kot-preview-canvas';canvas.style.cssText='width:'+(c.paper==='80mm'?'322':'235')+'px;max-width:100%;height:auto;display:block;margin:auto';target.replaceChildren(canvas);return;
 }
 const wrap=document.createElement('div');wrap.className='ak50-native-wrap';
 const pre=document.createElement('div');pre.className='ak49-thermal-text ak53-native-preview ak55-kot-text';pre.style.width=(c.paper==='80mm'?48:32)+'ch';
 for(const seg of kotSegments(i,c)){const line=document.createElement('div');line.className=seg.bold?'ak55-kot-bold':'ak53-normal-line';line.textContent=seg.text||' ';line.style.textAlign=seg.align==='center'?'center':seg.align==='right'?'right':'left';pre.appendChild(line)}
 wrap.appendChild(pre);target.replaceChildren(wrap);
}
function printBrowserKot(i){
 if(i?.id==='preview-only'){if(typeof toast==='function')toast('Select a saved restaurant invoice before printing');return}
 const c=config();const win=window.open('','_blank');if(!win){if(typeof toast==='function')toast('Allow popups to print KOT');return}
 const title='KOT '+sv(i.no||'');win.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>'+title+'</title><style>@page{size:'+(c.paper==='A4'?'A4':c.paper+' auto')+';margin:3mm}body{margin:0;color:black;background:white}canvas,img{max-width:100%;height:auto}'+(c.paper==='A4'?'body{padding:16px;font:14px Arial}.ak55-kot-sheet{max-width:690px;margin:auto}.ak55-kot-heading{text-align:center;font-size:26px;font-weight:bold}.ak55-kot-sheet h2,.ak55-kot-sheet p{text-align:center}.ak55-kot-meta{display:flex;justify-content:space-around;padding:12px;border-block:1px dashed #aaa}.ak55-kot-meta b{display:block}.ak55-kot-sheet table{width:100%;border-collapse:collapse}.ak55-kot-sheet td,.ak55-kot-sheet th{padding:12px;border-bottom:1px solid #ddd;text-align:left}.ak55-kot-end{text-align:center;border-top:1px dashed #aaa;padding:12px}':'')+'</style></head><body></body></html>');win.document.close();
 if(c.paper==='A4'){win.document.body.innerHTML=kotA4Markup(i,c)}else{const image=win.document.createElement('img');image.src=kotCanvasReceipt(i,c).toDataURL('image/png');image.style.width=c.paper;image.style.display='block';win.document.body.append(image)}
 win.focus();win.print();
}
async function printBluetoothKot(i){
 if(!i||i.id==='preview-only'||!i.restaurantOrder){if(typeof toast==='function')toast('Choose a saved restaurant order to print KOT');return}
 if(!settings.kotBeforeBill&&!i.billPrintRequestedAt){if(typeof toast==='function')toast('Print bill first, or enable KOT before bill in Settings');return}
 const c=config(),printer=window.AkaoraThermal;if(c.paper==='A4'){if(typeof toast==='function')toast('Choose 58mm or 80mm to print KOT via Bluetooth');return}
 if(!printer){if(typeof toast==='function')toast('Bluetooth printer unavailable');return}
 async function perform(){
  try{if(!printer.status().connected)await printer.connect();const speed={fast:[180,6],balanced:[100,12],safe:[100,40]}[c.printSpeed]||[100,12];
   printer.configure({width:c.paper==='80mm'?80:58,chunkSize:speed[0],delay:speed[1],command:'raster'});
   if(c.printMode!=='raster'&&!kotHasUnicode(i,c))await printer.printNativeText(kotSegments(i,c).map(s=>s.text).join('\n'),'KOT '+i.no,null,{segments:kotSegments(i,c)});
   else await printer.printCanvas(kotCanvasReceipt(i,c),'KOT '+i.no);
   i.kotPrintedAt=Date.now();save();if(typeof toast==='function')toast('Kitchen ticket sent. Confirm actual paper output.');
  }catch(e){if(typeof toast==='function')toast('KOT printing failed: '+e.message)}
 }
 if(!printer.status().connected){helper(()=>{void perform()});return}await perform();
}
function openKOTPreview(i){
 if(!i||!i.restaurantOrder){if(typeof toast==='function')toast('KOT preview is only available for restaurant orders.');return}
 document.querySelector('.ak55-kot-backdrop')?.remove();
 const backdrop=document.createElement('div');backdrop.className='ak55-kot-backdrop';
 backdrop.innerHTML=`<div class="ak55-kot-modal" role="dialog" aria-modal="true" aria-label="Kitchen order preview"><div class="ak55-kot-modal-head"><div><b>Kitchen order preview</b><small>${kotPricesEnabled()?'Item prices and total included':'Prices hidden (Settings to enable)'}</small></div><button type="button" data-ak55-close aria-label="Close preview">×</button></div><div class="ak55-kot-modal-paper"></div><div class="ak55-kot-modal-actions"><button class="secondary" type="button" data-ak55-close>Close</button><button class="amber" type="button" data-ak55-print>Print KOT</button></div></div>`;
 document.body.append(backdrop);const paper=backdrop.querySelector('.ak55-kot-modal-paper'),c={...config(),paper:config().paper==='A4'?'58mm':config().paper};kotPreview(paper,i,c);
 backdrop.querySelectorAll('[data-ak55-close]').forEach(x=>x.addEventListener('click',()=>backdrop.remove()));backdrop.addEventListener('click',e=>{if(e.target===backdrop)backdrop.remove()});
 backdrop.querySelector('[data-ak55-print]').onclick=()=>{backdrop.remove();void printBluetoothKot(i)};
}
function logoLimits(c,width){const scaleByPreset={small:0.25,medium:0.40,large:0.58};const maxW= Math.max(48,Math.floor(width-24));const presetW=Math.round(width*(scaleByPreset[c.logoPreset]||.40));const requested=Number(c.logoWidth)||90;
 const w=c.logoAutoFit===false?Math.min(maxW,requested):Math.min(maxW,Math.max(40,Math.min(requested,presetW)));
 const h=Math.min(190,Math.max(30,Number(c.logoHeight)||90));return {w,h};}
async function logoCanvas(c){
 if(!showReceiptLogo(c)||!safeLogo())return null;
 const width=c.paper==='80mm'?576:384,src=await loadImage(safeLogo()),{w,h}=logoLimits(c,width);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=h+12;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,width,canvas.height);
 let drawW=w,drawH=h;if(!c.stretch){const scale=Math.min(w/src.naturalWidth,h/src.naturalHeight);drawW=Math.max(1,src.naturalWidth*scale);drawH=Math.max(1,src.naturalHeight*scale)}
 const x=c.logoCenter===false?12:Math.max(0,(width-drawW)/2);ctx.drawImage(src,x,6+Math.max(0,(h-drawH)/2),drawW,drawH);return canvas;
}
async function thermalCanvas(i,c){
 const width=c.paper==='80mm'?576:384,cols=c.paper==='80mm'?48:32;
 const size=Math.min(Math.round((isPaperSaver(c)?17:20)*Math.min(1.2,Math.max(.82,(Number(c.fontSize)||13)/13))),Math.floor((width-24)/(cols*.61)));
 const lineH=Math.round(size*(isPaperSaver(c)?1.23:Math.min(1.9,Math.max(1.25,Number(c.lineSpacing)||1.5))));
 const margin=12,maxWidth=width-margin*2;
 const scratch=document.createElement('canvas').getContext('2d');scratch.font=`${size}px monospace`;
 const rows=prominentReceiptSegments(i,c);
 let logo=null;try{logo=await logoCanvas(c)}catch(e){console.warn('Logo unavailable:',e.message)}
 const qr=qrReceiptCanvas(i,c,width);const qrExtra=qr?qr.height+22:0;
 const textHeight=rows.reduce((h,row)=>h+Math.ceil(lineH*(row.double?2.45:row.tall?1.9:1)),0);
 const height=Math.max(165,textHeight+(logo?.height||0)+36+qrExtra);if(height>12000)throw Error('Receipt too long for printer. Split the bill.');
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);ctx.fillStyle='#151515';let y=isPaperSaver(c)?6:14;
 if(logo){ctx.drawImage(logo,0,y);y+=logo.height}
 ctx.textBaseline='top';for(const row of rows){
  if(row.kind==='qr'){if(qr){y+=8;ctx.drawImage(qr,0,y);y+=qr.height+14;}continue;}
  const baseSize=row.double?size*2:row.tall?Math.ceil(size*1.5):size;
  ctx.font=`${row.bold?'bold ':''}${baseSize}px monospace`;
  const measured=ctx.measureText(row.text).width;
  if(measured>maxWidth)ctx.font=`${row.bold?'bold ':''}${Math.max(11,Math.floor(baseSize*maxWidth/measured))}px monospace`;
  ctx.textAlign=row.align==='center'?'center':row.align==='right'?'right':'left';
  ctx.fillText(row.text,row.align==='center'?width/2:row.align==='right'?width-margin:margin,y);
  y+=Math.ceil(lineH*(row.double?2.45:row.tall?1.9:1));
 }
 ctx.textAlign='left';return canvas;
}

async function textPreview(target,i,c){
 const cols=c.paper==='80mm'?48:32;target.innerHTML='';
 const wrap=document.createElement('div');wrap.className='ak50-native-wrap';
 if(c.printMode!=='text'&&showReceiptLogo(c)){try{const logo=await logoCanvas(c);if(logo){logo.className='ak50-logo-preview';logo.style.width=c.paper==='80mm'?'288px':'224px';wrap.appendChild(logo)}}catch(e){}}
 const pre=document.createElement('div');pre.className='ak49-thermal-text ak53-native-preview';pre.setAttribute('aria-label',`Native text print preview ${c.paper}`);pre.style.width=cols+'ch';
 for(const seg of prominentReceiptSegments(i,c)){
  if(seg.kind==='qr'){const qr=qrReceiptCanvas(i,c,c.paper==='80mm'?576:384);if(qr){qr.className='ak54-preview-qr';qr.style.cssText='width:'+ (c.paper==='80mm'?'288':'224') +'px;max-width:100%;display:block;margin:12px auto';pre.appendChild(qr);}continue;}
  const line=document.createElement('div');line.className=seg.double?'ak53-emphasis-line':seg.tall?'ak53-emphasis-line ak53-emphasis-tall':'ak53-normal-line';
  line.textContent=seg.text||' ';line.style.textAlign=seg.align==='center'?'center':seg.align==='right'?'right':'left';
  pre.appendChild(line);
 }wrap.appendChild(pre);
 if(c.printMode==='stored'){const note=document.createElement('p');note.className='ak50-caution';note.textContent='Stored logo is an illustration only. Printer must already have a compatible NV logo in slot 1; appearance cannot be read back from printer.';wrap.appendChild(note)}
 target.replaceChildren(wrap);
}

let currentToken=0;
/* Fit an actual 794px A4 sheet into a responsive preview without collapsing its layout. */
const A4_PREVIEW_WIDTH=794;
function fitA4(target){
 if(!target||!target.isConnected)return;
 const sheet=target.querySelector('.ak46-sheet');if(!sheet)return;
 let frame=target.querySelector('.ak47-a4-fit');
 if(!frame){frame=document.createElement('div');frame.className='ak47-a4-fit';sheet.replaceWith(frame);frame.append(sheet)}
 const available=Math.max(1,Math.floor(target.getBoundingClientRect().width));
 const scale=Math.min(1,available/A4_PREVIEW_WIDTH);
 Object.assign(sheet.style,{width:A4_PREVIEW_WIDTH+'px',maxWidth:'none',position:'absolute',top:'0',left:'0',transformOrigin:'top left',transform:'scale('+scale+')',margin:'0'});
 frame.style.width=Math.floor(A4_PREVIEW_WIDTH*scale)+'px';
 frame.style.height=Math.ceil(sheet.scrollHeight*scale)+'px';
}
let fitObserver=null,fitWidth=0;
function watchPreview(){
 const stage=document.querySelector('#ak46-settings-pane .ak46-stage');
 if(!stage||typeof ResizeObserver==='undefined')return;
 fitObserver?.disconnect();fitWidth=stage.clientWidth;
 fitObserver=new ResizeObserver(entries=>{
  const width=entries[0]?.target.clientWidth||0;
  if(Math.abs(width-fitWidth)<2)return;
  fitWidth=width;
  requestAnimationFrame(()=>fitA4(document.getElementById('ak46-preview')));
 });fitObserver.observe(stage);
}

const getPaper=(v)=>v==='58mm'?'58mm':v==='80mm'?'80mm':'A4';
async function preview(target,invoice,c){const token=++currentToken;target.innerHTML='<p style="font-size:12px;color:#64748b;margin:25px">Rendering print preview…</p>';try{if(c.paper==='A4'){target.innerHTML=sheetHTML(invoice,c);renderA4Qr(target,invoice,c);fitA4(target);watchPreview();return}if(c.printMode!=='raster'&&!unicodeReceipt(invoice,c)){await textPreview(target,invoice,c);return}const can=await thermalCanvas(invoice,c);if(token!==currentToken||!target.isConnected)return;can.className='ak46-thermal';can.style.width=c.paper==='80mm'?'322px':'235px';can.style.maxWidth='100%';can.setAttribute('aria-label',`${c.paper} receipt print preview`);target.replaceChildren(can)}catch(e){if(token===currentToken)target.textContent='Preview unavailable: '+e.message;console.error('Akaora receipt preview',e)}}
function basePanelHTML(){const c=config();return `<div class="ak46-studio"><div class="ak46-top"><div><h2>Invoice Studio</h2><p>Customize, reorder and preview the same receipt used for printing.</p></div><div class="ak46-toolbar"><button class="secondary" type="button" data-ak46-act="bluetooth">${icon('bluetooth')} Bluetooth help</button><button class="secondary" type="button" data-ak46-act="reset">Reset design</button><button class="amber" type="button" data-ak46-act="print">${icon('printer')} Print preview</button></div></div><div class="ak46-grid"><section class="ak46-config"><div class="ak46-group"><h3>Receipt theme</h3><div class="ak46-field"><label for="ak46-theme">Template</label><select id="ak46-theme" data-ak46-key="theme">${[['modern','Modern · Purple'],['minimal','Minimal'],['classic','Classic'],['elegant','Elegant']].map(([v,t])=>`<option value="${v}" ${c.theme===v?'selected':''}>${t}</option>`).join('')}</select></div></div><div class="ak46-group ak48-design-controls"><h3>Custom styling</h3><p class="ak46-help">Fonts, colors, alignment and spacing are applied to the actual A4/PDF invoice. Thermal printers use monochrome output.</p><div class="ak46-cols"><div class="ak46-field"><label>Font family</label><select data-ak46-key="fontFamily">${[['system','Modern sans-serif'],['arial','Arial'],['georgia','Georgia'],['mono','Monospace']].map(([v,t])=>`<option value="${v}" ${c.fontFamily===v?'selected':''}>${t}</option>`).join('')}</select></div><div class="ak46-field"><label>Header alignment</label><select data-ak46-key="headerAlign">${[['left','Left'],['center','Center'],['right','Right']].map(([v,t])=>`<option value="${v}" ${c.headerAlign===v?'selected':''}>${t}</option>`).join('')}</select></div><div class="ak46-field"><label>Body text (px)</label><input type="number" min="10" max="18" data-ak46-key="fontSize" value="${c.fontSize}"></div><div class="ak46-field"><label>Heading (px)</label><input type="number" min="16" max="36" data-ak46-key="headingSize" value="${c.headingSize}"></div><div class="ak46-field"><label>Line spacing</label><select data-ak46-key="lineSpacing">${[[1.2,'Compact'],[1.5,'Comfortable'],[1.8,'Spacious'],[2,'Extra spacious']].map(([v,t])=>`<option value="${v}" ${Number(c.lineSpacing)===v?'selected':''}>${t}</option>`).join('')}</select></div><div class="ak46-field"><label>Paper padding (px)</label><input type="number" min="12" max="48" data-ak46-key="paperPadding" value="${c.paperPadding}"></div></div><div class="ak46-field"><label>Accent color (A4 / PDF)</label><div class="ak48-color-row"><input type="color" data-ak46-key="accentColor" value="${sv(c.accentColor)}"><span>${sv(c.accentColor)}</span></div></div></div><div class="ak46-group ak48-print-controls"><h3>Print performance</h3><div class="ak46-field"><label>Thermal print speed</label><select data-ak46-key="printSpeed">${[['fast','Fast · test on printer'],['balanced','Balanced · recommended'],['safe','Safe · stable']].map(([v,t])=>`<option value="${v}" ${c.printSpeed===v?'selected':''}>${t}</option>`).join('')}</select></div><p class="ak46-help">Fast sends larger chunks with shorter pauses; use Safe if output is incomplete. All templates retain the customized invoice raster preview.</p></div><div class="ak46-group"><h3>Header & branding</h3><div class="ak46-field"><label>Business title (blank uses shop name)</label><input data-ak46-key="header" value="${sv(c.header)}" placeholder="Shop name"></div><div class="ak46-field"><label>Subtitle</label><input data-ak46-key="subheader" value="${sv(c.subheader)}" placeholder="Fresh food · Fast service"></div><div class="ak46-cols"><div class="ak46-field"><label>Logo width (40–200 px)</label><input type="number" min="40" max="200" data-ak46-key="logoWidth" value="${c.logoWidth}"></div><div class="ak46-field"><label>Logo height (40–200 px)</label><input type="number" min="40" max="200" data-ak46-key="logoHeight" value="${c.logoHeight}"></div></div><div class="ak46-checks"><label class="ak46-check"><input type="checkbox" data-ak46-key="showLogo" ${c.showLogo?'checked':''}>Show logo</label><label class="ak46-check"><input type="checkbox" data-ak46-key="stretch" ${c.stretch?'checked':''}>Stretch logo</label></div><p class="ak46-help">Upload the logo once under Printing & Receipts. These settings persist with your shop backup.</p></div><div class="ak46-group"><h3>Bill content</h3><div class="ak46-field"><label>Document title</label><input data-ak46-key="documentTitle" value="${sv(c.documentTitle)}" placeholder="TAX INVOICE"></div><div class="ak46-checks">${[['showDate','Date / time'],['showAddress','Address'],['showPhone','Phone'],['showGstin','GSTIN'],['showCustomer','Customer'],['showPayment','Payment'],['showOrder','Order/table']].map(([k,t])=>`<label class="ak46-check"><input type="checkbox" data-ak46-key="${k}" ${c[k]?'checked':''}>${t}</label>`).join('')}</div></div><div class="ak46-group"><h3>Footer</h3><div class="ak46-field"><label>Footer message</label><textarea rows="2" data-ak46-key="footer">${sv(c.footer)}</textarea></div><div class="ak46-field"><label>Extra message / terms</label><textarea rows="2" data-ak46-key="footer2">${sv(c.footer2)}</textarea></div></div><div class="ak46-group"><h3>Arrange bill sections</h3><p class="ak46-help">Drag rows on a computer. On mobile, use ↑ and ↓ to change their order.</p><div class="ak46-sections" id="ak46-sections">${c.order.map((id,i)=>`<div class="ak46-section" data-ak46-id="${id}" draggable="true">${icon('grip')}<b>${sections[id]}</b><button type="button" data-ak46-move="up" aria-label="Move ${sections[id]} up" ${i===0?'disabled':''}>↑</button><button type="button" data-ak46-move="down" aria-label="Move ${sections[id]} down" ${i===4?'disabled':''}>↓</button></div>`).join('')}</div></div></section><section class="ak46-result"><h3>Actual print preview</h3><p class="ak46-help" style="margin:6px 0 12px">Demo invoice is shown by default. Select an existing invoice to preview or print a real bill.</p><div class="ak46-tabs" role="tablist" aria-label="Receipt paper preview">${['58mm','80mm','A4'].map(p=>`<button type="button" role="tab" data-ak46-paper="${p}" aria-selected="${c.paper===p}">${p}</button>`).join('')}</div><div class="ak46-stage" style="margin-top:12px"><div id="ak46-preview" style="width:100%"></div></div><p class="ak46-note" style="margin-top:12px">58mm and 80mm are rendered with the same raster canvas used for Bluetooth printing. A4 browser/PDF uses the same HTML layout shown above. Thermal results may vary with printer hardware and printable margins.</p><div class="ak46-toolbar" style="margin-top:12px"><button type="button" class="secondary" data-ak46-act="browser-print">Print / Save PDF</button><button type="button" class="amber" data-ak46-act="ble-print">Send to Bluetooth printer</button></div></section></div></div>`}
// v52: one professional editor workspace; the real saved inputs are MOVED into tool panels.
let activeStudioTool='layout',activeStudioMenu='',studioPreviewOnly=false;
const ak52Tools=[['layout','Layout','layout'],['branding','Branding','receipt'],['typography','Typography','type'],['content','Bill details','list'],['footer','Footer','message'],['arrange','Arrange','grip']];
function ak52Svg(name){const shape={layout:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',receipt:'<path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3Z"/><path d="M8 8h8m-8 4h8"/>',type:'<path d="M4 6V4h16v2M12 4v16m-4 0h8"/>',list:'<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h1M3 12h1M3 18h1"/>',message:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.9L3 21l1.9-5.5A8.5 8.5 0 1 1 21 11.5Z"/>',grip:'<path d="M8 5h.01M16 5h.01M8 12h.01M16 12h.01M8 19h.01M16 19h.01" stroke-width="3" stroke-linecap="round"/>',chevron:'<path d="m6 9 6 6 6-6"/>',printer:'<path d="M6 8V3h12v5M6 17H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6Z"/>',file:'<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M13 2v7h7"/>',undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12"/>',eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',check:'<path d="m5 12 4 4L19 6"/>'};return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shape[name]||shape.layout}</svg>`}
function ak52Transform(doc,c){
 const root=doc.querySelector('.ak46-studio');if(!root)return;
 root.classList.add('ak52-studio');
 const grid=doc.querySelector('.ak46-grid'),cfg=doc.querySelector('.ak46-config'),result=doc.querySelector('.ak46-result');
 const top=doc.querySelector('.ak46-top');
 top.querySelector('h2').textContent='Invoice Studio';
 const lead=top.querySelector('p');if(lead)lead.textContent='Design, preview and print — one professional workspace.';
 top.querySelector('.ak46-toolbar')?.remove();
 const toolbar=document.createElement('nav');toolbar.className='ak52-menubar';toolbar.setAttribute('aria-label','Invoice Studio workspace menu');
 toolbar.innerHTML=`<div class="ak52-menu-actions">${[['file','File'],['edit','Edit'],['design','Design'],['preview','Preview'],['print','Print']].map(([id,label])=>`<button type="button" class="ak52-menubtn" data-ak52-menu="${id}" aria-expanded="false">${label}${ak52Svg('chevron')}</button>`).join('')}</div><div class="ak52-menubar-right"><span class="ak52-saved">${ak52Svg('check')} Saved locally</span><button type="button" class="ak52-strong" data-ak52-act="save">${ak52Svg('check')} Save design</button></div><div class="ak52-menu-popup" id="ak52Popup" hidden></div><input id="ak52Import" type="file" accept=".json,application/json" hidden>`;
 grid.before(toolbar);
 const overview=cfg.querySelector('.ak49-overview');overview?.remove();
 const primary=cfg.querySelector('.ak49-primary-group');
 const accs=[...cfg.querySelectorAll(':scope > .ak49-accordion')];
 const byName=(needle)=>accs.find(el=>el.querySelector('summary')?.textContent.trim().toLowerCase().includes(needle));
 const editor=document.createElement('div');editor.className='ak52-editor-shell';
 const tools=document.createElement('nav');tools.className='ak52-toolnav';tools.setAttribute('aria-label','Receipt editing tools');
 tools.innerHTML=ak52Tools.map(([key,label,ic])=>`<button type="button" data-ak52-tool="${key}" class="${activeStudioTool===key?'selected':''}" aria-current="${activeStudioTool===key?'page':'false'}">${ak52Svg(ic)}<span>${label}</span></button>`).join('');
 const inspector=document.createElement('div');inspector.className='ak52-inspector';
 const panels=ak52Tools.map(([key,label])=>{const section=document.createElement('section');section.className='ak52-tool-panel';section.dataset.ak52Panel=key;section.hidden=key!==activeStudioTool;section.innerHTML=`<div class="ak52-section-head"><span class="ak52-kicker">RECEIPT EDITOR</span><h3>${label}</h3><p>${{layout:'Choose a receipt style, print mode and paper width.',branding:'Shop name, logo placement and logo size.',typography:'Typography, spacing and visual accents.',content:'Invoice identification and visible bill fields.',footer:'Footer copy, optional terms and promotions.',arrange:'Drag sections or use the arrow controls.'}[key]}</p></div>`;return section});
 const add=(k,element)=>{if(!element)return;const pane=panels.find(x=>x.dataset.ak52Panel===k);pane.append(element); if(element.matches('details'))element.open=true};
 add('layout',primary);add('branding',byName('header'));add('typography',byName('custom styling'));add('content',byName('bill content'));add('content',byName('invoice numbering'));add('footer',byName('footer'));add('arrange',byName('arrange'));
 const qr=document.createElement('div');qr.className='ak52-upi-field ak54-upi-settings';qr.innerHTML=`<h4>UPI payment QR on bills</h4><label for="ak52Upi">Shop UPI ID</label><input id="ak52Upi" data-ak52-setting="upiId" autocomplete="off" spellcheck="false" placeholder="shop@upi" value="${sv(settings.upiId||'')}"><label class="ak54-inline-check"><input type="checkbox" data-ak46-key="showPaymentQr" ${c.showPaymentQr!==false?'checked':''}> Print QR when payment method is UPI</label><label for="ak54QrSize">QR print size</label><select id="ak54QrSize" data-ak46-key="upiQrSize">${[[160,'Small · 160 dots'],[200,'Medium · 200 dots'],[240,'Large · 240 dots']].map(([n,t])=>`<option value="${n}" ${Number(c.upiQrSize)===n?'selected':''}>${t}</option>`).join('')}</select><p class="ak46-help">Only UPI bills get a QR. Demo UPI preview uses your saved UPI ID; scanning does not confirm a payment. Verify receipt in your bank app.</p>`;panels.find(x=>x.dataset.ak52Panel==='content').append(qr);
 panels.forEach(x=>inspector.append(x));editor.append(tools,inspector);cfg.replaceWith(editor);
 // Leave only one invoice selector and one paper switch in the preview area.
 const previewTitle=result.querySelector('h3');if(previewTitle)previewTitle.textContent='Print preview';
 const quick=document.createElement('div');quick.className='ak52-preview-top';quick.innerHTML=`<div><span class="ak52-kicker">LIVE OUTPUT</span><h3>Print preview</h3><p>Demo bill by default. Paper preview matches the selected rendering mode.</p></div><div class="ak52-preview-badge">${ak52Svg('eye')} LIVE</div>`;
 if(previewTitle){const help=previewTitle.nextElementSibling;previewTitle.remove();if(help?.classList.contains('ak46-help'))help.remove()}
 result.prepend(quick);
 const previewButtons=result.querySelector('.ak46-toolbar');
 if(previewButtons){
  previewButtons.classList.add('ak52-printactions');
  const visibleBar=document.createElement('div');
  visibleBar.className='ak52-visible-printbar';
  visibleBar.setAttribute('role','group');
  visibleBar.setAttribute('aria-label','Print actions');
  visibleBar.innerHTML=previewButtons.innerHTML;
  quick.after(visibleBar);
  previewButtons.remove();
 }
 const stage=result.querySelector('.ak46-stage');if(stage)stage.classList.add('ak52-preview-stage');
 root.dataset.ak52ActiveTool=activeStudioTool;root.classList.toggle('ak52-preview-only',studioPreviewOnly);
}
function panelHTML(){
 const c=config(),raw=basePanelHTML(),doc=document.createElement('div');doc.innerHTML=raw;
 const root=doc.querySelector('.ak46-studio');root.classList.add('ak49-studio');
 const configPanel=doc.querySelector('.ak46-config');
 const first=configPanel.querySelector('.ak46-group');
 first.outerHTML=`<div class="ak49-overview"><span class="ak49-section-label">One place for every invoice setting</span><h3>Design your receipt</h3><p>Change the format, check the real preview, then print. Your choices are saved with your shop data.</p></div>
 <div class="ak46-group ak49-primary-group"><h3>1. Format & paper</h3><div class="ak49-mode-selector ak50-mode-selector" role="group" aria-label="Print mode">
 ${[['text','Text only · Fastest','Native text, no bitmap'],['hybrid','Fast + Logo · Recommended','Small logo raster followed by fast native text'],['stored','Stored Logo · Advanced','Recall printer-preloaded NV logo, then text'],['raster','Styled Image','Full raster receipt with full design']].map(([v,t,desc])=>`<label class="ak49-mode ${c.printMode===v?'selected':''}"><input type="radio" name="ak49-print-mode" value="${v}" ${c.printMode===v?'checked':''}><strong>${t}</strong><small>${desc}</small></label>`).join('')}
 </div><p class="ak46-help">Text and hybrid use native ESC/POS. Image fallback handles non-ASCII text. Stored logo mode only recalls a logo already programmed into compatible printer firmware; it cannot upload or verify it.</p>
 <div class="ak46-cols"><div class="ak46-field"><label>Paper width</label><select data-ak46-key="paper">${[['58mm','58mm thermal'],['80mm','80mm thermal'],['A4','A4 / PDF']].map(([v,t])=>`<option value="${v}" ${c.paper===v?'selected':''}>${t}</option>`).join('')}</select></div>
 <div class="ak46-field"><label>Transmission speed</label><select data-ak46-key="printSpeed">${[['fast','Fast'],['balanced','Balanced'],['safe','Safe / compatibility']].map(([v,t])=>`<option value="${v}" ${c.printSpeed===v?'selected':''}>${t}</option>`).join('')}</select></div></div>
 <div class="ak46-field"><label>58mm / 80mm receipt style</label><select data-ak46-key="receiptStyle">${thermalPresets.map(([v,t])=>`<option value="${v}" ${c.receiptStyle===v?'selected':''}>${t}</option>`).join('')}</select></div>
 <p class="ak46-help" id="ak49-style-description">${sv((thermalPresets.find(x=>x[0]===c.receiptStyle)||thermalPresets[0])[2])}</p>
 <div class="ak46-cols ak50-align-options"><div class="ak46-field"><label>Thermal header</label><select data-ak46-key="headerAlignThermal">${[['center','Centered'],['left','Left aligned'],['right','Right aligned']].map(([v,t])=>`<option value="${v}" ${c.headerAlignThermal===v?'selected':''}>${t}</option>`).join('')}</select></div><div class="ak46-field"><label>Thermal footer</label><select data-ak46-key="footerAlignThermal">${[['center','Centered'],['left','Left aligned'],['right','Right aligned']].map(([v,t])=>`<option value="${v}" ${c.footerAlignThermal===v?'selected':''}>${t}</option>`).join('')}</select></div><div class="ak46-field"><label>Items</label><select data-ak46-key="itemsAlign">${[['left','Left aligned'],['center','Centered']].map(([v,t])=>`<option value="${v}" ${c.itemsAlign===v?'selected':''}>${t}</option>`).join('')}</select></div><div class="ak46-field"><label>Totals</label><select data-ak46-key="totalsAlign">${[['right','Right aligned'],['left','Left aligned'],['center','Centered']].map(([v,t])=>`<option value="${v}" ${c.totalsAlign===v?'selected':''}>${t}</option>`).join('')}</select></div></div>
 <div class="ak72-paper-saver" role="group" aria-label="Thermal receipt length"><label for="ak72PaperSaver"><strong>Paper Saver — receipt length</strong></label><select id="ak72PaperSaver" data-ak46-key="paperSaver">${[['standard','Standard · full receipt'],['compact','Compact · shorter bill'],['mini','Mini · maximum paper saving']].map(([v,t])=>`<option value="${v}" ${c.paperSaver===v?'selected':''}>${t}</option>`).join('')}</select><div class="ak72-paper-saver-grid"><label class="ak46-check ak72-paper-check"><input type="checkbox" data-ak46-key="showLogoPaperSaver" ${c.showLogoPaperSaver===true?'checked':''}>Show shop logo in Compact / Mini</label><div class="ak46-field"><label>Phone / address alignment</label><select data-ak46-key="paperSaverContactAlign">${[['left','Left aligned'],['center','Centered'],['right','Right aligned']].map(([v,t])=>`<option value="${v}" ${c.paperSaverContactAlign===v?'selected':''}>${t}</option>`).join('')}</select></div><div class="ak46-field"><label>Invoice heading alignment</label><select data-ak46-key="paperSaverInvoiceAlign">${[['center','Centered'],['left','Left aligned'],['right','Right aligned']].map(([v,t])=>`<option value="${v}" ${c.paperSaverInvoiceAlign===v?'selected':''}>${t}</option>`).join('')}</select></div><div class="ak46-field"><label>Footer message alignment</label><select data-ak46-key="paperSaverFooterAlign">${[['center','Centered'],['left','Left aligned'],['right','Right aligned']].map(([v,t])=>`<option value="${v}" ${c.paperSaverFooterAlign===v?'selected':''}>${t}</option>`).join('')}</select></div></div><p class="ak46-help">58/80mm only. Compact and Mini reduce headings, extra rows and spacing. You can optionally keep your logo, and control contact, invoice and footer alignment. Mini keeps invoice number, date, items, tax/discount (if charged), total, dues and Akaora footer. UPI QR stays if enabled. For GST invoices, confirm required details are included.</p></div>
 </div>`;
 // One compact editor, not a tall single wall of controls.
 for(const g of Array.from(configPanel.querySelectorAll(':scope > .ak46-group'))){
  if(g.classList.contains('ak49-primary-group'))continue;
  const h=g.querySelector('h3');const name=(h?.textContent||'').trim();
  if(/Print performance/i.test(name)){g.remove();continue}
  const details=document.createElement('details');details.className='ak49-accordion';
  details.open=/Header|Custom styling/i.test(name);
  const summary=document.createElement('summary');summary.textContent=name;
  const content=document.createElement('div');content.className='ak49-accordion-inner';
  while(g.firstChild){if(g.firstChild===h){h.remove();continue}content.appendChild(g.firstChild)}
  details.append(summary,content);g.replaceWith(details);
 }
 const branding=Array.from(configPanel.querySelectorAll('.ak49-accordion')).find(x=>x.querySelector('summary')?.textContent.includes('Header'));
 if(branding){const upload=document.createElement('div');upload.className='ak46-field';upload.innerHTML='<label for="ak49LogoFile">Shop logo (saved once)</label><input id="ak49LogoFile" type="file" accept="image/png,image/jpeg,image/webp" aria-label="Upload invoice logo"><small class="ak46-help">PNG, JPEG or WebP, up to 1.5 MB. Image stays with the shop backup.</small>';branding.querySelector('.ak49-accordion-inner').appendChild(upload);
 const block=document.createElement('div');block.className='ak50-logo-settings';block.innerHTML=`<h4>Logo for thermal receipts</h4><div class="ak46-cols"><div class="ak46-field"><label>Logo size preset</label><select data-ak46-key="logoPreset">${[['small','Small'],['medium','Medium'],['large','Large']].map(([v,t])=>`<option value="${v}" ${c.logoPreset===v?'selected':''}>${t}</option>`).join('')}</select></div><div class="ak46-field"><label>Stored logo slot</label><select data-ak46-key="storedLogoSlot"><option value="1" selected>1 · Printer NV slot</option></select></div></div><div class="ak46-checks"><label class="ak46-check"><input type="checkbox" data-ak46-key="logoCenter" ${c.logoCenter!==false?'checked':''}>Center logo</label><label class="ak46-check"><input type="checkbox" data-ak46-key="logoAutoFit" ${c.logoAutoFit!==false?'checked':''}>Auto-fit 58mm</label></div><p class="ak46-help">Width/height above cap the bitmap logo. Stored-logo recall requires printer-side programming; this website cannot confirm NV support. Fast + Logo is the recommended compatible choice.</p>`; branding.querySelector('.ak49-accordion-inner').appendChild(block)
 }
 const refStyles=new Set(['billbookClassic','billbookQr','sleekMinimal']);
 if(refStyles.has(c.receiptStyle)){
  const group=configPanel.querySelector('.ak49-primary-group');
  const extra=document.createElement('div');extra.className='ak51-reference-hint';
  extra.textContent=c.receiptStyle==='billbookQr'?'Billbook Premium QR prints a real QR only for a due invoice with a valid shop UPI ID. QR output automatically uses the matching image renderer. Demo receipts have no payable QR.':c.receiptStyle==='sleekMinimal'?'Sleek Minimal favors compact 58mm lines, numbered products and bold totals.':'Billbook Classic uses a centered shop identity and practical quantity/rate/amount rows.';
  group.appendChild(extra);
 }
 const footerGroup=Array.from(configPanel.querySelectorAll('.ak49-accordion')).find(x=>x.querySelector('summary')?.textContent.trim()==='Footer');
 if(footerGroup){
  const extra=document.createElement('div');extra.className='ak51-extra-controls';
  extra.innerHTML=`<div class="ak46-field"><label>Receipt promotional message (optional)</label><input data-ak46-key="receiptPromo" value="${sv(c.receiptPromo||'')}" maxlength="300" placeholder="e.g. Visit us again"></div><div class="ak46-field"><label>Receipt terms (optional)</label><textarea rows="2" data-ak46-key="receiptTerms" maxlength="300" placeholder="Returns / exchange policy">${sv(c.receiptTerms||'')}</textarea></div><p class="ak46-help">UPI QR printing is configured in the Bill details tool, for every receipt style.</p>`;
  footerGroup.querySelector('.ak49-accordion-inner').appendChild(extra);
 }
 const heading=doc.querySelector('.ak46-result > h3');if(heading)heading.textContent='Live print preview';
 const note=doc.querySelector('.ak46-note');if(note)note.textContent='Native text preview uses the same 32/48-character content as the ESC/POS command. Raster previews share their rendering canvas with Bluetooth output. Actual printer fonts and margins can differ.';
 const result=doc.querySelector('.ak46-result');result.classList.add('ak49-preview-panel');
 const invoiceChoices=(typeof invoices!=='undefined'?invoices.slice(-30).reverse():[]);
 const demoSel=document.createElement('div');demoSel.className='ak50-demo-row';demoSel.innerHTML=`<label for="ak50InvoiceSelect">Preview invoice</label><select id="ak50InvoiceSelect" aria-label="Choose invoice preview"><option value="demo" ${selectedInvoiceId==='demo'?'selected':''}>Demo invoice · Cash</option><option value="demo-upi" ${selectedInvoiceId==='demo-upi'?'selected':''}>Demo invoice · UPI (QR preview)</option>${invoiceChoices.map(i=>`<option value="${sv(i.id)}" ${String(selectedInvoiceId)===String(i.id)?'selected':''}>${sv(i.no||'Invoice')} · ${sv(i.customer||'Customer')}</option>`).join('')}</select><p id="ak54UpiWarning" class="ak54-upi-warning" role="status" hidden></p>`;
 const docToggle=document.createElement('div');docToggle.className='ak55-document-switch';docToggle.setAttribute('role','group');docToggle.setAttribute('aria-label','Preview document type');docToggle.innerHTML=`<button type="button" data-ak55-doc="bill" aria-pressed="${studioDocumentType==='bill'}">${icon('receipt')} Customer bill</button><button type="button" data-ak55-doc="kot" aria-pressed="${studioDocumentType==='kot'}">${icon('printer')} Kitchen order (KOT)</button>`;
 result.insertBefore(docToggle,result.querySelector('.ak46-tabs'));
 const kotOptions=document.createElement('div');kotOptions.className='ak72-kot-options';kotOptions.hidden=studioDocumentType!=='kot';
 kotOptions.innerHTML=`<label class="ak72-toggle"><input type="checkbox" id="ak72StudioKotPrices" data-ak72-kot-prices ${kotPricesEnabled()?'checked':''}><span><strong>Print item prices on KOT</strong><small>${kotPricesEnabled()?'ON · rates, line amounts and order total are shown':'OFF · kitchen copy shows items and quantities only'}</small></span></label>`;
 result.insertBefore(kotOptions,result.querySelector('.ak46-tabs'));
 result.insertBefore(demoSel,result.querySelector('.ak46-tabs'));
 configPanel.insertAdjacentHTML('beforeend',`<details class="ak49-accordion"><summary>Invoice numbering & tax defaults</summary><div class="ak49-accordion-inner ak46-cols"><div class="ak46-field"><label>Invoice prefix</label><input type="text" maxlength="12" data-ak49-setting="prefix" value="${sv(settings.prefix||'AP')}" placeholder="AP"></div><div class="ak46-field"><label>Default tax (%)</label><input type="number" min="0" max="100" step="0.01" data-ak49-setting="tax" value="${Number(settings.tax)||0}"></div><p class="ak46-help ak49-full">Applies to new bills. Existing paid invoices are unchanged.</p></div></details>`);
 ak52Transform(doc,c);
 return doc.innerHTML;
}
function showInSettings(){return;}
function renderStudioPreview(){const host=document.getElementById('ak46-preview');if(!host)return;const c=config(),i=sample();if(studioDocumentType==='kot')kotPreview(host,i,c);else void preview(host,i,c);const warn=document.getElementById('ak54UpiWarning');if(warn){warn.hidden=studioDocumentType==='kot'||!(String(i.method).toLowerCase()==='upi'&&c.showPaymentQr!==false&&!paymentQrUri(i,c));warn.textContent='UPI QR unavailable: enter a valid Shop UPI ID in Bill details to print the QR.';}document.querySelectorAll('[data-ak55-doc]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ak55Doc===studioDocumentType)));document.querySelectorAll('.ak72-kot-options').forEach(el=>el.hidden=studioDocumentType!=='kot');document.querySelectorAll('[data-ak72-kot-prices]').forEach(el=>el.checked=kotPricesEnabled());document.querySelectorAll('[data-ak46-paper]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.ak46Paper===c.paper)))}
function moveSection(id,dir){const c=config();let i=c.order.indexOf(id),j=i+(dir==='up'?-1:1);if(i<0||j<0||j>=c.order.length)return;[c.order[i],c.order[j]]=[c.order[j],c.order[i]];persist(c);redrawPanel()}
function redrawPanel(){const pane=document.querySelector('#ak46-settings-pane');if(!pane)return;const scroll=window.scrollY;pane.innerHTML=panelHTML();bind(pane);renderStudioPreview();window.scrollTo(0,scroll)}
function applyPrintSpeed(speed){const presets={fast:[180,6],balanced:[100,12],safe:[100,40]};const v=presets[speed]||presets.balanced;settings.bleSpeed=speed;settings.bleChunk=v[0];settings.bleDelay=v[1];save();}
let ak52Undo=[],ak52Redo=[],ak52LastChange={node:'',at:0};
function ak52History(pane){const snap=JSON.stringify(config());const now=Date.now();const focused=pane.querySelector(':focus');const node=focused?.dataset.ak46Key||focused?.dataset.ak49Setting||focused?.name||'';if(ak52Undo[ak52Undo.length-1]!==snap && (node!==ak52LastChange.node||now-ak52LastChange.at>700))ak52Undo.push(snap);if(ak52Undo.length>40)ak52Undo.shift();ak52Redo=[];ak52LastChange={node,at:now}}
function ak52Restore(next){if(!next)return;const obj=JSON.parse(next);persist({...def,...obj,order:Array.isArray(obj.order)?obj.order:[...def.order]});redrawPanel()}
function ak52Notify(message){if(typeof toast==='function')toast(message)}
function ak52Export(){const safe={...config()};const data=JSON.stringify({format:'Akaora Invoice Design',version:1,design:safe},null,2);const blob=new Blob([data],{type:'application/json'});const link=document.createElement('a');const url=URL.createObjectURL(blob);link.href=url;link.download='Akaora_Invoice_Design.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);ak52Notify('Invoice design exported')}
function ak52Import(file){if(!file)return;if(file.size>100000){ak52Notify('Design file is too large.');return;}const reader=new FileReader();reader.onload=()=>{try{const parsed=JSON.parse(reader.result),design=parsed.design;if(parsed.format!=='Akaora Invoice Design'||!design||typeof design!=='object')throw Error('Not an Akaora invoice design file');const allowed=new Set(Object.keys(def));const merged={...def};Object.keys(design).filter(k=>allowed.has(k)).forEach(k=>merged[k]=design[k]);if(!Array.isArray(merged.order)||new Set(merged.order).size!==5||merged.order.some(x=>!Object.hasOwn(sections,x)))merged.order=[...def.order];if(!thermalPresets.some(x=>x[0]===merged.receiptStyle))merged.receiptStyle=def.receiptStyle;if(!['A4','58mm','80mm'].includes(merged.paper))merged.paper='58mm';if(!['standard','compact','mini'].includes(merged.paperSaver))merged.paperSaver='standard';for(const k of ['header','subheader','footer','footer2','receiptTerms','receiptPromo'])merged[k]=String(merged[k]||'').slice(0,300);merged.logoWidth=Math.max(40,Math.min(200,Number(merged.logoWidth)||90));merged.logoHeight=Math.max(40,Math.min(200,Number(merged.logoHeight)||90));ak52Undo.push(JSON.stringify(config()));persist(merged);redrawPanel();ak52Notify('Design imported successfully');}catch(e){ak52Notify('Could not import design: '+e.message)}};reader.readAsText(file)}
function ak52MenuOptions(menu){switch(menu){case 'file':return [['save','Save design'],['export','Export design JSON'],['import','Import design JSON'],['reset','Reset invoice design']];case 'edit':return [['undo','Undo change'],['redo','Redo change'],['reset-order','Restore section order']];case 'design':return [['tool:layout','Receipt layout'],['tool:branding','Logo & branding'],['tool:typography','Typography & colors'],['tool:content','Bill fields'],['tool:footer','Footer & terms'],['tool:arrange','Arrange sections']];case 'preview':return [['show-preview','Focus preview'],['paper:58mm','58mm preview'],['paper:80mm','80mm preview'],['paper:A4','A4 preview']];case 'print':return [['tool:layout','Printing mode & speed'],['ble-print','Send to Bluetooth printer'],['browser-print','Print / Save PDF'],['bluetooth','Bluetooth connection help']];default:return []}}
function ak52Bind(pane){
 const close=()=>{const pop=pane.querySelector('#ak52Popup');if(pop)pop.hidden=true;pane.querySelectorAll('[data-ak52-menu]').forEach(b=>b.setAttribute('aria-expanded','false'))};
 pane.addEventListener('input',e=>{if(e.target.matches('[data-ak46-key],[data-ak49-setting]'))ak52History(pane)},true);
 pane.addEventListener('click',e=>{if(e.target.closest('[data-ak46-move]'))ak52History(pane)},true);
 pane.addEventListener('click',e=>{const button=e.target.closest('[data-ak55-doc]');if(!button)return;studioDocumentType=button.dataset.ak55Doc==='kot'?'kot':'bill';renderStudioPreview();});
 pane.addEventListener('input',e=>{if(e.target.dataset.ak52Setting==='upiId'){settings.upiId=String(e.target.value||'').trim().slice(0,100);save();renderStudioPreview()}});
 pane.addEventListener('change',e=>{if(e.target.matches('[data-ak72-kot-prices]')){settings.kotShowPrices=!!e.target.checked;save();const text=pane.querySelector('.ak72-kot-options small');if(text)text.textContent=settings.kotShowPrices?'ON · rates, line amounts and order total are shown':'OFF · kitchen copy shows items and quantities only';renderStudioPreview()}});
 pane.addEventListener('change',e=>{if(e.target.id==='ak52Import'){ak52Import(e.target.files?.[0]);e.target.value=''}});
 pane.addEventListener('click',e=>{
  const tool=e.target.closest('[data-ak52-tool]');if(tool){activeStudioTool=tool.dataset.ak52Tool;pane.querySelectorAll('[data-ak52-panel]').forEach(x=>x.hidden=x.dataset.ak52Panel!==activeStudioTool);pane.querySelectorAll('[data-ak52-tool]').forEach(x=>{const selected=x.dataset.ak52Tool===activeStudioTool;x.classList.toggle('selected',selected);x.setAttribute('aria-current',selected?'page':'false')});pane.querySelector('.ak52-studio')?.setAttribute('data-ak52-active-tool',activeStudioTool);close();return}
  const menu=e.target.closest('[data-ak52-menu]');if(menu){const which=menu.dataset.ak52Menu,pop=pane.querySelector('#ak52Popup');if(!pop)return;if(!pop.hidden&&activeStudioMenu===which){close();return}activeStudioMenu=which;pop.innerHTML=ak52MenuOptions(which).map(([id,name])=>`<button type="button" data-ak52-act="${id}">${sv(name)}</button>`).join('');pop.hidden=false;pane.querySelectorAll('[data-ak52-menu]').forEach(x=>x.setAttribute('aria-expanded',String(x===menu)));return}
  const act=e.target.closest('[data-ak52-act]');if(act){const action=act.dataset.ak52Act;close();if(action==='save'){persist(config());ak52Notify('Invoice design saved');return}if(action==='export'){ak52Export();return}if(action==='import'){pane.querySelector('#ak52Import')?.click();return}if(action==='reset'){if(confirm('Reset invoice design to defaults?')){ak52Undo.push(JSON.stringify(config()));persist({...def,order:[...def.order]});redrawPanel();}return}if(action==='undo'){if(ak52Undo.length){const old=ak52Undo.pop();ak52Redo.push(JSON.stringify(config()));ak52Restore(old)}else ak52Notify('No changes to undo');return}if(action==='redo'){if(ak52Redo.length){ak52Undo.push(JSON.stringify(config()));ak52Restore(ak52Redo.pop())}else ak52Notify('No changes to redo');return}if(action==='reset-order'){ak52Undo.push(JSON.stringify(config()));const c=config();c.order=[...def.order];persist(c);redrawPanel();return}if(action.startsWith('tool:')){pane.querySelector(`[data-ak52-tool="${action.slice(5)}"]`)?.click();return}if(action==='show-preview'){studioPreviewOnly=!studioPreviewOnly;pane.querySelector('.ak52-studio')?.classList.toggle('ak52-preview-only',studioPreviewOnly);return}if(action.startsWith('paper:')){const c=config();c.paper=action.slice(6);persist(c);renderStudioPreview();return}if(action==='bluetooth'){helper();return}if(action==='ble-print'||action==='browser-print'){const i=sample();if(i.id==='preview-only'){ak52Notify('Select a saved invoice before printing.');return}if(studioDocumentType==='kot'){if(action==='ble-print')void printBluetoothKot(i);else printBrowserKot(i);}else if(action==='ble-print')void printBluetooth(i);else printBrowser(i);return}}
  if(!e.target.closest('.ak52-menubar'))close();
 });
 pane.addEventListener('keydown',e=>{if(e.key==='Escape')close();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();persist(config());ak52Notify('Invoice design saved')}});
}
function bind(pane){if(pane.dataset.ak46Bound==='1')return;pane.dataset.ak46Bound='1';pane.addEventListener('change',e=>{if(e.target.id==='ak50InvoiceSelect'){selectedInvoiceId=e.target.value||'demo';renderStudioPreview();return;}if(e.target.name==='ak49-print-mode'){const c=config();c.printMode=e.target.value;settings.v20ReceiptMode=c.printMode==='raster'?'raster':'fast';settings.bleNative=c.printMode!=='raster';persist(c);redrawPanel();return;}
 if(e.target.id==='ak49LogoFile'){const file=e.target.files?.[0];if(!file)return;
  if(file.size>1.5*1024*1024){toast('Please choose an image under 1.5 MB.');return}
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)){toast('Use PNG, JPEG or WebP.');return}
  const reader=new FileReader();reader.onload=()=>{settings.shopLogo=String(reader.result||'');settings.billLogoEnabled=true;try{save();renderStudioPreview();toast('Invoice logo saved')}catch(e){toast('Unable to save image: '+e.message)}};reader.readAsDataURL(file);
 }
 if(e.target.dataset.ak46Key==='paper'){redrawPanel();return}
});
 pane.addEventListener('input',e=>{const k=e.target.dataset.ak49Setting;if(!k)return;
  if(k==='tax'){const v=Number(e.target.value);if(Number.isFinite(v)&&v>=0&&v<=100)settings.tax=v;else return}
  else if(k==='prefix')settings.prefix=String(e.target.value||'').replace(/[^A-Za-z0-9_-]/g,'').slice(0,12);
  save();
 });
pane.addEventListener('input',e=>{const k=e.target.dataset.ak46Key;if(!k)return;const c=config();if(['logoWidth','logoHeight','fontSize','headingSize','paperPadding'].includes(k)){const bounds={logoWidth:[40,200],logoHeight:[40,200],fontSize:[10,18],headingSize:[16,36],paperPadding:[12,48]};const n=Number(e.target.value);if(!Number.isFinite(n)||n<bounds[k][0]||n>bounds[k][1])return;c[k]=n}else if(k==='lineSpacing')c[k]=Math.min(2.2,Math.max(1.1,Number(e.target.value)||1.5));else if(e.target.type==='checkbox')c[k]=e.target.checked;else c[k]=String(e.target.value).slice(0,300);if(k==='logoPreset'){const set={small:[70,58],medium:[125,90],large:[190,140]};const [w,h]=set[c.logoPreset]||set.medium;c.logoWidth=w;c.logoHeight=h;pane.querySelector('[data-ak46-key=logoWidth]').value=w;pane.querySelector('[data-ak46-key=logoHeight]').value=h;}if(k==='footer')settings.footer=c.footer;if(k==='paper'){settings.paper=c.paper;if(c.paper!=='A4')settings.blePaper=c.paper==='80mm'?80:58;}persist(c);if(k==='printSpeed')applyPrintSpeed(c.printSpeed);renderStudioPreview()});pane.addEventListener('change',e=>{if(e.target.dataset.ak46Key){const c=config();persist(c);renderStudioPreview()}});pane.addEventListener('click',e=>{const tab=e.target.closest('[data-ak46-paper]');if(tab){const c=config();c.paper=tab.dataset.ak46Paper;persist(c);renderStudioPreview();return}const movement=e.target.closest('[data-ak46-move]');if(movement){moveSection(movement.closest('[data-ak46-id]').dataset.ak46Id,movement.dataset.ak46Move);return}const btn=e.target.closest('[data-ak46-act]');if(!btn)return;const action=btn.dataset.ak46Act;if(action==='reset'){if(confirm('Reset invoice design to defaults?')){persist({...def,order:[...def.order]});redrawPanel()}return}if(action==='bluetooth'){helper();return}if(action==='print'||action==='browser-print'||action==='ble-print'){if(typeof invoices==='undefined'||!invoices.length||sample().id==='preview-only'){toast('Select a saved invoice first. The sample is preview-only.');return;}if(studioDocumentType==='kot'){if(action==='ble-print')void printBluetoothKot(sample());else printBrowserKot(sample());}else if(action==='ble-print')printBluetooth(sample());else printBrowser(sample());return;}});let dragging=null;pane.addEventListener('dragstart',e=>{const row=e.target.closest('.ak46-section');if(!row)return;dragging=row.dataset.ak46Id;row.classList.add('dragging');if(e.dataTransfer)e.dataTransfer.effectAllowed='move'});pane.addEventListener('dragend',()=>{dragging=null;pane.querySelectorAll('.dragging').forEach(x=>x.classList.remove('dragging'))});pane.addEventListener('dragover',e=>{if(dragging&&e.target.closest('.ak46-section'))e.preventDefault()});pane.addEventListener('drop',e=>{const row=e.target.closest('.ak46-section');if(!row||!dragging)return;e.preventDefault();const from=dragging,to=row.dataset.ak46Id;if(from===to)return;const c=config();c.order.splice(c.order.indexOf(from),1);c.order.splice(c.order.indexOf(to),0,from);persist(c);dragging=null;redrawPanel()});ak52Bind(pane)}
function printStyles(size){return `@page{size:${size==='A4'?'A4':size+' auto'};margin:${size==='A4'?'10mm':'2mm'}}*{box-sizing:border-box}body{margin:0;background:#fff;color:#111;font:13px Arial,sans-serif} .ak46-sheet{background:#fff;color:#111;box-shadow:none;width:100%;max-width:none}.ak46-sheet *{box-sizing:border-box} .ak46-sheet-head,.ak46-sheet-brand{display:flex;align-items:flex-start;gap:12px}.ak46-sheet-head{justify-content:space-between;border-bottom:2px solid #777;padding-bottom:12px}.ak46-sheet-brand h2{margin:0 0 5px;font-size:var(--ak48-head-size,23px);text-align:var(--ak48-align,left)}.ak46-sheet-brand p{margin:2px 0;font-size:11px}.ak46-sheet-brand img{width:100%;height:100%}.ak46-logo-box{flex:none;overflow:hidden}.ak46-docmark{text-align:right}.ak46-docmark b{font-size:18px;color:var(--receipt-accent,#7554ca)}.ak46-docmark small{font-size:11px}.ak46-sheet-meta{display:flex;gap:15px;margin:14px 0}.ak46-meta-block{flex:1;padding:10px;background:#f5f6f8;border:1px solid #ddd;font-size:12px}.ak46-meta-block b{display:block;font-size:10px;color:#555}table{width:100%;border-collapse:collapse;min-width:0}td,th{text-align:left;padding:8px;border-bottom:1px solid #ddd;font-size:11px}td:last-child,th:last-child{text-align:right}.ak46-sheet-totals{margin:14px 0 0 auto;max-width:270px}.ak46-sheet-totals>div{display:flex;justify-content:space-between;margin:5px 0}.ak46-final-total{border-top:1px solid #aaa;padding-top:8px;font-size:17px;font-weight:bold;color:var(--receipt-accent,#7554ca)}.ak46-sheet-footer{text-align:center;margin-top:18px;border-top:1px solid #ddd;padding-top:12px;white-space:pre-line;font-size:11px} .ak46-thermal{display:block;max-width:100%;height:auto} @media print{html,body{margin:0!important;padding:0!important}body img{print-color-adjust:exact;-webkit-print-color-adjust:exact}}`}
function printBrowser(i){
 if(i?.id==='preview-only'){if(typeof toast==='function')toast('Select a saved invoice before printing');return}
 const c=config(),win=window.open('','_blank');
 if(!win){alert('Allow pop-ups to print invoices.');return}
 win.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice '+sv(i.no||'')+'</title><link rel="stylesheet" href="'+new URL('invoice-studio.css?v=49',location.href).href+'"><style>'+printStyles(c.paper)+'</style></head><body style="padding:0"></body></html>');
 win.document.close();
 const write=async()=>{try{
  if(c.paper==='A4'){win.document.body.innerHTML=sheetHTML(i,c);renderA4Qr(win.document.body,i,c)}
  else if(c.printMode!=='raster'&&!unicodeReceipt(i,c)){
   if(c.printMode!=='text'&&showReceiptLogo(c)){const logo=await logoCanvas(c);if(logo){const img=win.document.createElement('img');img.src=logo.toDataURL('image/png');img.style.cssText='display:block;width:'+c.paper+';height:auto;margin:0 auto';win.document.body.appendChild(img)}}
   const pre=win.document.createElement('div');pre.style.cssText='font:12px/1.4 monospace;white-space:pre;margin:0 auto;padding:'+(isPaperSaver(c)?'1px':'5px')+';width:'+ (c.paper==='80mm'?48:32)+'ch;color:#111;background:#fff';
   for(const seg of prominentReceiptSegments(i,c)){
     if(seg.kind==='qr'){const qr=qrReceiptCanvas(i,c,c.paper==='80mm'?576:384);if(qr){const image=win.document.createElement('img');image.src=qr.toDataURL('image/png');image.style.cssText='display:block;width:'+c.paper+';max-width:100%;margin:5px auto';pre.appendChild(image)}continue;}
     const row=win.document.createElement('div');row.textContent=seg.text||' ';
     row.style.cssText='white-space:pre;min-height:1.4em;text-align:'+(seg.align==='center'?'center':seg.align==='right'?'right':'left')+';font-weight:'+(seg.bold?'900':'400')+';font-size:'+(seg.double?'2em':seg.tall?'1.5em':'1em')+';line-height:'+(isPaperSaver(c)?'1.12':seg.double?'1.3':seg.tall?'1.55':'1.4')+';';pre.appendChild(row)
   }win.document.body.appendChild(pre)
  }
  else{const can=await thermalCanvas(i,c),img=win.document.createElement('img');img.src=can.toDataURL('image/png');img.style.cssText='display:block;width:'+c.paper+';max-width:100%';win.document.body.appendChild(img)}
  await Promise.all(Array.from(win.document.images).map(im=>im.complete?Promise.resolve():new Promise(res=>{im.onload=im.onerror=res})));
  win.focus();win.print();
 }catch(e){win.document.body.textContent='Unable to prepare invoice: '+e.message}};void write();
}
function helper(onContinue){document.querySelector('.ak46-helpback')?.remove();const overlay=document.createElement('div');overlay.className='ak46-helpback';overlay.innerHTML=`<div class="ak46-helpmodal" role="dialog" aria-modal="true" aria-label="Bluetooth printing help"><div class="ak46-helpicon">${icon('bluetooth')}</div><h2>Connect your thermal printer</h2><p>Akaora can guide the process. For your safety, Chrome/Edge must display its own device permission dialog.</p><ul><li>Turn on the 58mm or 80mm Bluetooth printer and enable pairing.</li><li>Use compatible Chrome/Edge on localhost or HTTPS.</li><li>Choose the printer in the browser popup. The device must support compatible Bluetooth Low Energy printing.</li><li>Run a test print before issuing customer bills.</li></ul><div class="ak46-helpactions"><button type="button" class="secondary" data-cancel>Cancel</button><button type="button" class="ak46-primary" data-connect>Continue to browser pairing</button></div></div>`;document.body.appendChild(overlay);const close=()=>overlay.remove();overlay.querySelector('[data-cancel]').onclick=close;overlay.addEventListener('click',e=>{if(e.target===overlay)close()});overlay.querySelector('[data-connect]').onclick=()=>{close();if(window.AkaoraThermal?.status?.().connected){if(typeof toast==='function')toast('Bluetooth printer is already connected.');return}if(typeof onContinue==='function'){onContinue();return}const btn=document.querySelector('#v20PrinterAction')||document.querySelector('#tpConnect');if(btn){pairBypass=true;btn.click();pairBypass=false}else if(window.AkaoraThermal?.connect){void window.AkaoraThermal.connect().catch(e=>{if(typeof toast==='function')toast(e.message)})}}}
let pairBypass=false;
document.addEventListener('click',e=>{if(pairBypass)return;const target=e.target.closest('#v20PrinterAction,#tpConnect');if(!target)return;if(window.AkaoraThermal?.status?.().connected)return;e.preventDefault();e.stopImmediatePropagation();helper(()=>{pairBypass=true;try{target.click()}finally{pairBypass=false}})},true);
async function printBluetooth(i){
 if(i?.id==='preview-only'){if(typeof toast==='function')toast('Select a saved invoice before printing');return}
 const c=config(),printer=window.AkaoraThermal;
 if(c.paper==='A4'){if(typeof toast==='function')toast('Choose 58mm or 80mm for Bluetooth printing.');return}
 if(!printer){alert('Bluetooth printing is not available in this browser.');return}
 const send=async()=>{try{
  if(!printer.status().connected)await printer.connect();
  const speed={fast:[180,6],balanced:[100,12],safe:[100,40]}[c.printSpeed]||[100,12];
  printer.configure({width:c.paper==='80mm'?80:58,chunkSize:speed[0],delay:speed[1],darkness:Number(settings.bleDark||180),command:'raster'});
  if(c.printMode!=='raster'&&!unicodeReceipt(i,c)){
   const prefixLogo=c.printMode==='hybrid' ? await logoCanvas(c):null;
   // Stored (NV) mode recalls slot 1; hardware must have been programmed separately.
   await printer.printNativeText(textOutput(i,c),'Fast '+(c.printMode==='stored'?'stored logo':c.printMode==='hybrid'?'logo + text':'text')+' invoice '+String(i.no||''),prefixLogo,{storedLogo:c.printMode==='stored'&&showReceiptLogo(c),segments:prominentReceiptSegments(i,c),qrCanvas:qrReceiptCanvas(i,c,c.paper==='80mm'?576:384),compactFeed:isPaperSaver(c)});
   if(i.id!=='preview-only'){i.billPrintRequestedAt=Date.now();save()}
   if(typeof toast==='function')toast(c.printMode==='stored'?'NV logo recall requested; verify logo and text on paper.':'Fast '+(prefixLogo?'logo + ':'')+'text data sent. Check paper output.');
  }else{
   const canvas=await thermalCanvas(i,c);
   await printer.printCanvas(canvas,'Styled invoice '+String(i.no||''),{compactFeed:isPaperSaver(c)});
   if(i.id!=='preview-only'){i.billPrintRequestedAt=Date.now();save()}if(typeof toast==='function')toast(c.printMode!=='raster'?'Non-ASCII text detected; image fallback sent. Check paper output.':'Styled image sent. Check actual paper.');
  }
 }catch(e){if(typeof toast==='function')toast('Bluetooth print failed: '+String(e.message||e));else alert(e.message)}};
 if(!printer.status().connected){helper(()=>{void send()});return}await send();
}
function updateModal(inv){const box=document.querySelector('#modalBody #printInvoice');if(!box)return;const c=config();const substitute=document.createElement('div');substitute.id='printInvoice';substitute.className='ak46-modal-invoice';substitute.style.cssText='background:#e7e8ef;padding:14px;border-radius:12px;overflow:auto;';box.replaceWith(substitute);const paper=c.paper;if(paper==='A4'){substitute.innerHTML=sheetHTML(inv,c);renderA4Qr(substitute,inv,c)}else preview(substitute,inv,c);const foot=document.getElementById('modalFoot');if(!foot)return;
 if(inv.restaurantOrder&&!foot.querySelector('[data-ak55-kot-preview]')){const btn=document.createElement('button');btn.type='button';btn.className='secondary';btn.dataset.ak55KotPreview='1';btn.textContent='Preview KOT';btn.onclick=()=>openKOTPreview(inv);foot.prepend(btn)}
 for(const b of foot.querySelectorAll('button')){const old=b.getAttribute('onclick')||'';if(old.includes('browserBillV5')||old.includes('printBill()')){b.removeAttribute('onclick');b.textContent='Print / PDF';b.onclick=()=>printBrowser(inv)}else if(old.includes('AkaoraV20.printBill')||old.includes('sendBillBluetooth')||old.includes('printBluetoothBill')){b.removeAttribute('onclick');b.textContent='Bluetooth custom bill';b.onclick=()=>printBluetooth(inv)}}}
const oldView=window.viewInvoice;if(typeof oldView==='function')window.viewInvoice=function(id){oldView.apply(this,arguments);const inv=invById(id);if(inv)updateModal(inv)};
const oldPageRender=window.pageRender;if(typeof oldPageRender==='function')window.pageRender=function(){const res=oldPageRender.apply(this,arguments);try{showInSettings()}catch(e){console.error('Invoice Studio settings mount failed',e)}return res};
function consolidateLegacySettings(){
 if(typeof page==='undefined'||page!=='settings')return;
 const host=document.querySelector('#content');if(!host)return;
 for(const card of host.querySelectorAll('.ak32-pane .ak32-settings-card')){
  const heading=(card.querySelector('.ak32-card-title,h3,h4')?.textContent||'').toLowerCase();
  if(heading.includes('invoice defaults')||heading.includes('printing & bill design')){
   card.hidden=true;card.style.display='none';

  }
 }
}
function ak52TidySettings(){
 if(typeof page==='undefined'||page!=='settings')return;
 const host=document.querySelector('#content');if(!host)return;
 host.querySelectorAll('.ak52-settings-handoff, .ak49-studio-link').forEach(el=>el.remove());
 // Hide legacy invoice-only controls but retain their fields in the DOM for existing saveSettings().
 const invoiceInputs=['sPrefix','sTax','sFooter','sPaper','sBillTheme','sPrintFooter','sWatermark','sUpi'];
 invoiceInputs.forEach(id=>{const el=host.querySelector('#'+id);if(!el)return;const wrap=el.closest('.ak46-field,.full,.fieldgrid > div,.print-options > div');if(wrap)wrap.style.display='none'});
 for(const h of host.querySelectorAll('h3,h4')){
  const title=(h.textContent||'').trim().toLowerCase();
  if(title==='invoice defaults'||title.includes('printing & bill design')||title==='upi qr prototype'){
   // Keep the actual legacy form inputs in DOM for saveSettings compatibility, but remove redundant UI.
   h.style.display='none';
   let cursor=h.nextElementSibling;
   while(cursor && !/^H[234]$/.test(cursor.tagName)){
    cursor.style.display='none';
    cursor=cursor.nextElementSibling;
   }
  }
 }
 // No repeated Invoice Studio banner: Studio remains reachable from its own page.
}
function mountStandalone(){if(typeof page==='undefined'||page!=='invoiceStudio')return;const host=document.querySelector('#content');if(!host)return;host.innerHTML='<section id="ak46-settings-pane" class="ak48-standalone-pane">'+panelHTML()+'</section>';const pane=host.querySelector('#ak46-settings-pane');bind(pane);renderStudioPreview();}
if(typeof navs!=='undefined'&&Array.isArray(navs)&&!navs.some(x=>x[0]==='invoiceStudio')){const index=navs.findIndex(x=>x[0]==='settings');navs.splice(index<0?navs.length:index,0,['invoiceStudio','Invoice Studio']);}
if(typeof I!=='undefined')I.invoiceStudio=icon('receipt');
const priorShell=window.appShell;if(typeof priorShell==='function')window.appShell=function(){const result=priorShell.apply(this,arguments);const mobile=document.querySelector('.mobile-nav');if(mobile&&!mobile.querySelector('[data-p="invoiceStudio"]')){const b=document.createElement('button');b.type='button';b.dataset.p='invoiceStudio';b.className=page==='invoiceStudio'?'active':'';b.innerHTML=icon('receipt')+'<span>Studio</span>';b.onclick=()=>go('invoiceStudio');const settingsButton=mobile.querySelector('[data-p="settings"]');if(settingsButton)settingsButton.before(b);else mobile.appendChild(b);}return result;};
const previousGo=window.go;if(typeof previousGo==='function')window.go=function(p){if(p!=='invoiceStudio')return previousGo.apply(this,arguments);if(!window.AkaoraEmailGate?.canAccess())return;page='invoiceStudio';appShell();pageRender();window.scrollTo(0,0);};
const beforeStudioPageRender=window.pageRender;if(typeof beforeStudioPageRender==='function')window.pageRender=function(){if(page==='invoiceStudio'){mountStandalone();return;}const r=beforeStudioPageRender.apply(this,arguments);if(page==='settings'){consolidateLegacySettings();ak52TidySettings()}return r;};
window.AkaoraInvoiceStudio={config,prominentReceiptSegments,rasterCanvas:thermalCanvas,paperPreview:thermalCanvas,receiptText:textOutput,receiptStyles:thermalPresets,printInvoiceById(id){const inv=invById(id);if(inv)printBrowser(inv)},printInvoice:printBrowser,printBluetooth,openBluetoothHelper:helper,previewKOT:openKOTPreview,kotSegments,kotCanvas:kotCanvasReceipt,printKOT:printBluetoothKot,mount:mountStandalone};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',showInSettings,{once:true});else showInSettings();
})();


if(typeof document!=='undefined'&&!document.getElementById('ak72-paper-saver-style')){const style=document.createElement('style');style.id='ak72-paper-saver-style';style.textContent=`.ak72-paper-saver-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}.ak72-paper-check{grid-column:1/-1;min-height:42px;padding:10px 12px;border:1px solid var(--ak33-line,#404048);border-radius:12px;background:var(--ak33-surface2,#292932)}@media(max-width:640px){.ak72-paper-saver-grid{grid-template-columns:1fr}}`;document.head.appendChild(style)}

