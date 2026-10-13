# Milo Phonics Data-Flow Inventory

**Review date:** 13 October 2026
**Owner:** Unassigned — privacy/data-flow owner required
**Status:** Technical inventory complete for authored repository surfaces; vendor, hosting, retention, deletion, subprocessor, and legal fields remain unresolved.
**Authority:** This inventory reconciles the current source, the E0.7 production review, the privacy-notice draft, and the current architecture record. It is not a DPA, DPIA, Data Safety declaration, or legal opinion.

## How to read this inventory

“Observed” means the behavior is supported by source or the recorded production review. “Not evidenced” means the repository does not establish the fact; it must not be filled with a convenient assumption. Vendor/service fields remain open until an owner attaches current terms, configuration evidence, and a deletion/retention record.

## Runtime data flows

| Flow ID | Source and fields | Purpose | Destination / role | Storage and retention | Deletion / rights path | Security and evidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DF-001 | Child play state: level, stars, explored letters/objects, tap counts, last-played timestamp/position, focus mode | Resume local play and show parent progress | Browser `localStorage`; product operator is controller only if the state is personal data in context | `playful_phonics_progress_v2`; legacy `v1` may be read once for migration; retained until site data is cleared or app reset rewrites the state | `Reset All Progress` rewrites the app state; browser site-data deletion clears the origin; no cloud deletion is performed | Sanitization and malformed-data fallback are tested in `progressService.test.ts`; raw production values were not collected | Observed; parent disclosure and deletion UX review open |
| DF-002 | Diagnostic consent: `granted` or `denied` | Remember a parent’s optional diagnostics choice | Browser `localStorage`; no external destination | `milo_phonics_sentry_consent_v1`; retained locally until cleared or overwritten | Parent can revoke from the dashboard; no server-side deletion is implied | Defaults off and fails closed on storage errors; covered by consent tests | Observed; notice wording aligned |
| DF-003 | Optional Clerk account identifiers, authentication state, and exported progress metadata | Parent sign-in and cross-device progress backup | Clerk SDK/provider through the same-origin `/__clerk` proxy; controller/processor role is not assigned | Clerk account/profile storage and browser SDK state; retention and region not evidenced | Sign-out is available; in-app account deletion/export and cloud-progress deletion are not implemented | Client uses `VITE_CLERK_PUBLISHABLE_KEY`; `CLERK_SECRET_KEY` is server-only in the Vercel Production function; direct and rewritten asset requests returned `200`, and the production modal showed no Development-mode indicator; no credentialed sync was performed | Conditional; P0 vendor/privacy gate |
| DF-004 | Google Fonts stylesheet/font requests; ordinary browser request metadata may be visible to Google | Render Fredoka and Nunito typography | `fonts.googleapis.com` and `fonts.gstatic.com`; vendor role/terms not accepted | Google-hosted request/CDN logs; retention and region not evidenced | No app-level deletion path; self-hosting decision is open | Authored in `index.html`; first-visit network dependency recorded in E0.7 | Observed; hosting/privacy review open |
| DF-005 | Optional Sentry error/performance event after consent: release/environment, browser technical details, sanitized stack; vendor may infer geography from connection metadata | Repair broken sessions | Sentry project `milo-phonics`; vendor processor/controller role and DPA acceptance are open | Current project review records Developer-plan 30-day error retention and EU storage; backups/subprocessors require confirmation | Revocation stops future reports; app has no vendor deletion workflow for already-ingested events | Consent gate, client scrubbers, server scrubbers, IP-storage prevention, and synthetic verification are recorded in `docs/sentry.md` and the vendor review | Conditional; E0.6/P0 gate |
| DF-006 | Static HTML, JS, CSS, local audio/video assets, and `release.json` requests | Deliver the application and educational experience | Current Vercel deployment/origin; host role, logs, region, and retention are not evidenced | Static delivery and ordinary host security/operational logs are possible; exact retention/configuration is unknown | No app-level host-log deletion path | E0.7 recorded SSO behavior, headers, HSTS, and no-store response on the reviewed path; packet-level trace incomplete | Observed; hosting review open |
| DF-007 | Browser audio element requests for bundled local MP3/MP4 assets and Web Audio oscillator effects | Play voice and interface effects | Local app origin and browser audio APIs; no third-party audio destination in current resolver | No app persistence beyond play progress; browser media buffering is implementation-dependent | No app-level audio-history record | Runtime resolver prefers local assets; Cloudinary URLs are metadata only and no browser fallback is implemented | Observed; asset rights gate open |
| DF-008 | Parent-supplied sign-in data and support/payment data | Future account support, purchases, or support operations | No payment, support desk, advertising, analytics, microphone, camera, or location flow was found in authored source | Not applicable in current build | Not applicable in current build | Must be added to this inventory before enabling any new SDK or feature | Not implemented |

## Build and publishing flows

| Flow ID | Source and fields | Destination | Retention / deletion | Required evidence | Status |
| --- | --- | --- | --- | --- | --- |
| DF-101 | Fixed educational text, model/voice settings, and audio-generation credentials from local environment | OpenAI TTS scripts; browser does not call OpenAI | Account usage, prompts, outputs, and provider retention are not evidenced here | Account/terms snapshot, operator, generation date, prompts/source text, output acceptance, AI-audio disclosure, and deletion/retention settings | Development-only; E1.1/E1.9 gate |
| DF-102 | Generated audio files and publication metadata/URLs | Cloudinary upload tooling and manifest; browser resolver selects local paths first | Account, CDN cache/log retention, access controls, region, and deletion are not evidenced here | Account owner, contract/terms, resource deletion policy, URL access policy, logs, and local-vs-CDN release decision | Publishing metadata; not a browser runtime dependency |
| DF-103 | Source maps and release metadata when `SENTRY_AUTH_TOKEN` is configured | Sentry Vite plugin/release service | Source-map retention and deletion require vendor/release-owner record | Token scope, release/commit mapping, access control, deletion, and no secret/child-data inclusion | Conditional build flow; E0.6/E0.7 review |
| DF-104 | npm package metadata, lockfile versions, and declared licences | npm registry during installation/build; no runtime app data | Build-system/cache retention is environment-specific | SPDX output and full notices are tracked in [third-party notices](third-party-notices.md) | Engineering evidence recorded; release artifact retention open |

## Reconciled authored network destinations

- Current Vercel origin: runtime delivery, release metadata, local assets, and possible hosting logs.
- Google Fonts: runtime stylesheet/font requests authored in `index.html`.
- Clerk: conditional parent-only runtime provider and sign-in/sync surface, with production asset traffic routed through the same-origin Vercel proxy.
- Sentry: conditional parent-consented diagnostics and optional build source-map upload.
- OpenAI: development audio-generation scripts only.
- Cloudinary: development/publishing metadata and upload scripts only; no runtime fallback.
- Browser storage and audio APIs: local runtime surfaces.

The E0.7 browser session could not provide a complete HAR/resource-timing trace and did not complete credentialed Clerk sync or cloud deletion. The follow-up verified the production proxy route and modal mode without submitting credentials. This inventory therefore separates authored destinations from packet-level proof and keeps E0.7/E1.3 open.

## Open evidence ledger

| Evidence item | Owner | Required artifact | Status |
| --- | --- | --- | --- |
| Controller identity and privacy contact | Product/privacy owner | Approved contact and controller record | Missing |
| Local storage and reset/deletion behavior | Engineering/privacy owner | UX decision and tested deletion procedure | Partial; local reset is observed, cloud deletion is absent |
| Clerk account/data-flow record | Privacy/vendor owner | Current terms/DPA, subprocessors, transfer, retention, deletion/export, production configuration, and synthetic sync/delete evidence | Partial; production proxy configuration verified, vendor and sync evidence missing |
| Google Fonts treatment | Engineering/privacy owner | Version/licence record and self-host/remote-request decision | Missing |
| Sentry data-flow acceptance | Privacy/vendor owner | DPA, retention/backups/subprocessors, inferred-geography decision, deletion process | Missing |
| Vercel/hosting evidence | Infrastructure owner | Host contract, logs, regions, retention, security, deletion, injected-code review | Missing |
| OpenAI generation evidence | Audio/content owner | Terms snapshot, generation log, QA, disclosure, retention/deletion | Missing |
| Cloudinary publishing evidence | Infrastructure/audio owner | Account/contract, resource/log retention, access controls, deletion and CDN decision | Missing |
| New vendor or SDK change control | Release owner | Reconciled inventory before enablement | Process required |

## Release controls

E1.3 is **in progress**. This inventory is sufficient to route evidence requests and reconcile E0.7’s authored destinations, but it does not establish controller/processor roles, lawful basis, deletion rights, retention, transfers, security, or vendor acceptance. The companion [E1.6 vendor review](plans/2026-10-13-e1-6-vendor-review.md) records the configuration decision and owner ledger for each service. Do not enable a new SDK, production Clerk sync, production Sentry DSN, remote audio fallback, analytics, payment, support, or advertising flow without updating this inventory and obtaining the applicable owner review.
