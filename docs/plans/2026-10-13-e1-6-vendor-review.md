# E1.6 Vendor and SDK Review

**Review date:** 13 October 2026
**Owner:** Unassigned — privacy, infrastructure, and release owners required
**Status:** Technical assessment recorded; contract, DPA, subprocessor, retention, transfer, and production-configuration acceptance incomplete.

This review is based on authored source, the E0.7 production network review, the current architecture record, and the E1.3 data-flow inventory. It does not accept vendor terms, constitute a DPA/DPIA, or establish a lawful basis.

## Decision standard

Before a vendor is enabled or relied on for a child/unknown-age session, retain: current product/plan and contract terms; controller/processor roles; subprocessors; data fields and purpose; hosting/transfer locations; retention, backup, deletion, and rights process; security controls; configuration evidence; parent notice wording; and an owner sign-off. A package licence is not a service-term acceptance.

## Assessment matrix

| Vendor/surface | Current role and evidence | Data/credential boundary | Existing controls | Open acceptance evidence | Configuration decision |
| --- | --- | --- | --- | --- | --- |
| Clerk | Conditional runtime provider when `VITE_CLERK_PUBLISHABLE_KEY` is configured; parent sign-in and progress sync are in `ParentClerkSync`; reviewed deployment modal reported Development mode and no credentials were submitted | Parent email/name/authentication data and exported progress metadata may leave the browser; publishable key is public runtime config; no credential was retained | Parent dashboard is behind arithmetic gate; core play works without an account; no account is enabled when key is absent | Production instance/key, allowed sign-in providers, controller/processor role, DPA, subprocessors, region/transfer, cookies, retention, deletion/export, security, parental-responsibility approach, and tested sync/delete flow | **Do not accept Development mode as production. Keep conditional and release-blocked.** |
| Google Fonts | Runtime stylesheet/preconnect in `index.html` for Fredoka and Nunito; E0.7 recorded the destination as a first-visit dependency | Browser request metadata may be visible to Google; no font files are bundled; no credentials | No app account or child content is sent intentionally; use is visible in the data-flow/privacy drafts | Resolved font versions/licence notices, remote-request terms, controller/processor analysis, region/transfer, logging/retention, self-hosting decision, and updated notice | **Current remote request remains a release review item; self-host or accept only after privacy/rights decision.** |
| Cloudinary | Development/publishing pipeline and manifest metadata; `audioManifest` prefers local URLs and has no runtime CDN fallback | Generated audio uploads, public IDs, URLs, account credentials, CDN/cache/log metadata; no child runtime data by design | Secrets are environment-only; local audio is runtime-first; no browser fallback claim | Account owner/plan, terms, region, access controls, resource and CDN-log retention, deletion, public URL policy, subprocessors, and local-vs-CDN release decision | **Keep out of browser runtime; retain metadata only under asset/vendor review.** |
| OpenAI | Development-only TTS scripts; browser does not call OpenAI; generated manifest records model/voice metadata | Fixed educational source text, generated outputs, API credential, account usage/retention settings; no child session data by design | Credentials are environment-only; parent/README AI-audio disclosure added; generated assets are locally bundled | Account/plan terms at generation time, operator, prompts/source archive, output retention/deletion, human pronunciation acceptance, AI disclosure scope, and rights record | **Keep out of browser runtime; no production generation claim until records are retained.** |
| Vercel/hosting | Current deployment origin serves SPA, assets, local media, and `release.json`; E0.7 captured SSO redirect/cookie and security headers on unauthenticated HTTP path | Request/IP/UA/security/operational logs may be available to host; deployment config and injected code need confirmation | HSTS, `X-Frame-Options: DENY`, `X-Robots-Tag: noindex`, `Cache-Control: no-store` and SSO behavior were observed on reviewed path | Account/contract, region/edge, logs, retention/deletion, subprocessors, access/security, analytics/injected code, SSO/public access decision, and release metadata trace | **Remain behind reviewed access control until deployment owner confirms intended audience and logs.** |
| Sentry | Optional parent-consented diagnostics and conditional source-map upload; separate vendor review already records Developer plan, EU storage, 30-day error retention, scrubbers, and inferred geography | Sanitized event/trace fields plus vendor connection metadata; auth token is build-only secret | Default-off consent, client/server scrubbers, no replay/logging/metrics, IP-storage prevention, no child progress/audio/free text in intended payload | DPA acceptance, controller/processor role, backups, subprocessors, deletion, inferred-geography treatment, retention confirmation, source-map access/deletion, and production DSN decision | **Do not set production DSN until privacy/vendor acceptance.** |

## Configuration and evidence controls

- Keep `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `OPENAI_API_KEY`, and Cloudinary credentials in deployment/local ignored configuration only.
- Do not add a remote audio fallback, analytics SDK, advertising SDK, payment SDK, support form, or new identity provider without updating [the data-flow inventory](../data-flow-inventory.md), the parent notice, and this review.
- Use synthetic data only for vendor verification. Never submit child progress, credentials, tokens, or identifiable family data to test projects.
- Keep vendor metadata distinct from rights evidence. A Cloudinary URL, OpenAI model field, Clerk package, or Sentry project does not prove ownership, contractual permission, or compliance.
- Reconcile the actual deployment configuration with this matrix before each production release; source-only review is insufficient for environment-gated SDKs.

## Open owner ledger

| Decision/evidence | Owner | Status |
| --- | --- | --- |
| Clerk production configuration and DPA/retention/deletion/transfer review | Privacy/vendor owner + infrastructure owner | Missing |
| Google Fonts remote/self-host decision and licence record | Engineering/privacy owner | Missing |
| Cloudinary account, CDN, log, deletion, and public-ID policy | Infrastructure/audio owner | Missing |
| OpenAI generation terms, archive, retention, QA, and disclosure record | Audio/content owner | Missing |
| Vercel account, logs, region, SSO/public access, and injected-code review | Infrastructure/release owner | Missing |
| Sentry DPA, retention, geography, deletion, backups, subprocessors, and DSN decision | Privacy/vendor owner | Missing; see Sentry vendor review |
| Parent-facing notice and public legal publication location | Product/privacy owner | Missing |

## Acceptance status

E1.6 remains **in progress**. Technical roles and configuration boundaries are documented, but no vendor is accepted for child/unknown-age production processing by this document. The release remains blocked until owners attach the required current records and approve the configuration decisions.
