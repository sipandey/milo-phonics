# Session Log: Show only lowercase letters to the child

**Date:** 2026-11-27 00:30
**Agent:** Claude Code (Claude Opus 5.5)
**Classification:** Enhancement

## Goal
Follow UK phonics practice of teaching lowercase first by removing capitals from everything a child reads, except the word I.

## Files touched
- Read: `src/data/lettersData.ts`, `src/components/letter/*`, `src/components/game/*`, `src/components/play/LetsPlayScreen.tsx`, `src/components/train/SoundTrainScreen.tsx`, `src/components/sounds/OxfordSoundsScreen.tsx`
- Created: `tests/lowercaseDisplay.test.ts`, `scripts/walkthrough/lowercase-letters.mjs`, `.agent-room/sessions/2026-11-27-00-30-lowercase-only.md`
- Modified: `src/data/lettersData.ts`, `src/components/play/LetsPlayScreen.tsx`, `src/components/train/SoundTrainScreen.tsx`, `src/components/game/FeedMiloScreen.tsx`, `src/components/game/BubblePopScreen.tsx`, `src/components/letter/LetterDetailScreen.tsx`, `src/components/sounds/OxfordSoundsScreen.tsx`, `src/curriculum/graphemeMarks.ts`, `src/components/curriculum/ReaderScreen.tsx`, `src/components/curriculum/CurriculumMapScreen.tsx`, `tests/graphemeMarks.test.ts`, `scripts/walkthrough/run-all.mjs`, `.agent-room/decisions.md`, `.agent-room/anti-patterns.md`

## Actions taken
1. Listed every source of capitals in child screens: data, `toUpperCase`, Tailwind `uppercase`, and Tailwind `capitalize`.
2. Wrote failing tests (letter data, names, reader sentence starts, a source scan), then made the changes; the source scan found the `capitalize` classes.
3. Added a walkthrough that reads rendered text on every child screen; it found reader titles still capitalised, which were then lowercased on the reader screen (that unit assertion was added after the change).
4. Reviewed screenshots of the Letters board, Bubble Pop, Sound Train, Feed Milo, and a reader.

## Tests run
- Command: `npx vitest run`
- Result: Pass (25 files, 139 tests).
- Command: `npm run walkthrough -- http://localhost:3100`
- Result: Pass (49 steps).
- Command: `npm run lint`, `npm run build` (Node 24.15.0)
- Result: Pass.

## Decisions made
- Lowercase only for the child, I excepted; capitals later. Recorded in `.agent-room/decisions.md`.

## Outcome
**Status:** Completed
