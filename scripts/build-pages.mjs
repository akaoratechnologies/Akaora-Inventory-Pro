/**
 * Build and verify the public Github Pages output.
 * Built-in Node modules only: no npm install / no untrusted bundler required.
 * Copies ONLY the runtime app assets from the existing service worker manifest.
 * Customer backups, Firebase rules and local Windows tools stay OUT of public site.
 */
import { readFileSync, writeFileSync, existsSync, rmSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const out = join(root, 'dist');
const workerText = readFileSync(join(root, 'service-worker.js'), 'utf8');
const match = workerText.match(/const ASSETS\s*=\s*(\[[\s\S]*?\]);/);
if (!match) throw Error('Cannot find service-worker ASSETS; refusing an incomplete deployment');
// ASSETS is JSON-compatible string array; parse as JSON, never execute JS.
const listed = JSON.parse(match[1]);
const direct = new Set(['index.html', 'service-worker.js', 'akaora-offline.js',
  'manifest.webmanifest', 'icon-192.png', 'icon-512.png',
  'akaora-build-v95.json', 'akaora-upgrade-v95.html', '.nojekyll']);
for (const item of listed) {
  if (item === './') continue;
  if (!item.startsWith('./') || item.includes('..') || item.includes('\\')) throw Error('Unsafe service-worker asset: ' + item);
  direct.add(item.slice(2));
}
const html = readFileSync(join(root, 'index.html'), 'utf8');
for (const m of html.matchAll(/<(?:link|script)\b[^>]*?\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)) {
  const url = m[1];
  if (/^(?:https?:|data:|blob:|#)/i.test(url)) continue;
  if (url.startsWith('/')) throw Error('Root-absolute asset is incompatible with GitHub Pages repo paths: ' + url);
  const filename = url.split(/[?#]/)[0].replace(/^\.\//, '');
  if (!filename) continue;
  if (filename.includes('..') || filename.includes('\\')) throw Error('Unsafe HTML asset: ' + filename);
  direct.add(filename);
}
for (const name of direct) {
  const file = join(root, name);
  if (!existsSync(file) || !statSync(file).isFile()) throw Error('Missing required runtime asset: ' + name);
}
const manifest = JSON.parse(readFileSync(join(root, 'manifest.webmanifest'), 'utf8'));
if (manifest.id?.startsWith('/') || manifest.start_url?.startsWith('/') || manifest.scope?.startsWith('/')) {
  throw Error('PWA manifest must use paths relative to GitHub Pages repo base');
}
if (!workerText.includes('scopePath') || !workerText.includes('relativePath')) {
  throw Error('Service worker must handle repository subpath before deploying');
}
// The application embeds ordinary inline code, not a build-step or server backend.
if (!html.includes('akaora-email-only-firebase')) throw Error('Expected Firebase authentication module is missing');
if (!html.includes('cloud-sync-v81.js')) throw Error('Existing Smart Sync module is missing');
rmSync(out, {recursive:true, force:true});
mkdirSync(out, {recursive:true});
for (const name of [...direct].sort()) {
  const file = join(root, name);
  const target = join(out, name);
  const parent = target.slice(0, target.lastIndexOf('/'));
  mkdirSync(parent, {recursive:true});
  copyFileSync(file, target);
}
// GitHub Pages can treat a directory beginning with _ as Jekyll sources without this file.
writeFileSync(join(out, '.nojekyll'), '');
// Explicitly refuse accidental upload of backup/customer records to public hosting.
for (const name of readdirSync(out)) {
  if (/\.(?:akaora|apora|bak|db|sqlite|log|pem|p12|pfx)$/i.test(name) || /(?:firebase-adminsdk|service.?account)/i.test(name)) {
    throw Error('Unsafe file selected for public deployment: ' + name);
  }
}
console.log(`PASS: ${direct.size} runtime files verified and staged in dist/`);
console.log('PASS: GitHub repository subpath PWA support and Firebase module presence verified');
console.log('PASS: No customer backup or local Windows launcher in public artifact');
