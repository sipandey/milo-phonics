# Sentry React Instrumentation

**Goal:** Connect the Milo Phonics React/Vite application to the newly created `milo-phonics` Sentry project with browser error monitoring, tracing, and production source-map support.

**Platform:** React 18 + Vite 6 + TypeScript, deployed as a Vercel static build.

## Approved approach

- Install `@sentry/react` for browser error monitoring and tracing.
- Initialize Sentry before the React root mounts from a small typed module.
- Read the DSN, release, environment, and trace sample rate from Vite environment variables; missing DSN disables Sentry cleanly for contributors who have not configured it.
- Enable tracing at a conservative default of 10%, with an environment override from `VITE_SENTRY_TRACES_SAMPLE_RATE`.
- Do not enable session replay, client logging, or application metrics in this slice. The product is child-facing and those signals require a separate data-minimization and retention decision.
- Install `@sentry/vite-plugin` as a development dependency and activate source-map upload only when `SENTRY_AUTH_TOKEN` is present. Organization, project, and token values remain deployment configuration, not committed secrets.

## Verification

1. Test the typed runtime configuration with valid, absent, and invalid environment values.
2. Run lint, unit tests, and the strict production build.
3. Run the app with the real Sentry DSN and trigger one temporary, identifiable UI error through the instrumented application path.
4. Confirm the issue in Sentry and remove the temporary trigger before committing.

## Out of scope

- Session replay, logging, metrics, uptime monitors, alerts, or release automation beyond source-map upload configuration.
- Deploying to Vercel or changing Vercel environment variables through an external dashboard.

## Approved E0.6 privacy follow-up

The first implementation exposed the technical Sentry path but correctly left production enablement gated. The approved follow-up adds a default-off, parent-controlled consent boundary:

- Store a versioned local consent decision; no decision means no Sentry client initialization.
- Expose the decision only in the existing arithmetic-gated Parent Dashboard, with a reversible toggle.
- Keep Sentry errors and tracing disabled until consent is granted. Revocation prevents future error and trace events from being sent.
- Rely on the SDK's default browser PII behavior, keep the app from setting a user scope, remove breadcrumbs, user, request, contexts, tags, extras, transaction data, and free-text exception messages before sending, and retain only release/environment and a sanitized exception stack where applicable. The installed SDK version does not expose a `sendDefaultPii` browser option.
- Keep replay, logging, and application metrics disabled. Parent consent is a product control, not legal sign-off; vendor retention, connection metadata, privacy notice, and data-flow review remain release gates.

Tests cover consent storage defaults and failure behavior plus the event scrubber’s removal of identifiers and content-bearing fields.
