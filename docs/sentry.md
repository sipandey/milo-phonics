# Sentry setup

The Sentry project for this application is `milo-phonics` in the `personal-df4` organization.

## Runtime monitoring

The browser initializes `@sentry/react` before the React root mounts. It captures unhandled browser errors and tracing transactions when `VITE_SENTRY_DSN` is set. Tracing defaults to a 10% sample rate and can be changed with `VITE_SENTRY_TRACES_SAMPLE_RATE` between `0` and `1`.

Set these Vercel environment variables for Preview and Production:

```text
VITE_SENTRY_DSN=<the DSN shown by the milo-phonics Sentry project>
VITE_SENTRY_RELEASE=phonics@1.0.0
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
```

The DSN is intended for browser use, but keep it in deployment configuration rather than committing a project-specific value. Session Replay, client logging, and application metrics are intentionally disabled because this is a child-facing product; enabling them needs an explicit privacy/data-minimization decision.

This repository currently provides the technical foundation, not the completed E0.6 privacy acceptance. Do not set `VITE_SENTRY_DSN` in Production until parent consent, event scrubbing/data minimization, retention, and the Sentry vendor data-flow review are approved. Preview or local verification must use synthetic interactions only.

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
