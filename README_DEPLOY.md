# Akaora Inventory Pro v83 — GitHub CI/CD + Firebase Hosting

**v83 changes:** Removed embedded and standalone Akaora Barcode Studio, its navigation route, mobile More-menu item, iframe, static assets and SW precache. Kept product barcode generation/scanning and direct product-label printing. Export a `.akaora` backup before updating.

**Build type:** Static web application, Firebase Authentication + Firestore Smart Sync. This is the **production-oriented Smart Sync** variant, not the Firebase-free test build.

## Deployment in 7 steps

1. **Export a `.akaora` backup** from your current working version before changing the deployed app or Firestore rules. Use a separate staging Firebase project for the first test if possible.
2. **Create a private GitHub repository** and upload the files in **this folder** to its root (`index.html`, `firebase.json`, `.github/workflows/`, etc.). Do NOT upload real `.akaora` files, passwords, service-account JSON or `.env` files. The repository's code can still be inspected by visitors to the published website.
3. Open **Firebase Console → Hosting** for Firebase project `akaora-inventory` and complete Hosting setup. Confirm the **Firebase Authentication → Settings → Authorized domains** include your published `*.web.app`, `*.firebaseapp.com`, and any custom domain you use. The GitHub repository URL itself is not a login domain.
4. In **GitHub → Repository → Settings → Secrets and variables → Actions → New repository secret**, add `FIREBASE_SERVICE_ACCOUNT_AKAORA_INVENTORY`. Use a JSON service-account key created for deployment. Give it the **minimum permissions required to deploy Firebase Hosting**; never commit this key or paste it into browser code. Prefer short-lived, keyless identity federation in a more advanced CI setup.
5. Run `node scripts/build-static.mjs && node scripts/security-check.mjs` locally (Node.js 22). The build produces the allowlisted `public/` folder. Alternatively run `npm run test` (no install required).
6. **BEFORE enabling Smart Sync against the real database**, carefully test the included `firestore.rules` using Firebase's Rules Playground or Emulator Suite with owner, other-user, unauthenticated and unverified accounts. After reviewing existing live rules/data, deploy them separately: `firebase deploy --only firestore:rules --project akaora-inventory`. **The GitHub workflow intentionally DOES NOT deploy Firestore rules automatically**, avoiding surprise database access changes.
7. Push to the `main` branch. `.github/workflows/deploy-firebase-hosting.yml` validates the app and deploys **Firebase Hosting**. Open `https://akaora-inventory.web.app` (or your configured domain) and verify sign-in, email verification, bills and a two-device sync scenario. Version endpoint: `/akaora-build-v83.json`.

### If you prefer GitHub Pages only

GitHub Pages is static hosting and cannot apply the custom security response headers in this `firebase.json`. It also uses a repository subpath by default and requires an Auth authorized domain. Therefore GitHub Pages **is not recommended as the production host** for this inventory app. Use GitHub as the code/deployment source and **Firebase Hosting** as the public HTTPS host.

## Production safety checklist

- Turn on **Firebase Authentication email/password**. Set appropriate password controls, abuse alerts and MFA if supported by your current auth setup (app UI does not presently implement MFA flow).
- Enable **Firebase App Check** for Firestore after integrating a valid web provider/site key and testing legitimate browser sessions. App Check is **not enabled by this build**.
- Review Google Cloud **API key API restrictions**. The Firebase web API key is a public app identifier, **not** a secret. Do not include a service account or generic private API key in client source.
- Configure Firestore billing alerts, usage monitoring and a budget. User account creation is self-service; if you require invite-only onboarding, add an admin-controlled allowlist on trusted backend rules.
- Use HTTPS; do not run or publish the no-Firebase local-test variant. Do not rely on disabling browser right-click/text selection for security.
- Keep backups offline. Deploying a new origin/domain means the browser's localStorage/IndexedDB data **does not automatically move** from `localhost:8765` to your domain. Export/import carefully; existing Firestore records may sync after successful login.
- Test Chrome/Edge thermal printing on HTTPS. Permissions and physical printer support vary.

## Remaining limits (read before production)

- The older UI still uses **many inline `onclick` and inline script/style blocks**, so the production Content-Security-Policy still permits `'unsafe-inline'`. It limits domains, frames, and resource types, but it does **not** eliminate XSS risk. Refactor inline handlers and apply a strict nonce/hash CSP before high-assurance deployment.
- Local inventory data and some user settings are stored in **browser storage**, and are accessible to anyone with sufficient access to that browser/device. Owner Lock is a UI access control, not encryption of all offline data. This architecture is **not appropriate for high-sensitivity documents** without further work.
- The legacy Smart Sync uses owner-scoped **chunked documents**; additional concurrency, offline conflict and authorized-user integration testing is required before a mission-critical launch.
- No app is breach-proof. This project is **deployment-prepared and security-hardened**, not independently audited or penetration-tested.

See `SECURITY_AUDIT_V83.md` for findings, scope and testing.
