# Sentry setup

The Sentry project for this application is `milo-phonics` in the `personal-df4` organization.

## Runtime monitoring

The browser initializes `@sentry/react` before the React root mounts only when both `VITE_SENTRY_DSN` is set and a parent has enabled Optional Technical Diagnostics in the arithmetic-gated Parent Dashboard. It captures minimized browser errors and tracing transactions after consent. Tracing defaults to a 10% sample rate and can be changed with `VITE_SENTRY_TRACES_SAMPLE_RATE` between `0` and `1`.

Set these Vercel environment variables for Preview and Production:

```text
VITE_SENTRY_DSN=<the DSN shown by the milo-phonics Sentry project>
VITE_SENTRY_RELEASE=phonics@1.0.0
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
```

The DSN is intended for browser use, but keep it in deployment configuration rather than committing a project-specific value. Session Replay, client logging, and application metrics are intentionally disabled because this is a child-facing product; enabling them needs an explicit privacy/data-minimization decision.

Events are scrubbed before sending: account/user data, request URLs, breadcrumbs, contexts, tags, extras, transaction names, span attributes, and free-text exception messages are removed. Only minimal release/environment metadata and sanitized exception stack structure are retained. Consent is stored as a versioned local decision, defaults to off, and can be revoked from the Parent Dashboard; revocation drops future error events and trace sampling. Standard network metadata that Sentry may infer at ingestion remains subject to the vendor retention and data-flow review.

The Sentry project security settings have also been configured for new events with server-side data scrubbing, default scrubbers, IP-address storage prevention, and additional sensitive-field matches for `user` and `geo`. A consented synthetic browser event was verified in the project and in release `1.0.0`: the error message, request URL, tags beyond release/environment, and content-bearing fields were absent while the stack frame remained readable. Sentry still displayed an inferred geography context on that event. The current organization is on the Developer plan with EU storage and 30-day event retention; DPA acceptance, deletion behavior, backups/subprocessors, and the treatment of inferred geography remain vendor/privacy review items. See the [Sentry vendor review](plans/2026-10-13-sentry-vendor-data-flow-review.md).

The consent control is a technical product safeguard, not legal sign-off. Do not set `VITE_SENTRY_DSN` in Production until parent consent, event scrubbing/data minimization, retention, privacy notice, and the Sentry vendor data-flow review are approved. Preview or local verification must use synthetic interactions only.

The arithmetic-gated Parent Dashboard displays the same information as a clearly marked draft notice in `docs/privacy-notice-draft.md`. It is not an approved production privacy policy and still requires an owner-supplied contact and privacy/legal review.

## Source maps and releases

The Vite plugin generates hidden source maps and uploads them only when all three build-time variables are available:

```text
SENTRY_ORG=personal-df4
SENTRY_PROJECT=milo-phonics
SENTRY_AUTH_TOKEN=<organization token with release and source-map upload permissions>
```

`SENTRY_AUTH_TOKEN` is a secret. Add it only to Vercel build environment variables and local ignored environment files; never use a `VITE_` prefix or commit it. A build without the token remains valid but skips source-map generation/upload.

## Verification

Run `npm run build` locally for the no-token path. For an end-to-end check, run the app with the project DSN, trigger a temporary identifiable error through the real UI, confirm the issue appears in Sentry with a readable frame, and remove the temporary trigger before committing. Do not use production user data for verification.
