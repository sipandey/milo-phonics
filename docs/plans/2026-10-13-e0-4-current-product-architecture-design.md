# E0.4 Current Product and Architecture Record — Design

**Date:** 13 October 2026  
**Backlog item:** E0.4 — consolidate the current product and architecture record  
**Workflow:** AgentRoom RPI — Enhancement

## Goal

Make one reviewed document the authoritative description of the implemented product, runtime architecture, audio behavior, data flows, claims status, and near-term roadmap so engineering, sales, and compliance do not rely on contradictory records.

## Recommended approach

1. **Create a single current record:** Add `docs/plans/current-product-and-architecture.md` with an explicit “source of truth” banner, an as-of date, implemented-vs-planned status table, runtime architecture, audio resolution rules, data-flow summary, claims hold, and links to the delivery backlog and audit.
2. **Keep document responsibilities separate:** `technical-delivery-backlog.md` remains the executable backlog; `product-roadmap-and-android-strategy.md` remains a strategic hypothesis and release-gate document; the older architecture and international roadmap documents are marked historical/non-authoritative. The new record links to each so their role is unambiguous.
3. **Correct active guidance:** Update `README.md` and `docs/audio-generation.md` to match the code: bundled local audio is the runtime-first path, Cloudinary URLs are retained manifest metadata/development pipeline data, there is no browser `speechSynthesis` fallback, and optional Clerk sync means absolute “zero child data” or compliance claims are not valid.

## Current facts to publish

- The shipped client is a React/TypeScript Vite application with local progress persistence, optional parent-gated Clerk sync, HTML audio for pre-recorded voice assets, and Web Audio for procedural SFX.
- The semantic resolver prefers local URLs. It does not implement an on-error Cloudinary fallback. The browser does not call OpenAI and does not use native `speechSynthesis`.
- The current curriculum contains seven configured single-letter groups and CVC/VC blending entries; it is not evidence of a complete or independently reviewed SSP programme.
- The repository has no shipped service worker/PWA install path or native Android project yet.
- Oxford provenance, AI-audio disclosure, vendor/privacy evidence, and educational/marketing claims remain gated by the pre-marketing audit.

## Document hierarchy

| Document | Authority | Role |
| --- | --- | --- |
| `docs/plans/current-product-and-architecture.md` | Current source of truth | Implemented facts, architecture, constraints, claims status, and current status |
| `docs/plans/technical-delivery-backlog.md` | Execution control | Ordered delivery work and acceptance criteria |
| `docs/plans/product-roadmap-and-android-strategy.md` | Strategic plan | Product hypotheses, release gates, and future investment options |
| `docs/plans/phonics-architecture-and-roadmap.md` | Historical | Superseded early architecture/roadmap proposal |
| `docs/plans/international-phonics-product-roadmap.md` | Aspirational | Future product concept; not evidence of shipped capability |
| `README.md` | User-facing summary | Concise setup and verified capability overview linked to the current record |

## Boundaries and non-goals

- Documentation only; no runtime behavior, audio assets, privacy configuration, or public deployment changes.
- Do not turn audit findings into legal approval. Preserve the audit’s requirement for specialist rights, SSP, privacy, and claims review.
- Do not delete historical plans; make their status and authority explicit.
- Do not describe Cloudinary as a browser fallback or claim COPPA/privacy compliance from repository behavior alone.

## Verification

Use repository searches to confirm obsolete browser-speech and Cloudinary-first wording is absent from active guidance, inspect the authority banners and links, run `git diff --check`, and run AgentRoom validation. Since this slice is documentation-only, the existing application lint, test, and build gates remain the final regression check.
