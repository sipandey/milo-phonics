# Sentry Vendor, Retention, and Release Review

**Date:** 2026-10-13
**Scope:** E0.6 privacy-preserving structured client error reporting
**Decision status:** Implementation evidence complete; production acceptance remains blocked

## Evidence reviewed

### Application data flow

- `@sentry/react` initializes only after a parent enables Optional Technical Diagnostics in the arithmetic-gated Parent Dashboard.
- The browser-side scrubber retains only minimal release/environment/platform/level fields and sanitized exception stack structure. It removes messages, request URLs, users, breadcrumbs, contexts, tags, extras, transaction data, and span attributes.
- Breadcrumbs are disabled at the SDK boundary. Session Replay, client logging, and application metrics remain disabled.
- Revocation prevents future error events and trace sampling; local consent storage fails closed.
- Source-map upload is conditional on the build-only `SENTRY_AUTH_TOKEN` secret and is not part of the browser payload.

### Sentry project and organization controls

Verified in the Sentry UI for `personal-df4/milo-phonics`:

- Organization plan: Developer.
- Organization data storage region: European Union (EU).
- Project server-side data scrubbing: enabled.
- Project default scrubbers: enabled.
- Project IP-address storage prevention: enabled for new events.
- Project additional sensitive fields: `user` and `geo`.
- Organization aggregated-identifying-data use: disabled.
- Logs, application metrics, and replays: zero usage and not enabled for this integration.
- Organization DPA control: still presents “Review and Accept”; no acceptance was performed by this engineering task.

Sentry’s current support guidance states that Developer-plan error data is retained for 30 days; paid self-serve plans retain error data for 90 days. This is a vendor-plan fact, not an app privacy notice or a substitute for legal acceptance. See [Sentry’s retention guidance](https://sentry.zendesk.com/hc/en-us/articles/27118913621019-How-Long-Are-Errors-Events-Stored-in-Sentry).

Sentry’s privacy materials describe general device/location and referring-URL metadata in its own service context and state that retention can extend for legal or operational reasons. The project’s synthetic event had its IP redacted but still displayed inferred geography. Treat that enrichment, backups, subprocessors, deletion behavior, and contractual terms as open data-flow questions. See [Sentry’s privacy policy](https://sentry.io/privacy/) and [Sentry’s Trust Center](https://sentry.io/trust/).

### Release dashboard verification

Using synthetic consented browser activity only, Sentry’s release explorer showed:

- Release `1.0.0` present and active.
- SDK `sentry.javascript.react 11.7.0`.
- The synthetic issue grouped with no error message and a readable application stack frame.
- The release dashboard linked the issue to `1.0.0`; no child progress, audio, free text, account identifier, or production user data was used.
- The local no-token build had zero uploaded source-map artifacts, as expected; source-map upload remains a separately gated deployment check.

## Acceptance decision

E0.6 remains **in progress**. The implementation and release-dashboard verification are complete, and the parent area now displays a clearly marked draft privacy notice. Production DSN enablement remains blocked until an authorized privacy owner reviews and accepts the Sentry DPA/data-flow terms, approves a privacy notice with a real contact and retention/deletion behavior, and decides whether inferred geography is acceptable or must be eliminated through a different architecture.

No legal or contractual acceptance was made by Codex. The synthetic Sentry issue remains non-production verification data and should be deleted by an authorized owner when the project’s cleanup policy is agreed.
