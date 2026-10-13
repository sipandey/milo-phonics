# Milo Phonics — Current Product and Architecture

> **Source of truth.** This document records the repository’s current implemented behavior and approved wording as of 13 October 2026. It supersedes conflicting implementation descriptions in older planning documents. The [technical delivery backlog](technical-delivery-backlog.md) remains the execution tracker; the [pre-marketing audit](../audits/pre-marketing-content-rights-privacy-audit-2026-10-13.md) remains the release-claims gate.

## Product status

Milo Phonics is an interactive, audio-led app with a fixed sequence of introductory letter–sound activities and simple word-blending practice. The repository is a working React/TypeScript prototype and engineering beta foundation, not a complete or independently reviewed synthetic-phonics programme, diagnostic assessment, or reading-outcome product.

The core child flow is designed to work without an account. Parent-only settings include an arithmetic gate. An optional Clerk integration can associate progress with a parent account; therefore the repository does not support absolute “zero child data”, “100% client-side privacy”, or compliance claims without the required privacy, vendor, and legal review.

## Implemented capability status

| Area | Current repository state | Status |
| --- | --- | --- |
| Letter exploration | 26-letter explorer with illustrated objects and semantic audio IDs | Implemented |
| Introductory sequence | Seven configured groups: `s a t p`, `i n m d`, `g o c k`, `e u r`, `h b f l`, `j v w x`, `y z q` | Implemented, educational review pending |
| Word blending | CVC/VC blending entries and sequential audio interaction | Implemented, content review pending |
| Games | Let's Play, Sound Train, Bubble Pop, and Feed Milo flows are present | Implemented surface; release evidence pending |
| Progress | LocalStorage persistence, v1 migration, star tracking, level unlocking, and resume position | Implemented |
| Parent controls | Arithmetic gate, dashboard, reset, and optional parent sync path | Partially implemented; robust parent-safety review pending |
| Audio runtime | Local pre-recorded assets through semantic IDs; Web Audio procedural SFX; HTML audio playback | Implemented |
| PWA/offline install | No shipped manifest/service worker acceptance path in this repository | Planned |
| Android | No native Android project or Play release | Planned |

The configured curriculum and audio labels are repository facts, not evidence of DfE, Letters and Sounds, UK National Curriculum, SSP-programme, pronunciation, age-suitability, or learning-outcome approval. Those claims remain gated by specialist review.

## Runtime architecture

The supported build and deployment runtime is Node.js 24.x LTS with npm 11.x. The package engine contract, `.nvmrc`, GitHub Actions workflow, and Vercel build all target this same major line.

```text
React UI and game screens
        ↓ semantic IDs and progress commands
Domain/data modules: curriculum, letters, CVC entries
        ↓
Services: progressService + audioService
        ├─ LocalStorage progress persistence and migration
        ├─ HTMLAudioElement for pre-recorded voice assets
        └─ Web Audio API for procedural SFX
        ↓
Bundled files in public/audio/ and browser storage
```

### Progress

`src/services/progressService.ts` reads the current `playful_phonics_progress_v2` key, migrates the legacy v1 exploration shape when needed, sanitizes level state, and writes progress locally. `ParentClerkSync` is an optional parent-account path in the repository and must remain covered by the privacy/data-flow work before deployment claims are made.

### Audio

Components use semantic IDs such as `phoneme.s` and `word.monkey`; they do not construct CDN URLs. `src/data/audioManifest.ts` is the runtime resolver:

- phoneme IDs resolve to local `/audio/phoneme_<letter>.mp3` paths;
- generated word IDs prefer their `localUrl` in `generatedAudioManifest.ts`;
- known manifest entries retain local asset URLs when available;
- an unlisted word gets a conventional local path and fallback text;
- unknown non-word IDs resolve to no entry.

The browser does not call OpenAI and does not use native `speechSynthesis`. Cloudinary URLs and metadata remain in generated manifests for the development/publishing pipeline, but the current browser resolver prefers bundled local assets and does not implement an on-error Cloudinary fallback.

Some code and filenames use Oxford or British/RP labels inherited from earlier asset work. Rights, provenance, pronunciation QA, and public use of those names are not evidenced by this repository; do not treat those labels as approved external claims.

## Data-flow and release caveats

| Flow | Current evidence | Caveat |
| --- | --- | --- |
| Local progress | Browser LocalStorage stores stars, interaction counts, levels, timestamps, last position, and focus mode | Explain storage and deletion to parents; local reset does not delete any cloud record |
| Parent sync | Optional Clerk-related code can export/sync progress metadata | Controller/processor roles, lawful basis, retention, deletion, transfers, security, and parent verification require review |
| Audio generation | Development scripts send fixed educational text to OpenAI TTS and upload generated assets to Cloudinary | Keep secrets server-side; disclose AI-generated audio where required; retain generation and acceptance records |
| Browser audio | Local static assets are selected first; third-party CDN URLs remain in manifests | No runtime CDN fallback is currently implemented |
| Fonts/hosting | The app references external font/hosting surfaces | Review requests, logs, retention, transfers, headers, and deployment configuration before release |

The arithmetic parent gate is an interaction safeguard, not proof of parental responsibility, consent, or legal compliance. The app has no approved claim of COPPA compliance, UK Children’s Code compliance, or zero data collection.

## Claims currently on hold

Until the audit actions close, do not use these as public product facts: Oxford/Oxford Advanced Learner’s Dictionary, authentic Oxford, pure British/RP, UK National Curriculum or Letters and Sounds alignment, systematic synthetic phonics programme, COPPA compliant, zero child data, 100% client-side privacy, Cloudinary fallback, fully offline/PWA, toddler-tested, safe, mastery, age-suitability, effectiveness, or learning-outcome claims.

Use this description instead:

> An interactive, audio-led app with a fixed sequence of introductory letter–sound activities and simple word-blending practice.

## Current roadmap status

| Item | Status |
| --- | --- |
| E0.1 reproducible Node/npm setup | Complete |
| E0.2 automated lint, test, build, and CI gates | Complete |
| E0.3 focused progress, audio, and parent-gate tests | Complete |
| E0.4 current product/architecture record | Complete |
| E0.5 versioned releases and rollback instructions | Complete; production tag still gated |
| E0.6 privacy-preserving error reporting | Planned |
| E0.7 production network/dependency verification | Planned |
| E1 rights, privacy, claims, and parent-safety foundation | Planned; P0 release hold |
| E2 curriculum specification and validation | Planned; depends on E1.1 and E0.3 |

For ordered acceptance criteria, use the [technical delivery backlog](technical-delivery-backlog.md). For pricing, research, PWA, and Android hypotheses, use the [strategic product roadmap](product-roadmap-and-android-strategy.md), not this status table.

## Document hierarchy

| Document | Authority and use |
| --- | --- |
| This document | Current implemented product and architecture facts |
| `technical-delivery-backlog.md` | Ordered engineering work and acceptance criteria |
| `product-roadmap-and-android-strategy.md` | Strategic hypotheses and release gates; not shipped-state evidence |
| `phonics-architecture-and-roadmap.md` | Historical early proposal; superseded |
| `international-phonics-product-roadmap.md` | Aspirational future concept; not shipped-state evidence |
| `README.md` | User-facing setup and concise verified capability summary |
| `docs/audio-generation.md` | Developer pipeline guide; must agree with this audio section |

Last reviewed against the code and audit: 13 October 2026.
