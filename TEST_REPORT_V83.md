# Akaora Inventory Pro v83 — Validation report

## Checks completed on this package
- Removed embedded advanced editor iframe and its standalone source/published directory.
- Removed desktop navigation entry and mobile More-menu entry; stripped former route handler.
- Product barcode generation, scanner, SVG display and direct print-label actions remain in source.
- Ran `npm run test`: reproducible static build, source/header/path assertions, Firestore rules static checks, HTML inline JavaScript syntax validation.
- Ran `node --check` for every separately loaded local JavaScript file and service worker.
- Verified the `public/` bundle excludes the removed editor assets; the PWA cache no longer precaches them.
- Verified the GitHub Actions YAML build check targets existing assets and Firebase Hosting deploy is configured for pushes to `main`.

## Not verified in this environment
- A live browser smoke test: sandbox Chromium requests to local `127.0.0.1` were blocked by administrator policy (`net::ERR_BLOCKED_BY_ADMINISTRATOR`). This is **not** evidence that the deployed app fails; actual interactive runtime behavior still needs verification.
- Real Firebase Authentication sign-in, remote Firestore security rules in an emulator or production, live cloud sync, Hosting deploy action, CSP response headers and physical barcode/receipt printing.
- Penetration testing and a complete input-to-output XSS audit; legacy `unsafe-inline` remains in the CSP.

**Release gate:** Test on a staging Hosting domain first. Export a customer backup before replacing an existing deployed version. Do not deploy database rules without checking them against your existing data and login flow.
