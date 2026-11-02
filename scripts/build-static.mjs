import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const dest = path.join(root, 'public');
const files = [
  "akaora-offline.js",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
  "invoice-studio.css",
  "invoice-studio-v49.css",
  "studio-workspace-v52.css",
  "invoice-studio.js",
  "quotation-builder.js",
  "quotation-builder.css",
  "accounts-v65.js",
  "accounts-v65.css",
  "v60-glass-motion.css",
  "v60-glass-motion.js",
  "v83-typography.css",
  "v79-premium-mobile.css",
  "v79-premium-mobile.js",
  "v79-structured.css",
  "v79-structured.js",
  "v80-topbar-lock.css",
  "v80-topbar-lock.js",
  "cloud-sync-v81.js",
  "index.html",
  "service-worker.js",
  "akaora-build-v83.json"
];
fs.rmSync(dest,{recursive:true,force:true});
fs.mkdirSync(dest,{recursive:true});
for(const f of files){
 const file=path.join(root,f),to=path.join(dest,f);
 fs.mkdirSync(path.dirname(to),{recursive:true});
 fs.copyFileSync(file,to);
}
console.log(`Production assets built: ${files.length} files (inventory only)`);
