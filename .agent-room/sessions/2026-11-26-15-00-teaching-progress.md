# Session Log: Add parent-recorded teaching progress with Clerk sync

**Date:** 2026-11-26 15:00
**Agent:** Claude Code (Claude Opus 5.5)
**Classification:** Feature

## Goal
Add the v3 teaching progress record (design step 3) that a parent marks as not yet, with help, or secure, and back it up through Clerk.

## Files touched
- Read: `src/services/progressService.ts`, `src/components/parent/ParentClerkSync.tsx`, `tests/progressService.test.ts`
- Created: `src/types/teachingProgress.ts`, `src/services/teachingProgress.ts`, `src/services/teachingProgressStore.ts`, `tests/teachingProgress.test.ts`, `tests/teachingProgressStore.test.ts`, `.agent-room/sessions/2026-11-26-15-00-teaching-progress.md`
- Modified: `src/components/parent/ParentClerkSync.tsx`, `src/observability/parentPrivacyNotice.ts`, `tests/parentPrivacyNotice.test.ts`, `docs/privacy-notice-draft.md`, `docs/data-flow-inventory.md`, `.agent-room/decisions.md`, `.agent-room/anti-patterns.md`

## Actions taken
1. Wrote failing tests for recording, removal, merge, sanitizing, revisit selection, known graphemes, and a worst-case size budget.
2. Implemented the record as pure functions; the size test showed 4,616 bytes when fully marked, so the budget was set at 5,000 bytes.
3. Found that the legacy synced record could reach about 6 KB; added `buildClerkMetadata`, tested first, to keep the combined metadata under about 8 KB by leaving out the legacy record first.
4. Added a device store (its tests were written alongside it, not run red first) and wired both into `ParentClerkSync`.
5. Updated the privacy notice (test first), privacy draft, and data-flow inventory (DF-009).

## Tests run
- Command: `npx vitest run`
- Result: Pass.
- Command: `npm run lint`, `npx tsc --noEmit`, `npm run build` (Node 24.15.0)
- Result: Pass.
- Not run: a signed-in Clerk sync between two devices; needs a real account.

## Decisions made
- Separate v3 record, no migration from taps, legacy record dropped first under the Clerk limit. Recorded in `.agent-room/decisions.md`.

## Outcome
**Status:** Completed
