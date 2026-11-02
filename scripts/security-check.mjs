import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const dist=path.join(root,'public');
const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
const rules=fs.readFileSync(path.join(root,'firestore.rules'),'utf8');
const worker=fs.readFileSync(path.join(dist,'service-worker.js'),'utf8');
const cloud=fs.readFileSync(path.join(dist,'cloud-sync-v81.js'),'utf8');
const hosting=JSON.parse(fs.readFileSync(path.join(root,'firebase.json'),'utf8')).hosting;
const npm=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const exists=(name)=>fs.existsSync(path.join(dist,name));
const checks=[
 ['Firestore denies global unrestricted access',!/allow\s+(?:read|write)\s*:\s*if\s+true/.test(rules)],
 ['Firestore requires verified account',rules.includes('request.auth.token.email_verified == true')],
 ['Firestore owner-only sync paths',rules.includes('/users/{userId}/akaoraSync/{key}') && rules.includes('request.auth.uid == userId')],
 ['v83 app header',html.includes('name="akaora-build" content="v83"')],
 ['v83 offline shell',worker.includes('akaora-inventory-shell-v83')],
 ['Cloud sync script preserved',html.includes('cloud-sync-v81.js')&&cloud.includes('SYNC_KEYS')],
 ['Barcode product tools preserved',html.includes('function generateUniqueBarcode()')&&html.includes('function openBarcodeLabels(id)')&&html.includes('function openScanner(mode)')],
 ['No Barcode Studio iframe/navigation',!html.includes('barcode-studio/')&&!html.includes('barcodeStudioPage')&&!html.includes("['barcodes','Barcode Studio']")&&!fs.readFileSync(path.join(dist,'v79-premium-mobile.js'),'utf8').includes("['barcodes','Barcode Studio'")],
 ['No standalone editor in hosting build',!exists('barcode-studio')&&!fs.existsSync(path.join(root,'barcode-studio'))],
 ['Removed-editor redirects',hosting.redirects?.some(x=>x.source==='/barcode-studio/**'&&x.destination==='/')],
 ['No service account secrets bundled',!fs.readdirSync(dist).some(n=>/service.?account|\.env|private.?key/i.test(n))],
 ['No old external Google Drive backup page',!html.includes('Connect Google Drive')],
 ['Required app assets present',exists('index.html')&&exists('v83-typography.css')&&exists('icon-192.png')&&exists('service-worker.js')],
 ['Release version pinned',npm.version==='83.0.0'&&exists('akaora-build-v83.json')],
 ['Production headers configured',hosting.headers?.some(x=>x.source==='**'&&x.headers?.some(y=>y.key==='Content-Security-Policy'))],
];
let fail=false;
for(const [label,ok] of checks){console.log((ok?'PASS ':'FAIL ')+label);if(!ok)fail=true}
if(fail)process.exit(1);
