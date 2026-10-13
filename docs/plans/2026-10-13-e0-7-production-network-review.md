# E0.7 Production Network and Dependency Review

**Date:** 13 October 2026
**Scope:** Production deployment serving commit `979d300`
**Status:** In progress — safe exploratory coverage is recorded; destructive reset and induced audio-failure coverage remain open.

## Result

The deployed candidate is reachable in the authenticated Chrome session and the core local journey works. The review does not yet satisfy the complete E0.7 acceptance criterion because the available browser surface did not expose a HAR/resource-timing trace, the release metadata endpoint was blocked by the browser client, the reset action was intentionally not confirmed, and an audio failure was not induced against production.

Two findings need follow-up before treating this deployment as release-ready:

1. The parent sign-in modal is enabled and identifies itself as **Development mode**. No credentials were submitted, but the production deployment should not rely on a development Clerk instance for a release candidate.
2. The parent dashboard in the reviewed `979d300` deployment said the audio engine was an “Oxford-First & AI Cloudinary Pipeline” and labeled pre-recorded AI audio as “Active (Cloudinary CDN)”. The repository’s runtime resolver actually selects bundled local assets and does not implement a Cloudinary fallback. This wording was corrected in `1661e42` and verified in its Ready deployment; the Cloudinary runtime-dependency mismatch is closed, while the Clerk environment finding remains open.

### Follow-up verification

- Vercel reported the `1661e42` production deployment as **Ready**.
- The authenticated parent dashboard now shows `Audio Engine: Bundled Pre-Recorded Audio`, `Active (bundled local assets)`, and `CDN URLs remain generation metadata only.`
- The corrected copy no longer presents Cloudinary as an active browser dependency or repeats the unsupported Oxford-First label.

## Research: repository and deployment evidence

### Deployment and first visit

- Vercel showed the current production deployment for commit `979d300` as **Ready**.
- An unauthenticated `curl` request from the release-check environment returned a Vercel SSO `302` rather than the app HTML. The response set a secure, `HttpOnly`, `SameSite=Lax` `_vercel_sso_nonce` cookie and included `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Robots-Tag: noindex`, and `Cache-Control: no-store`.
- The authenticated browser session loaded the app shell and the title `Milo Phonics 🦁 — Pure British Sounds for Little Learners`.
- The observed first-party document resources were one module bundle under `/assets/` and one stylesheet under `/assets/`. No unexpected third-party script or iframe was visible in the page DOM during the inspected sign-in state.

The SSO response is an access-control property of the current deployment/session, not evidence that the public production URL is anonymously reachable. Release checks need an authenticated browser context or an intentionally public deployment target.

### Authored network destinations

| Destination | Runtime or build-time | Evidence and current treatment |
| --- | --- | --- |
| Current Vercel origin | Runtime | Serves the SPA, bundled assets, local audio, and `release.json`; deployment headers are configured in `vercel.json`. |
| `fonts.googleapis.com` and `fonts.gstatic.com` | Runtime | Authored as preconnect and stylesheet links in `index.html`; external font requests are therefore part of first visit. |
| Clerk | Runtime, conditional | `VITE_CLERK_PUBLISHABLE_KEY` enables the parent-only provider and sign-in modal. The production modal was visible and reported Development mode; no account action was completed. |
| Sentry | Runtime, conditional | Initialization requires a DSN and parent-granted optional diagnostics consent. The consent control remained off during this review, so no Sentry event or trace was generated. |
| Cloudinary | Build/publishing metadata | URLs remain in `generatedAudioManifest.ts` and generation metadata. `audioManifest.ts` prefers each entry’s `localUrl`; it does not make a runtime CDN fallback request. |
| OpenAI | Build/publishing tooling | The browser does not call OpenAI. Generation scripts and their credentials are outside the production browser dependency set. |
| Browser storage and audio APIs | Runtime, local | Progress and consent use `localStorage`; voice uses `HTMLAudioElement` and SFX use Web Audio. No microphone, camera, location, advertising ID, or browser speech-synthesis request was observed or authored as a runtime path. |

The browser automation surface did not expose a resource-timing or HAR capture. The destination list above is consequently the combination of source audit, DOM inspection, and the direct HTTP header capture, not a claim of packet-level completeness.

## Plan and execution: production flow matrix

| Flow | Result | Evidence / limitation |
| --- | --- | --- |
| First visit | Pass in authenticated browser | Home rendered with the four primary activity buttons and parent dashboard control. Anonymous HTTP access redirected to Vercel SSO. |
| Local mode | Pass | Opened `Let's Play!`, tapped `Sun`, and the UI advanced to 1 Star. Reload preserved the star, confirming the local progress path is active. The synthetic star remains in this browser session because reset was not confirmed. |
| Parent gate | Pass | Arithmetic challenge appeared and the correct answer opened the Parent Dashboard. This verifies the interaction gate, not legal parental-responsibility verification. |
| Sign-in/sync | Inspected, not completed | Clerk sign-in modal rendered with email/password and Google options and a same-origin virtual sign-up route. No credentials were entered and no sync/update request was initiated. The modal displayed Development mode. |
| Reset | Not executed | `Reset All Progress` was present. Confirmation was not accepted because it would delete local test progress and is a destructive action. |
| Audio success | Pass for exercised local asset | Tapping `Sun` completed and awarded a star. The source resolver selected a bundled `/audio/` path. An initial automatic prompt also logged a browser autoplay `NotAllowedError` before user interaction; this did not prevent the post-gesture local audio flow. |
| Audio failure | Not induced | The source contains `error` and rejected-`play()` handlers plus a watchdog. Fault injection would require browser/network controls unavailable in this session; no production failure claim is made. |
| Mobile session | Pass for smoke layout | Applied a temporary `390×844` viewport, inspected the parent surface, and restored the default viewport. No overflow or missing primary controls was observed in the DOM snapshot. This is not a device matrix or touch-hardware certification. |
| Release metadata | Not verified in browser | Opening `/release.json` was blocked by the browser client with `ERR_BLOCKED_BY_CLIENT`; the app tab was restored to the production home. |

## Headers, cookies, storage, and injected code

- The direct HTTP response exposed only a Vercel SSO nonce cookie to the unauthenticated check. The browser page’s `document.cookie` was empty in the inspected session, consistent with the nonce being `HttpOnly`.
- The repository’s storage keys are `playful_phonics_progress_v2`, legacy `playful_phonics_progress_v1`, and `milo_phonics_sentry_consent_v1`. Raw values were not collected.
- Reload behavior verified that progress is written locally. The browser evaluation surface could not enumerate storage or resource timing reliably, so this report records keys from source and behavior from the UI rather than values.
- The page DOM contained the app module and stylesheet as first-party resources. The Codex browser added its own favicon decoration; that instrumentation is not an application dependency and is excluded from the dependency inventory.
- The Clerk modal exposed links to a same-origin virtual sign-up route and `go.clerk.com/components`; neither link was followed.

## Findings and follow-up

1. Replace or explicitly configure the Clerk deployment key for a real production instance before enabling parent sync in a release environment. Track the vendor, DPA, retention, deletion, and parent-verification decisions under E1.6/E1.11.
2. Keep the corrected parent-facing audio labels aligned with the runtime resolver. Do not add a remote fallback or describe Cloudinary as a browser dependency without an approved design and production test.
3. Add an authenticated, repeatable release-check procedure that captures response headers and a network trace without recording credentials, tokens, nonce values, or child progress.
4. Complete reset and audio-failure checks in an isolated test profile/browser context after explicit authorization for the destructive reset step; leave production release status open until those checks are recorded.
5. Re-run `/release.json` verification outside the browser-client block and reconcile its version/commit with the deployment shown in Vercel.

## Acceptance status

E0.7 remains **in progress**. The safe first-visit, local-mode, parent-gate, sign-in inspection, mobile smoke check, and correction of the Cloudinary wording mismatch are recorded. Reset, induced audio failure, full resource trace, Clerk production-mode decision, and release metadata verification remain open.
