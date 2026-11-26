# Session Log: Add the curriculum map and sound pages

**Date:** 2026-11-26 16:30
**Agent:** Claude Code (Claude Opus 5.5)
**Classification:** Feature

## Goal
Let the parent open any Letters and Sounds sound, mark it introduced or as a focus, record progress, and see decodable practice words (design step 4).

## Files touched
- Read: `src/App.tsx`, `src/components/parent/ParentDashboard.tsx`, `src/services/audioService.ts`, `src/components/sounds/OxfordSoundsScreen.tsx`, `src/data/cvcAudioManifest.ts`
- Created: `src/curriculum/soundPage.ts`, `src/hooks/useTeachingProgress.ts`, `src/components/curriculum/teachingUi.tsx`, `src/components/curriculum/SoundPageScreen.tsx`, `src/components/curriculum/CurriculumMapScreen.tsx`, `tests/soundPage.test.ts`, `tests/curriculumScreens.test.ts`, `.claude/launch.json`, `.agent-room/sessions/2026-11-26-16-30-curriculum-map.md`
- Modified: `src/services/teachingProgressStore.ts`, `src/components/parent/ParentClerkSync.tsx`, `tests/teachingProgressStore.test.ts`, `src/App.tsx`, `src/components/parent/ParentDashboard.tsx`, `src/types/phonics.ts`, `docs/plans/current-product-and-architecture.md`, `.agent-room/decisions.md`, `.agent-room/anti-patterns.md`

## Actions taken
1. Wrote failing tests for audio mapping, word playback, decodable word marking, and practice word selection, then implemented `soundPage.ts`.
2. Found that cloud merges did not refresh screens; changed the store to notify with a source (test first) and made sync upload only local changes.
3. Built the sound page and curriculum map and opened the map from the parent dashboard.
4. The in-app browser refused to open localhost, so added server-render tests for both screens instead.

## Tests run
- Command: `npx vitest run`
- Result: Pass (20 files, 104 tests).
- Command: `npm run lint`, `npx tsc --noEmit`, `npm run build` (Node 24.15.0)
- Result: Pass.
- Not run: clicking through the screens in a browser, and audio playback by ear.

## Decisions made
- Map in the parent area; sound-by-sound playback; game links deferred to step 5. Recorded in `.agent-room/decisions.md`.

## Outcome
**Status:** Completed
