# E2.4 — Content-version progress migration

**Status:** Technical migration path implemented; content-owner review still required before a new content release is published.

## Contract

- `CURRICULUM_CONTENT_VERSION` is the current content release identifier: `2026.10.13.1`.
- Every `ChildProgress` snapshot carries `contentVersion`.
- Snapshots without a version are treated as `legacy-unversioned` and upgraded through `migrateProgressContent`.
- Migration copies only stable progress fields: level position, unlocks, stars, level summaries, exploration counts, tap count, last-played position, cloud sync timestamp, and focus mode.
- Unknown level IDs are discarded during sanitisation; known stars and exploration history are not downgraded.
- Clerk export includes the content version, and incoming Clerk snapshots pass through the same migration mapping before merge.
- The migration helper accepts an explicit target version so rollback mapping is testable and does not require mutating stored data in place.

## Safety boundary

This is a storage compatibility mechanism, not approval of content changes. It does not resolve the current `at`, `bed`, or `box` curriculum findings, and it does not claim that a future content release is educationally, legally, or rights approved. A content release must still update the manifest version, run curriculum validation, retain release evidence, and obtain the relevant owner reviews.
