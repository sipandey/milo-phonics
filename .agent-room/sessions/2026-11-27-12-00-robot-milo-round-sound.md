# Session Log: Robot Milo picks say the practised sound

**Date:** 2026-11-27 12:00
**Agent:** Claude Code (Claude Opus 5.5)
**Classification:** Bug

## Goal
Make every Robot Milo pick play the round's sound (for example /s/) before its word, instead of each picture's own first sound.

## Files touched
- Read: `src/curriculum/phaseOneActivities.ts`, `src/components/phase1/PictureChoiceActivity.tsx`
- Created: `.agent-room/sessions/2026-11-27-12-00-robot-milo-round-sound.md`
- Modified: `src/curriculum/phaseOneActivities.ts`, `src/components/phase1/PictureChoiceActivity.tsx`, `tests/soundWordLinks.test.ts`, `scripts/walkthrough/sound-word-links.mjs`, `.agent-room/decisions.md`

## Actions taken
1. Wrote failing tests: with a focus, every pick plays the focus sound; without one, every pick plays the target's first sound; First sounds keeps each picture's own sound.
2. Added a round sound to Robot Milo rounds and used it in playback.
3. Extended the walkthrough to check, from logged playback in Chrome, that every Robot Milo pick starts with the round's sound, including from Today.

## Tests run
- Command: `npx vitest run`
- Result: Pass.
- Command: `npm run walkthrough -- http://localhost:3100`
- Result: Pass.
- Command: `npm run lint`, `npm run build` (Node 24.15.0)
- Result: Pass.

## Decisions made
- Robot Milo picks share the round's sound. Recorded in `.agent-room/decisions.md`.

## Outcome
**Status:** Completed
