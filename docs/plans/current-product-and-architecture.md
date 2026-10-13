# Milo Phonics — Current Product and Architecture

> **Source of truth.** This document records the repository’s current implemented behavior and approved wording as of 13 October 2026. It supersedes conflicting implementation descriptions in older planning documents. The [technical delivery backlog](technical-delivery-backlog.md) remains the execution tracker; the [pre-marketing audit](../audits/pre-marketing-content-rights-privacy-audit-2026-10-13.md) remains the release-claims gate.

## Product status

Milo Phonics is an interactive, audio-led app with a fixed sequence of introductory letter–sound activities and simple word-blending practice. The repository is a working React/TypeScript prototype and engineering beta foundation, not a complete or independently reviewed synthetic-phonics programme, diagnostic assessment, or reading-outcome product.

The core child flow is designed to work without an account. Parent-only settings include an arithmetic gate. An optional Clerk integration can associate progress with a parent account; therefore the repository does not support absolute “zero child data”, “100% client-side privacy”, or compliance claims without the required privacy, vendor, and legal review.

## Implemented capability status

| Area | Current repository state | Status |
| --- | --- | --- |
| Letter exploration | 26-letter explorer with illustrated objects and semantic audio IDs | Implemented |
| Introductory sequence | Seven configured groups: `s a t p`, `i n m d`, `g o c k`, `e u r`, `h b f l`, `j v w x`, `y z q` | Implemented through the versioned review-state curriculum manifest; educational review pending |
| Word blending | CVC/VC blending entries and sequential audio interaction | Implemented through manifest-backed records; content review pending |
| Games | Let's Play, Sound Train, Bubble Pop, and Feed Milo flows are present | Implemented surface; release evidence pending |
| Progress | LocalStorage persistence, v1 migration, exploration/practice evidence, star tracking, level unlocking, and resume position | Implemented |
| Parent controls | Arithmetic gate, dashboard, reset, optional parent sync, and optional diagnostics | Gate now uses browser crypto randomness when available and a bounded retry lockout; identity, legal-consent, account deletion, and future purchase/support protections remain open |
| Audio runtime | Local pre-recorded assets through semantic IDs; Web Audio procedural SFX; HTML audio playback | Implemented |
| PWA/offline install | No shipped manifest/service worker acceptance path in this repository | Planned |
| Android | No native Android project or Play release | Planned |

The configured curriculum and audio labels are repository facts, not evidence of DfE, Letters and Sounds, UK National Curriculum, SSP-programme, pronunciation, age-suitability, or learning-outcome approval. Those claims remain gated by specialist review.

## Curriculum content architecture

`src/data/curriculumContent.ts` is the application-facing adapter for the versioned curriculum manifest. It defines the current content version (`2026.10.13.1`), ordered sound sets, prerequisites, phonemes, graphemes, VC/CVC word shapes, audio references, draft digraph records, reader-page extension points, review rules, and an explicit modest scope. The manifest is `review` status; it does not approve rights, pronunciation, educational alignment, age suitability, mastery, or learning-outcome claims. See the [curriculum content schema](../curriculum-content-schema.md) for the field contract and change-control rules.

Learning and progress consumers use manifest-backed level/word lookups. The existing `curriculumData.ts` and `blendingData.ts` modules remain source records behind the adapter for compatibility. The separate `npm run verify:curriculum` command still reports the known `at`, `bed`, and `box` findings and remains outside the general build pending content-owner decisions.

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

### Observability

The optional Sentry project is `milo-phonics` in the `personal-df4` organization. `src/observability/sentry.ts` initializes `@sentry/react` before the React root only when `VITE_SENTRY_DSN` is present and the parent has enabled Optional Technical Diagnostics in the arithmetic-gated Parent Dashboard. The current integration captures consent-gated browser errors and sampled tracing, defaults to a 0.1 trace rate, and carries the build release into Sentry. `@sentry/vite-plugin` uploads hidden source maps only for builds with the secret `SENTRY_AUTH_TOKEN`.

Session Replay, client logging, and application metrics are disabled. Event and span scrubbers remove account/user data, request URLs, breadcrumbs, contexts, tags, extras, transaction names, span attributes, and free-text exception messages. The Sentry project also has server-side scrubbing, default scrubbers, IP-address storage prevention, and additional `user`/`geo` sensitive-field matches enabled for new events. The arithmetic-gated Parent Dashboard displays a clearly marked draft privacy notice, but it is not approved legal text. A synthetic event retained a Sentry-inferred geography context, so consent and scrubbing are technical controls, not the E0.6 acceptance claim: production enablement remains gated on retention, privacy notice, and vendor data-flow review. Do not set a production DSN until those controls are approved.

### Progress

`src/services/progressService.ts` reads the current `playful_phonics_progress_v2` key, migrates the legacy v1 exploration shape and unversioned content snapshots when needed, sanitizes level state against the current manifest, and writes progress locally. Exploration counts are retained for activity history but do not award new stars; Sound Train, Bubble Pop, and Feed Milo submit explicit practice evidence through `recordPracticeAttempt`, which applies the approved non-downgrading star thresholds. `src/services/contentMigration.ts` preserves stable progress fields, including practice evidence, across explicit content-version upgrade/rollback mappings and is also applied to incoming Clerk snapshots; the exported payload carries `contentVersion`. These counters describe observed interaction evidence only, not mastery or diagnosis. `ParentClerkSync` is an optional parent-account path in the repository and must remain covered by the privacy/data-flow work before deployment claims are made.

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
| Audio generation | Development scripts send fixed educational text to OpenAI TTS and upload generated assets to Cloudinary | Parent panel and README disclose the evidenced AI-generated curriculum scope; keep secrets server-side and retain generation, rights, vendor-term, and acceptance records |
| Browser audio | Local static assets are selected first; third-party CDN URLs remain in manifests | No runtime CDN fallback is currently implemented |
| Fonts/hosting | The app references external font/hosting surfaces | Review requests, logs, retention, transfers, headers, and deployment configuration before release |

The arithmetic parent gate is an interaction safeguard, not proof of parental responsibility, consent, or legal compliance. It uses a browser-crypto-backed challenge source when available, unbiased answer-option shuffling, and an in-memory five-failure/60-second window with a 30-second lockout. The app has no approved claim of COPPA compliance, UK Children’s Code compliance, or zero data collection. Account deletion, purchases, support links, and external navigation are not implemented as parent-gated flows yet; they must use this gate before being added.

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
| E0.6 privacy-preserving error reporting | In progress; consent gate and scrubbers verified, vendor/privacy acceptance gated |
| E0.7 production network/dependency verification | In progress; safe flow review recorded, full acceptance open |
| E1 rights, privacy, claims, and parent-safety foundation | In progress; E1.1 register, E1.2 draft, E1.3 inventory, E1.4 gate hardening, E1.6 vendor review, E1.9 disclosure, and E1.10 build guard created; owner evidence missing; P0 release hold |
| E2 curriculum specification and validation | In progress; E2.1 manifest adapter, E2.3 practice-evidence boundary, E2.4 progress migration, and E2.5 media checklist are implemented in review status, while E2.2 reports three content/prerequisite findings; depends on E1.1 and specialist review |

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

The [E0.7 production network review](2026-10-13-e0-7-production-network-review.md) records the current deployment observations. The isolated reset, induced offline-audio failure, mobile smoke check, sanitized first-visit trace, and release identity check are recorded; the release-channel remediation in `282ed50` is verified live and the serving metadata now reports `channel: production`. The deployed parent sign-in modal still reports Clerk Development mode. The parent audio panel was corrected in `1661e42` to describe the verified bundled-local runtime; Cloudinary metadata is not an approved browser dependency or claim. The [asset rights register](../asset-rights-register.md) is the current inventory for E1.1; its rights evidence is not yet complete. The [privacy notice draft](../privacy-notice-draft.md) and typed `PARENT_PRIVACY_NOTICE` cover the reviewed data surfaces but are not approved or publicly published. The [data-flow inventory](../data-flow-inventory.md) reconciles authored runtime/build destinations and records unknown vendor, retention, deletion, transfer, and hosting fields rather than inferring them. The [vendor review](2026-10-13-e1-6-vendor-review.md) records current SDK/service boundaries without accepting terms. The [claims register](../claims-register.md) is the user-facing wording guard and keeps unsupported provenance, accreditation, privacy, age, outcome, and offline claims blocked. The [curriculum content schema](../curriculum-content-schema.md), [practice-evidence design](2026-10-13-e2-3-practice-evidence.md), [content migration design](2026-10-13-e2-4-content-migration.md), and [media production checklist](../content-media-production-checklist.md) document the review-state E2.1/E2.3/E2.4/E2.5 boundaries; the [curriculum validation report](../curriculum-validation-report.md) records the E2.2 findings without changing content automatically.

Last reviewed against the code, deployment, and audit: 13 October 2026.
