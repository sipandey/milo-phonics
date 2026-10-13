# Session Log: Add E2.1 Curriculum Content Schema

**Date:** 2026-10-13 21:02
**Agent:** Codex (GPT-5)
**Classification:** Enhancement / Curriculum data contract

## Goal

Create one typed, versioned application-facing curriculum manifest without changing the current content or implying educational, pronunciation, rights, age, or learning-outcome approval.

## Files touched

- Read: `src/types/phonics.ts`, `src/data/curriculumData.ts`, `src/data/blendingData.ts`, `src/data/lettersData.ts`, `scripts/curriculumValidation.ts`, `docs/plans/technical-delivery-backlog.md`, and AgentRoom decisions/anti-patterns.
- Created: `src/types/curriculum.ts`, `src/data/curriculumContent.ts`, `tests/curriculumContent.test.ts`, `docs/curriculum-content-schema.md`, this session log.
- Modified: curriculum/game/parent/progress consumers to import manifest-backed lookups; `docs/plans/technical-delivery-backlog.md`; `docs/plans/current-product-and-architecture.md`; `.agent-room/decisions.md`; `.agent-room/anti-patterns.md`.

## Actions taken

1. Wrote failing-first tests for schema version/status, supported content collections, manifest-backed lookups, and VC/CVC/audio classification.
2. Added strict TypeScript contracts for sound sets, phonemes, graphemes, words, digraphs, reader pages, review rules, scope, and manifest status.
3. Added content version `2026.10.13.1` and a `review`-state manifest adapter over the existing catalogue.
4. Added draft records for `sh`, `ch`, `th`, `ck`, `ng`, and `qu`, plus typed reader-page extension points, without presenting them as released content.
5. Routed level/word reads in the learning screens and progress service through the manifest adapter.
6. Preserved the known E2.2 findings (`at`, `bed`, `box`) and kept curriculum validation separate from the general build.

## Tests run

- Command: `npx vitest run tests/curriculumContent.test.ts`
- Initial result: Expected failure before implementation — module did not exist.
- Final result: Pass — 3 tests.
- Command: `npm test`
- Result: Pass — 13 files, 37 tests.
- Command: `npm run lint`
- Result: Pass.
- Command: `npm run build`
- Result: Pass — strict TypeScript/Vite build plus claims guard; existing large-chunk warning remains.

## Decisions made

- Keep the manifest at `review` status until curriculum, rights, pronunciation, and specialist review gates are resolved.
- Treat the schema as an application boundary, not as approval of its source content.
- Preserve compatibility source modules while screens consume manifest-backed data.

## Outcome

**Status:** Ready to push.

**Handoff note:** Curriculum owners must review the manifest scope and the existing E2.2 findings before the content version can be promoted to `published` or the validator can become a required build gate.
