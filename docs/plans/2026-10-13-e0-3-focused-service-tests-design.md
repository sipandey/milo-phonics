# E0.3 Focused Service Tests — Design

**Date:** 13 October 2026  
**Backlog item:** E0.3 — focused tests for progress migration, level unlocking, audio URL resolution, and parent-gate rules  
**Workflow:** AgentRoom RPI — Enhancement

## Goal

Add headless regression coverage for the current progress, audio, and parental-gate contracts without changing learner-facing behavior or adding a browser-DOM test stack.

## Recommended approach

1. **Progress persistence and progression:** Load `progressService` against a small in-memory implementation of the browser `Storage` contract. Reset Vitest modules between cases so the existing singleton constructor reads each fixture from a clean storage instance. Cover a valid current payload, corrupt JSON recovery, legacy v1 migration into v2 storage, star awards that never downgrade an existing rating, and level unlocking at the configured threshold.
2. **Audio resolution:** Test `getAudioEntry` directly because it is the production resolver used by `audioService`. Assert Oxford phoneme IDs resolve to local phoneme assets, generated word IDs prefer their local bundle path, known manifest entries retain their local URL, and unknown IDs return `undefined`.
3. **Parent gate:** Extract the current arithmetic challenge generation and answer comparison into a pure helper module. Keep the existing ranges, four unique options, positive decoys, and retry semantics unchanged; the React modal will delegate to that helper. Test challenge shape plus correct and incorrect answer outcomes without rendering React.

## Data flow and error handling

- Progress fixtures enter through the same `window.localStorage` reads used in production. Tests verify that malformed data falls back safely and that legacy data is written to the current key.
- Audio assertions inspect resolved semantic IDs and URLs only; playback, network access, and browser media APIs remain outside this unit-test boundary.
- Parent-gate generation remains synchronous and deterministic when supplied a random source, while production continues to use `Math.random`. An incorrect answer generates a new challenge; a correct answer is accepted by the same predicate currently used by the modal.

## Test plan

- `tests/progressService.test.ts`: normal/corrupt storage, v1 migration, no star downgrade, and level-2 unlock threshold.
- `tests/audioManifest.test.ts`: phoneme local fallback, word local fallback, manifest URL resolution, and unknown ID handling.
- `tests/parentGate.test.ts`: operand/option invariants and success/failure answer rules.

## Boundaries and non-goals

- No change to progression policy, storage schema, audio asset contents, gate difficulty, rate limiting, or parent-authentication semantics.
- No DOM or end-to-end tests in E0.3; those belong with the parent-safety and browser-release work in E1/E0.7.
- No unrelated cleanup of legacy comments or service internals.

## Verification

Run the focused Vitest suite, then the full lint, unit-test, production-build, and AgentRoom validation commands. Update the backlog and session log only after fresh evidence passes.
