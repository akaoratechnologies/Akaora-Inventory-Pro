import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=path.resolve(import.meta.dirname,'..');
const html=fs.readFileSync(path.join(root,'public/index.html'),'utf8');
const pattern=/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
let match,count=0,skipped=0,fail=0;
while((match=pattern.exec(html))){
 const attrs=match[1],body=match[2];
 if(/\bsrc\s*=/.test(attrs)||/\btype\s*=\s*["'](?!text\/javascript)[^"']*["']/i.test(attrs)){
  skipped++;continue;
 }
 if(!body.trim())continue;
 count++;
 try{new vm.Script(body,{filename:'index.html:inline-'+count});}
 catch(err){console.error('FAIL inline JS #'+count+' '+err.message);fail++;}
}
console.log('Inline scripts parsed: '+count+' ('+skipped+' external or non-JS tags ignored)');
if(fail)process.exit(1);
