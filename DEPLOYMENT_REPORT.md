# v95 — GitHub Pages deployment verification

Source baseline: Akaora Inventory Pro v94 Settings Printer Selector Fix.

## Changes made
- Repository-base-safe offline service worker navigation (`/<REPO>/` as well as `/`), cache build `v95`.
- Manifest `id` changed from root-absolute `/` to relative `./`; relative start and scope preserved.
- Startup/offline worker registration bumped to v95; Windows launcher and upgrade file bumped to v95.
- GitHub Pages Actions workflow added, with file-restricted build artifact and `.nojekyll` included.
- No .akaora backups or development screenshots are included in deployment output.
- Firebase client configuration and Smart Sync are retained, with manual authorized-domain/rules instructions.

## Checks completed
- **PASS** `node scripts/build-pages.mjs`: 39 runtime files copied into dist; no missing source assets.
- **PASS** all ordinary and module inline JavaScript blocks validated with Node.js `--check`.
- **PASS** v93 authenticated offline-fixture browser startup regression: Dashboard and Billing render.
- **PASS** 320, 390, 740 and 1280px viewports in mocked fixture without page-level overflow / uncaught exceptions.
- **PASS** service worker and modified JavaScript syntax validated with `node --check`.
- **PASS** workflow YAML parsed; deploy permissions and hidden `.nojekyll` artifact option validated.

## Manual checks still required
- GitHub Pages Actions build/deploy on a real repository and correct public URL.
- Firebase Authentication: add the real `USERNAME.github.io` or custom domain to Authorized domains.
- Firestore rules, email verification, cloud sync and account permissions in the live Firebase project.
- Printer connection and 58/80mm receipt printing on actual supported devices/browsers.
- Offline PWA refresh on GitHub Pages after first verified online visit.

Security scope: this is a static deployment packaging pass, not a penetration test or a guarantee against compromise.
