# E6.2 service-worker offline foundation

**Date:** 14 October 2026
**Status:** Implemented locally; deployed offline acceptance remains open.
**Scope:** Versioned service-worker generation, production registration, shell/media precaching, navigation fallback, and cache cleanup.

## Research

E6.1 established the manifest and install icons, but the app had no service worker. A static manifest does not cache the application shell or media. The build already has a stable release metadata file and a public asset tree that can be enumerated after Vite finishes.

## Plan

- Generate `dist/sw.js` after Vite packaging so the worker contains the exact hashed shell, manifest, icons, release metadata, audio, and video files in that build.
- Derive the cache name from release metadata and a digest of precached file contents, so changed assets create a new cache.
- Install with `cache.addAll`, activate by deleting older `milo-precache-*` caches, and claim clients after activation.
- Use cache-first behavior for already-cached same-origin requests and a cached `index.html` fallback for offline navigation.
- Register only in production builds; keep development behavior unchanged.
- Test the worker generator independently, then verify generated output through the production build.

## Implementation

- Added typed worker-generation helpers in `scripts/serviceWorker.ts`.
- Added `scripts/generate-service-worker.ts` and wired it into `npm run build`.
- Added production-only registration in `src/main.tsx`.
- The local build generated a worker with 329 precache URLs, including all current media and the hashed CSS/JS shell.

## Verification

- The service-worker generator contract test was first run before implementation and failed because the module did not exist.
- The generator test now passes and checks cache versioning, precache entries, install/activate/fetch handlers, and navigation fallback.
- `npm run build` passes and emits `dist/sw.js` with 329 precache URLs.
- Full test, lint, AgentRoom, and source-diff checks pass locally.
- Actual HTTPS browser testing must still verify install, first-load activation, offline cold start, audio/video playback, progress persistence, game completion, and update/rollback behavior.

## Boundaries

This is not yet evidence for a “fully offline” claim. External Google Fonts are not precached, and no browser/device offline session has been accepted. E6.4 must establish asset-size/cache budgets before adding more media or expanding the precache policy.
