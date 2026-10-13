# E0.7 Production Network and Dependency Review

**Date:** 13 October 2026
**Scope:** Production deployment serving the Clerk proxy fix in commit `e298631`, with the local-development default correction in `c461ef2` (follow-up to the earlier `4381d46`, `979d300`, `1661e42`, and `282ed50` reviews)
**Status:** In progress — the requested production flow, fault-injection checks, and Clerk production-mode/proxy verification are complete; credentialed sync evidence and vendor-acceptance decisions remain open.

## Result

The deployed candidate is reachable in the authenticated Chrome session and the core local journey works. The follow-up review completed the isolated reset, induced audio-failure, release-metadata, and first-visit network-trace checks. The release-channel remediation was redeployed and verified live. The Clerk production proxy was deployed with a server-only secret, the direct and rewritten Clerk asset paths returned `200`, and the parent sign-in modal opened without a Development-mode indicator. E0.7 remains open because credentialed sync/delete evidence and the associated vendor/privacy decisions are not accepted.

The remaining findings need follow-up before treating this deployment as release-ready:

1. The Clerk production route is technically configured, but no credentialed sync/delete test was performed. Vendor/DPA, retention, deletion, transfer, security, and parent-verification decisions remain open under E1.6/E1.11.
The earlier `channel: local` finding was corrected by the release-channel remediation in `282ed50`; the live endpoint now returns `channel: production` with the serving commit. The parent dashboard in the reviewed `979d300` deployment said the audio engine was an “Oxford-First & AI Cloudinary Pipeline” and labeled pre-recorded AI audio as “Active (Cloudinary CDN)”. The repository’s runtime resolver actually selects bundled local assets and does not implement a Cloudinary fallback. This wording was corrected in `1661e42` and verified in its Ready deployment; the Cloudinary runtime-dependency mismatch is closed.

### Follow-up verification

- Vercel reported the `1661e42` production deployment as **Ready**.
- The authenticated parent dashboard now shows `Audio Engine: Bundled Pre-Recorded Audio`, `Active (bundled local assets)`, and `CDN URLs remain generation metadata only.`
- The corrected copy no longer presents Cloudinary as an active browser dependency or repeats the unsupported Oxford-First label.

### Follow-up execution — 13 October 2026

The follow-up was run against `https://milo-phonics.vercel.app/` in an isolated Chrome profile. No credentials, production account actions, Sentry events, or raw child-progress values were submitted.

- **Release metadata:** `GET /release.json` returned `200` with `version: 1.0.0`, `commit: 4381d46b03c3fc6423b68cce65a919c716477489`, and `channel: local`. The response exposed `Cache-Control: no-store` and `Strict-Transport-Security`; the commit matches the serving deployment, but the channel mismatch is an E0.7 finding.
- **Release-channel remediation:** the repository now gives explicit `RELEASE_CHANNEL` precedence and derives the fallback from Vercel `VERCEL_ENV`; a simulated production build for commit `9d4d05e` emitted `channel: production`, followed by the live verification recorded below.
- **Live release-channel recheck:** after redeployment of `282ed50`, `GET /release.json` returned `200` with version `1.0.0`, the full serving commit `282ed501c23ee383e53e5a69fdf3c22a1b41b72d`, and `channel: production`. The channel finding is closed.
- **Clerk production proxy:** the `e298631` Ready deployment registered `/api/clerk-proxy` on Node.js 24.x. Vercel logs recorded `200` for both `/api/clerk-proxy` and the `/__clerk/npm/@clerk/clerk-js@5.128.0/dist/clerk.browser.js` rewrite. The browser loaded the current app asset, opened the parent Clerk modal, and `hasDevelopmentMode` was false. `CLERK_SECRET_KEY` remained server-only in Vercel Production and was not committed; `c461ef2` preserves the normal direct Clerk behavior for local `pk_test` development.
- **Reset:** after one explicit practice interaction produced two stars, the parent-gated reset returned the browser state to `0` stars, Level 1 progress `0/12`, and one unlocked level. This was performed only after explicit confirmation for the disposable local test state.
- **Induced audio failure:** Chrome DevTools Network Conditions was set to offline. The `word.sun.mp3` media request failed with `net::ERR_INTERNET_DISCONNECTED`; `AudioService` recorded the failure as `NotSupportedError`, and the child flow advanced to the next card without awarding a star or becoming stuck. Network conditions were restored to “No throttling” afterward.
- **First-visit trace:** a sanitized HAR was exported to `/Users/bhavna_siddharth/Downloads/milo-phonics.vercel.app.har` and retained outside the repository. The trace contained 52 requests, 3.3 MB transferred, 4.6 MB of resources, and timings of 231 ms DOMContentLoaded, 387 ms load, and 832 ms finish. The earlier trace included a Clerk Development asset; the follow-up production proxy check verified the new `/__clerk` route without submitting credentials. Unrelated Chrome-extension warnings were excluded from application findings.
- **UI state:** after reset, exploration remained at zero stars, higher levels stayed locked, the parent gate opened correctly, the optional diagnostics control remained off, and the parent audio panel continued to describe bundled local audio with CDN metadata only.

## Research: repository and deployment evidence

### Deployment and first visit

- The follow-up serving build for commit `4381d46` was reachable and returned matching release metadata; the earlier `979d300` and corrected `1661e42` deployment observations remain historical context.
- An unauthenticated `curl` request from the release-check environment returned a Vercel SSO `302` rather than the app HTML. The response set a secure, `HttpOnly`, `SameSite=Lax` `_vercel_sso_nonce` cookie and included `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Robots-Tag: noindex`, and `Cache-Control: no-store`.
- The authenticated browser session loaded the app shell and the title `Milo Phonics 🦁 — Pure British Sounds for Little Learners`.
- The observed first-party document resources were one module bundle under `/assets/` and one stylesheet under `/assets/`. No unexpected third-party script or iframe was visible in the page DOM during the inspected sign-in state.

The SSO response is an access-control property of the current deployment/session, not evidence that the public production URL is anonymously reachable. Release checks need an authenticated browser context or an intentionally public deployment target.

### Authored network destinations

| Destination | Runtime or build-time | Evidence and current treatment |
| --- | --- | --- |
| Current Vercel origin | Runtime | Serves the SPA, bundled assets, local audio, and `release.json`; deployment headers are configured in `vercel.json`. |
| `fonts.googleapis.com` and `fonts.gstatic.com` | Runtime | Authored as preconnect and stylesheet links in `index.html`; external font requests are therefore part of first visit. |
| Clerk | Runtime, conditional | `VITE_CLERK_PUBLISHABLE_KEY` enables the parent-only provider and sign-in modal. Production requests use the same-origin `/__clerk` proxy backed by server-only `CLERK_SECRET_KEY`; the modal opened without Development mode. No account action was completed. |
| Sentry | Runtime, conditional | Initialization requires a DSN and parent-granted optional diagnostics consent. The consent control remained off during this review, so no Sentry event or trace was generated. |
| Cloudinary | Build/publishing metadata | URLs remain in `generatedAudioManifest.ts` and generation metadata. `audioManifest.ts` prefers each entry’s `localUrl`; it does not make a runtime CDN fallback request. |
| OpenAI | Build/publishing tooling | The browser does not call OpenAI. Generation scripts and their credentials are outside the production browser dependency set. |
| Browser storage and audio APIs | Runtime, local | Progress and consent use `localStorage`; voice uses `HTMLAudioElement` and SFX use Web Audio. No microphone, camera, location, advertising ID, or browser speech-synthesis request was observed or authored as a runtime path. |

The follow-up retained a sanitized HAR from the browser trace. It is outside the repository and is not treated as a release artifact because it can contain request metadata. The destination list above remains the combination of source audit, DOM inspection, trace review, and direct HTTP header capture; it is not evidence that vendor contractual, retention, or deletion terms have been accepted.

## Plan and execution: production flow matrix

| Flow | Result | Evidence / limitation |
| --- | --- | --- |
| First visit | Pass in authenticated browser | Home rendered with the four primary activity buttons and parent dashboard control. Anonymous HTTP access redirected to Vercel SSO. |
| Local mode | Pass | Opened `Let's Play!`, tapped `Sun`, and the UI advanced to 1 Star. Reload preserved the star, confirming the local progress path is active; the later confirmed reset returned the disposable profile to zero stars. |
| Parent gate | Pass | Arithmetic challenge appeared and the correct answer opened the Parent Dashboard. This verifies the interaction gate, not legal parental-responsibility verification. |
| Sign-in/sync | Inspected, not completed | Clerk sign-in modal rendered with email/password and Google options and a same-origin virtual sign-up route. No credentials were entered and no sync/update request was initiated. Production mode was verified from the absence of the Development-mode indicator. |
| Reset | Pass in isolated disposable profile | After explicit confirmation, reset returned the browser to 0 stars, Level 1 `0/12`, and one unlocked level. |
| Audio success | Pass for exercised local asset | Tapping `Sun` completed and awarded a star. The source resolver selected a bundled `/audio/` path. An initial automatic prompt also logged a browser autoplay `NotAllowedError` before user interaction; this did not prevent the post-gesture local audio flow. |
| Audio failure | Pass under induced offline condition | `word.sun.mp3` failed with `net::ERR_INTERNET_DISCONNECTED`; the AudioService logged the failure and the child flow advanced without a stuck state or reward. |
| Mobile session | Pass for smoke layout | Applied a temporary `390×844` viewport, inspected the parent surface, and restored the default viewport. No overflow or missing primary controls was observed in the DOM snapshot. This is not a device matrix or touch-hardware certification. |
| Release metadata | Pass; channel remediation verified | Direct HTTP verification returned 200 and matched the deployed commit `282ed50`; the redeployed endpoint now reports `channel: production`. The browser’s direct endpoint view remained blocked by the client, so the release check uses the authenticated-safe HTTP result. |

## Headers, cookies, storage, and injected code

- The direct HTTP response exposed only a Vercel SSO nonce cookie to the unauthenticated check. The browser page’s `document.cookie` was empty in the inspected session, consistent with the nonce being `HttpOnly`.
- The repository’s storage keys are `playful_phonics_progress_v2`, legacy `playful_phonics_progress_v1`, and `milo_phonics_sentry_consent_v1`. Raw values were not collected.
- Reload behavior verified that progress is written locally. The browser evaluation surface could not enumerate storage or resource timing reliably, so this report records keys from source and behavior from the UI rather than values.
- The page DOM contained the app module and stylesheet as first-party resources. The Codex browser added its own favicon decoration; that instrumentation is not an application dependency and is excluded from the dependency inventory.
- The Clerk modal exposed links to a same-origin virtual sign-up route and `go.clerk.com/components`; neither link was followed. The proxy forwarded the Clerk asset request without exposing the server secret to the browser.

## Findings and follow-up

1. Complete a credentialed sync/delete test only with approved synthetic parent data, then track the vendor, DPA, retention, deletion, transfer, security, and parent-verification decisions under E1.6/E1.11.
2. Keep the corrected parent-facing audio labels aligned with the runtime resolver. Do not add a remote fallback or describe Cloudinary as a browser dependency without an approved design and production test.
3. Add an authenticated, repeatable release-check procedure that captures response headers and a network trace without recording credentials, tokens, nonce values, or child progress.
4. Keep the release metadata check in the deployment checklist so future serving builds continue to report the intended channel and commit.
5. Keep the production Clerk proxy configuration under change control; technical configuration is verified, but parent sync remains conditional on the owner/vendor decisions above.

## Acceptance status

E0.7 remains **in progress**. First visit, local mode, parent gate, sign-in inspection, reset, induced audio failure, mobile smoke, sanitized trace, release metadata identity/channel checks, and Clerk proxy/production-mode verification are recorded. Completion is blocked by the missing credentialed sync/delete evidence and owner acceptance of the remaining vendor/dependency evidence; no production credentials or child data were used.
