# E6.1 installable PWA foundation

**Date:** 14 October 2026
**Status:** Implemented locally; HTTPS browser installation verification remains open.
**Scope:** Web App Manifest, install icons, app-shell metadata, and installation guidance.

## Research

The repository had no web manifest, install icon files, or iOS home-screen metadata. The app shell already had a theme colour and description, but there was no E6.1 installation contract. There is also no service worker; offline caching is therefore explicitly outside this change and remains E6.2 work.

## Plan

- Add a standards-shaped `public/manifest.webmanifest` with stable name, scope, start URL, standalone display, theme/background colours, portrait orientation, and 192/512/maskable icons.
- Add a simple Milo vector source and generated PNG icons for Android/browser installation and the iOS touch icon.
- Link the manifest and iOS metadata from `index.html`.
- Add a Vitest contract covering manifest fields, icon existence, PNG signatures/dimensions, and app-shell links.
- Add parent-facing installation guidance that does not imply offline availability.

## Implementation

- Added `public/manifest.webmanifest`.
- Added `public/icons/milo-icon.svg` and `milo-icon-maskable.svg` as source artwork.
- Generated `milo-180.png`, `milo-192.png`, `milo-512.png`, and `milo-512-maskable.png`.
- Linked the manifest, Apple touch icon, and iOS standalone metadata in `index.html`.
- Added `tests/pwaManifest.test.ts`.

## Verification

- The contract test was first run before implementation and failed for the missing manifest and app-shell links.
- The contract test now passes: 2 tests passed, including actual PNG signature and dimension checks.
- `npm run build`, full lint, full tests, AgentRoom validation, and an HTTPS browser installation check remain part of the acceptance evidence. The build has not been used to claim offline operation.

## Follow-up

- Run the built app from a real HTTPS deployment in Android Chrome/Edge and iOS Safari; record whether install/add-to-home-screen controls appear and whether the standalone launch opens at `/`.
- Implement E6.2 separately with a service worker and explicit cold-start/audio/video/progress tests before using “offline” or “fully offline” claims.

