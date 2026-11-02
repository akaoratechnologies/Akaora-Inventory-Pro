# Akaora Inventory Pro v83 — GitHub Deployment (Hinglish)

**Recommended:** GitHub repository se **Firebase Hosting** par automatic deployment. Sirf GitHub Pages use karne se `firebase.json` ke security headers apply nahi honge.

1. Pehle current v81 mein se **Export .akaora** backup download kar lo.
2. GitHub par naya **Private repository** banao. Is ZIP ke **andar wale folder ki files** repository root mein upload karo — `index.html`, `.github`, `scripts`, `firebase.json`, `firestore.rules` sab root se milne chahiye. Real customer backup ZIP ke andar add mat karna.
3. Firebase Console mein `akaora-inventory` project open karo → **Hosting** setup complete karo.
4. GitHub repository ke **Settings → Secrets and variables → Actions → New repository secret** mein secret ka exact naam `FIREBASE_SERVICE_ACCOUNT_AKAORA_INVENTORY` rakho. Iski value deployment service-account JSON hogi; key ko GitHub file mein kabhi add mat karna. Firebase CLI ka `firebase init hosting:github` flow bhi is setup mein help kar sakta hai.
5. Firebase Authentication → **Settings → Authorized domains** mein published website ka domain add/check karo. Firebase Hosting ka `akaora-inventory.web.app` address usually use hoga. Custom domain use karoge toh use bhi authorize karna.
6. Node.js 22 par optional local check: `npm run test`. GitHub push karte hi Action website build-check karke **Hosting** deploy karegi. Deploy ka link GitHub → Actions run mein aayega.
7. **Firestore rules alag review/test/deploy karna:** pehle Firebase Rules Playground/Emulator mein test karo, phir `firebase deploy --only firestore:rules --project akaora-inventory`. **Automatic workflow rules deploy nahi karta**, taaki live database access unexpected change na ho.
8. Deployed app open karke version `/akaora-build-v83.json` se verify karo. Phir email verification, billing, sync, offline test aur admin lock check karo. Data automatically `localhost` se new website origin par copy nahi hota.

**Security reminder:** App ko koi 100% breach-proof nahi bana sakta. Current UI mein inline handlers aur browser-local sensitive data ke risks abhi baaki hain. High-risk business data ke liye penetration test aur code refactor required hai. See `SECURITY_AUDIT_V83.md`.

**v83 note:** Barcode Studio ka alag page, embedded frame aur mobile More item remove kar diya gaya hai. Products me barcode generate, scan aur direct label print ka option available hai. GitHub Action se Firebase Hosting par deploy hota hai; GitHub Pages is config me direct production host nahi hai.
