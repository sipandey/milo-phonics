# Session Log: Add E2.2 Curriculum and Asset Validator

**Date:** 2026-10-13 20:50
**Agent:** Codex (GPT-5)
**Classification:** Enhancement / Curriculum release governance

## Goal

Create a deterministic validator for curriculum IDs, level prerequisites, word shape, phoneme alignment, audio IDs, and bundled local assets without silently changing content or pronunciation decisions.

## Files touched

- Read: `src/data/blendingData.ts`, `src/data/curriculumData.ts`, `src/data/cvcAudioManifest.ts`, `src/types/phonics.ts`, `docs/plans/technical-delivery-backlog.md`, and the pre-marketing curriculum findings.
- Created: `scripts/curriculumValidation.ts`, `scripts/verify-curriculum.ts`, `tests/curriculumValidation.test.ts`, `docs/curriculum-validation-report.md`, this session log.
- Modified: `package.json`, `docs/plans/technical-delivery-backlog.md`, `docs/plans/current-product-and-architecture.md`, `.agent-room/decisions.md`.

## Actions taken

1. Added failing-first validator tests for duplicate IDs, non-CVC entries, taught-letter gaps, phoneme alignment, missing audio IDs, and missing local assets.
2. Implemented typed validation helpers and a CLI command using the checked-in curriculum, levels, generated audio manifest, and filesystem asset paths.
3. Ran the validator and captured the current three release-blocking findings: VC `at` in the CVC shape, `bed` before taught `b`, and `box` before taught `x`.
4. Added a report and release policy; kept the failing validator separate from the general build until a curriculum owner resolves or approves each finding.
5. Updated the backlog, architecture, and decision records.

## Tests run

- Command: `npx vitest run tests/curriculumValidation.test.ts`
- Result: Pass — 2 tests.
- Command: `npm run verify:curriculum`
- Result: Expected failure — 3 release-blocking findings (`at`, `bed`, `box`); output retained in `docs/curriculum-validation-report.md`.
- Command: `npm test`
- Result: Pass — 12 files, 34 tests.
- Command: `npm run lint`
- Result: Pass.
- Command: `npm run build`
- Result: Pass — strict TypeScript/Vite build plus claims guard; existing large-chunk warning remains.
- Command: `npm run agent-room:validate`
- Result: Pass.
- Command: `git diff --check`
- Result: Pass.

## Decisions made

- Keep curriculum validation separate from the production build while known content findings require curriculum/pronunciation-owner decisions.
- Do not move, remove, reclassify, or regenerate entries merely to make the command pass.
- Treat an asset-presence pass as technical evidence only; rights, provenance, pronunciation quality, and educational suitability remain separate gates.

## Outcome

**Status:** Handed Off.

**Handoff note:** The validator is ready for content CI/review. Curriculum and audio owners must decide the three findings before E2.2 can close and before the validator is promoted to a required build step.
