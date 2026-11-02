# Akaora Inventory Pro v83 — Security audit and limitations

## v83 follow-up

Standalone Barcode Studio source and iframe were removed, alongside the mobile navigation entry. Product barcode generation/scanning and direct print labels remain. The build now validates this exclusion. No external security audit or live penetration test was performed.

## Changes made

1. Hardened Firestore rules: only verified owners can access their own sync records, with explicit manifest/chunk schema validation and size limits. Unexpected paths denied by default. **Review and deploy separately**; the package does not modify live rules.
2. Added reproducible GitHub → Firebase Hosting CI/CD pipeline, with least-privilege GitHub workflow permissions and a required encrypted service-account secret.
3. Added static allowlist build so source reports, release screenshots, test scripts, local launchers, secret file patterns and customer `.akaora` backups aren't published by the automated build.
4. Added HTTPS hosting security headers: CSP (limited by legacy inline handlers), nosniff, frame restrictions, HSTS, Referrer-Policy and browser Permissions-Policy.
5. Removed third-party `api.qrserver.com` request from the Settings UPI QR generator: QR now renders locally via the existing QR library; payee data and payment amount are not sent to the remote QR image service.
6. Refreshes Firebase Auth token when a user is confirmed verified online, to support the verified-email Firestore rule.
7. Updated service worker cache and app build markers to v83, retaining offline-first behavior; new chunk uploads use 180k-character pieces to reduce Firestore per-document size risk.
8. Added CI regression checks and explicit deploy documentation.

## Risks still open

- **High: Stored/reflected XSS potential.** Existing app has large dynamically-generated HTML and many inline event handlers. `'unsafe-inline'` in CSP is only a compatibility concession. Requires significant UI refactor, a full input-to-output encoding review, and strict CSP.
- **High: Local customer data confidentiality.** Browser localStorage and IndexedDB contain offline records; client-side owner lock is not a cryptographic boundary. Consider encrypted IndexedDB + server-backed authorization for sensitive employee/finance data.
- **Medium: Multi-device update/conflict design.** Legacy chunk synchronization is not a per-record transactional model; needs concurrency simulations and restore drills.
- **Medium: Self-registration/abuse.** Email/password registration is open. Invitation restrictions, quotas, bot defense/App Check and MFA require deployment-specific configuration and possibly backend logic.
- **Medium: External scripts.** Firebase SDK is loaded from Google's CDN, and barcode/PDF helpers may fetch from third-party CDNs. Bundle/pin and use SRI where possible.
- **Medium: Payment assurance.** UPI QR is not cryptographic confirmation of a payment. Bill marking must not be treated as evidence of settlement.
- **Not verified:** Live auth/Firestore, App Check, hosting headers on deployed domain, Windows launcher, Bluetooth printer, independent vulnerability assessment.

## Security test plan

- Unauthenticated and unverified users: all reads/writes denied.
- Authenticated user A: may read its own manifest and chunks; cannot read user B or unknown database paths.
- Valid manifest and chunk write: allowed. Unexpected fields / invalid hash / oversize chunk: denied.
- Cloud sync across two verified devices and browser reload: data arrives without silent overwrite.
- Host: inspect browser Developer Tools → Network response headers; ensure CSP and Cache-Control present.
- Try an untrusted product name like `<img src=x onerror=alert(1)>` in an isolated test account: it must be rendered harmlessly throughout forms, receipts and search. A failure here is a release blocker.

**This is not a guarantee against breaches.**
