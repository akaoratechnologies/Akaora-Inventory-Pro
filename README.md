# Akaora Inventory Pro v95 — GitHub Pages-ready source

Responsive offline-first billing, inventory, staff/payroll, invoice and receipt design, basic Inventory Labels and Firebase Smart Sync. Advanced Barcode Studio remains removed.

## Deploy to GitHub Pages (no npm or terminal required)

1. Create an **empty repository** on GitHub (example: `akaora-inventory-pro`). Use a repository without existing starter files to simplify uploading.
2. Extract the ZIP locally. Open the `Akaora_Inventory_Pro_v95_GitHub_Ready` folder **inside** the ZIP. Upload its *contents* to the repository root, including the hidden `.github` folder. The repository root should contain `index.html`, `service-worker.js`, `.github/workflows/deploy-pages.yml`, and `scripts/build-pages.mjs`.
3. Set repository's default branch to `main` if it isn't already; commit the files to `main`.
4. In repository **Settings → Pages → Build and deployment**, set **Source = GitHub Actions**. The included workflow runs on pushes to `main` or via **Actions → Deploy Akaora Inventory Pro to GitHub Pages → Run workflow**.
5. Once the GitHub Actions `deploy` job succeeds, open the Pages URL (usually `https://USERNAME.github.io/REPOSITORY/`). It should load over HTTPS and offer install-to-home-screen where supported.
6. In [Firebase Console](https://console.firebase.google.com/) open the existing `akaora-inventory` project → **Authentication → Settings → Authorized domains**. Add the exact Pages **domain** (e.g. `USERNAME.github.io`, without `https://` or repository path); if using a custom domain, authorize that too. Make sure Email/Password sign-in is enabled.
7. In Firebase Console → **Firestore Database → Rules**, verify that your rules restrict every user to their own UID under `/users/{userId}/...`. The repository includes `firestore.rules` for review, but **GitHub Pages never deploys Firestore rules automatically**. Deploy them separately using Firebase CLI after reviewing. Do not weaken rules to `allow read, write: if true`.

**Important data migration:** Browser storage is per origin. Data saved at `http://localhost:8765` will not automatically appear on GitHub Pages. Before switching URLs, export `.akaora` backup from your local app and import it on the hosted app if needed, or verify a completed and conflict-free Firebase sync. Import can replace records: keep a backup. **Do not upload any backup to the public GitHub repo.**

## What gets deployed

The workflow validates relative paths and copies only runtime assets into a temporary `dist/` directory before uploading the artifact. It does **not** publish PowerShell launchers, Firestore rules, backups, project logs, tests, or local files. Everything in the repository itself may still be visible to collaborators or the public depending on repository permissions. No production data is included.

- The Firebase `apiKey` inside a Firebase Web app config is a **public client identifier**; it is not an administrative secret. Real access security comes from verified Firebase Authentication, Firestore rules, controls on permitted domains and sensible quotas.
- GitHub Pages is **static hosting**: no PHP/Node backend, server-side secret storage or administrator authorization can run there by itself.
- Bluetooth printer support depends on a compatible browser and printer. A GitHub Pages HTTPS URL is secure, but does not make Web Bluetooth work on unsupported browsers (particularly iOS Safari). System/PDF printing uses browser printing.
- The site is an offline-first PWA. The first online visit downloads assets; offline sign-in requires a previously verified session on the **same origin and browser**.
- No deployment can be guaranteed invulnerable. Review Firebase authentication settings, Firestore rules, security alerts and account permissions before using live customer records.

## Optional local development

On Windows extract the ZIP and run `START_WEBSITE.bat` (opens `http://localhost:8765/`). On a computer with Node.js 22, use `node scripts/build-pages.mjs` to verify and stage the site. For local HTTP preview you may use `python -m http.server 8765` from `dist/` or an equivalent static server.

## Repository layout

- `index.html`, `*.js`, `*.css`, icons, manifest, `service-worker.js`: runtime site sources.
- `.github/workflows/deploy-pages.yml`: automatic GitHub Pages pipeline.
- `scripts/build-pages.mjs`: validates and whitelists public files, supports `/REPOSITORY/` hosting.
- `firebase.json` and `firestore.rules`: existing Firestore rules configuration for separate deployment.
- `START_WEBSITE.bat`, `START_WEBSITE.ps1`: optional Windows localhost launcher.

## Troubleshooting

- **404 / old layout:** confirm `main` deploy job succeeded; verify files were uploaded to repository root, not nested inside another folder; use a private/incognito tab to inspect the new build version `akaora-build-v95.json`.
- **Auth error:** add correct GitHub Pages domain in Firebase Authorized domains; ensure Email/Password is enabled and verify the user's email.
- **Old inventory not visible:** data is origin-specific; export/import backup or check Smart Sync account and synchronization.
- **Offline after deploy:** open the deployed URL online at least once and allow offline assets to cache; do not clear browser storage.
- **Printing issues:** use the custom Printer Connection selector in Settings and select a compatible browser/printer; test an inexpensive dummy receipt first.
