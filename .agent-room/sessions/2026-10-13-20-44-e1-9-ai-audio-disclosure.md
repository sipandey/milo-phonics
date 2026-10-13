# Session Log: Add E1.9 AI-Audio Disclosure

**Date:** 2026-10-13 20:44
**Agent:** Codex (GPT-5)
**Classification:** Enhancement / Content disclosure

## Goal

Add a clear, scoped disclosure for the OpenAI-generated curriculum voice audio evidenced by the repository without overclaiming the provenance of every audio family.

## Files touched

- Read: `src/components/parent/audioRuntimeStatus.ts`, `src/components/parent/ParentDashboard.tsx`, `tests/audioManifest.test.ts`, `src/data/generatedAudioManifest.ts`, `docs/audio-generation.md`, `docs/asset-rights-register.md`, `README.md`, and the E1.9 backlog acceptance criteria.
- Created: this session log.
- Modified: `tests/audioManifest.test.ts`, `src/components/parent/audioRuntimeStatus.ts`, `src/components/parent/ParentDashboard.tsx`, `README.md`, `docs/plans/current-product-and-architecture.md`, `docs/plans/technical-delivery-backlog.md`, `.agent-room/decisions.md`.

## Actions taken

1. Added a failing audio-status assertion requiring “AI-generated” and “OpenAI TTS” disclosure wording.
2. Added a scoped disclosure to the parent audio panel: some bundled curriculum voice audio was generated with OpenAI TTS; phoneme-source provenance remains under review.
3. Added the same limited disclosure to the README while preserving the existing claims hold.
4. Updated architecture/backlog/decision records to distinguish disclosure from rights, provenance, pronunciation, vendor-term, and legal acceptance.

## Tests run

- Command: `npx vitest run tests/audioManifest.test.ts`
- Result: Red before implementation; green after implementation — 6 tests.
- Command: `npm test`
- Result: Pass — 10 files, 29 tests.
- Command: `npm run lint`
- Result: Pass.
- Command: `npm run build`
- Result: Pass — strict TypeScript/Vite build; existing large-chunk warning remains.
- Command: `npm run agent-room:validate`
- Result: Pass.
- Command: `git diff --check`
- Result: Pass.

## Decisions made

- Scope the disclosure to “some bundled curriculum voice audio”; do not label all audio or the phoneme recordings as AI-generated.
- Do not describe OpenAI or Cloudinary as browser runtime dependencies.
- Keep generation logs, asset rights, model/voice records, human acceptance, vendor terms, and distribution-surface review as open E1.1/E1.6/E1.9 gates.

## Outcome

**Status:** Handed Off.

**Handoff note:** The product and README now contain the technical disclosure. Content/privacy/release owners still need to attach generation records, terms, rights, pronunciation acceptance, and final distribution review before E1.9 can close.
