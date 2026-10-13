# Session — E0.7 release-channel remediation

Date: 13 October 2026

## Intent

Remove the deployment-channel drift found during E0.7 without changing the production environment directly.

## RPI execution

- **Research:** `vite.config.ts` used `RELEASE_CHANNEL ?? (CI === 'true' ? 'ci' : 'local')`; it did not inspect Vercel’s build environment. The live `/release.json` consequently reported `channel: local` despite serving a Vercel production deployment.
- **Plan:** Add a typed channel resolver with explicit override precedence, Vercel environment fallback, and preserved CI/local defaults. Test the resolver before implementation.
- **Implement:** Added `resolveReleaseChannel` and wired it into Vite; added five release-metadata tests covering production, preview, override, CI, and local behavior.
- **Verify:** The focused test first failed because the helper was absent, then passed. The full suite passed with 46 tests; lint and build passed; a simulated `VERCEL_ENV=production RELEASE_COMMIT=9d4d05e npm run build` emitted `channel: production`.

## Boundary

This fixes source/build behavior only. The live URL still requires redeployment and a fresh `/release.json` check. Clerk Development mode and all vendor/privacy acceptance decisions remain unchanged and approval-bound.
