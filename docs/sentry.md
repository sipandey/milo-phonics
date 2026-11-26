# Sentry (retired)

Sentry was removed from Milo Phonics on 26 November 2026, when the project moved to private home teaching (see `docs/plans/2026-11-26-letters-and-sounds-home-design.md` and `.agent-room/decisions.md`). The app and build no longer include `@sentry/react` or `@sentry/vite-plugin`, read no `SENTRY_*` or `VITE_SENTRY_*` variables, and send no error or performance data.

If rendering fails, `src/components/common/AppErrorBoundary.tsx` shows a local restart screen.

## Clean-up outside the repository

- Remove `VITE_SENTRY_DSN`, `VITE_SENTRY_RELEASE`, `VITE_SENTRY_TRACES_SAMPLE_RATE`, `SENTRY_ORG`, `SENTRY_PROJECT`, and `SENTRY_AUTH_TOKEN` from Vercel and any local `.env` files.
- Revoke the Sentry organization auth token, and delete the `milo-phonics` Sentry project if its existing events are no longer needed.
- Browsers that previously stored `milo_phonics_sentry_consent_v1` keep that unused key until site data is cleared; the app no longer reads it.

The previous setup is preserved in git history and in the 2026-10-13 Sentry design and vendor-review plans, which remain as historical records.
