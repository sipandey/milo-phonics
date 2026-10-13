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
