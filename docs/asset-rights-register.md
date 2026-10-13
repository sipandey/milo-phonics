# Milo Phonics Asset Rights Register

**Review date:** 13 October 2026
**Owner:** Unassigned — product/compliance owner required
**Status:** Inventory complete; rights evidence incomplete. This register is a release control, not a licence or legal opinion.

## Decision rule

An asset is not cleared because it is present in Git, has a generated manifest entry, has a public URL, or was produced by a vendor account. A release owner must attach source evidence and record the creator/owner, licence or contract, permitted markets, term, modification rights, attribution requirement, expiry/review date, and retained proof location. Rows marked **Blocked** must not support paid distribution, broad marketing, school pilots, or Oxford/accent/educational claims.

## Repository inventory

The repository contains **316 committed MP3 files** and **2 committed MP4 files**. The source also references **2 video paths that are not present** in `public/`.

| Register ID | Shipped or referenced scope | Count | Repository evidence | Current rights status | Required evidence/action |
| --- | --- | ---: | --- | --- | --- |
| A-001 | `public/audio/phoneme_*.mp3` | 26 | Runtime phoneme resolver; history and comments describe these as Oxford/source-dataset recordings | **Blocked — provenance and Oxford permission unverified** | Identify each source recording, creator/rightsholder, acquisition URL/date, licence, commercial/territory/term scope, modification permission, attribution, and review/expiry date. Pause Oxford labels until written permission exists. |
| A-002 | `public/audio/*_isolation.mp3` and `public/audio/*_words.mp3` | 94 | British Sounds screen calls `/audio/<symbol>_<kind>.mp3`; symbols include consonants, vowels, and diphthongs | **Blocked — provenance unverified** | Build a per-file source map; confirm whether any file is Oxford or another third-party recording; retain licence and attribution evidence. |
| A-003 | `public/audio/words/*.mp3` | 84 | Local runtime assets; generated manifest stores text/model/voice and optional Cloudinary metadata | **Blocked pending generation record and terms review** | Attach OpenAI account/terms snapshot, generation date, model/voice, exact source text, operator, pronunciation reviewer, modification/distribution rights, AI-audio disclosure decision, and Cloudinary publication record if retained. |
| A-004 | `public/audio/cvc/*.mp3` and `public/audio/sentences/*.mp3` | 76 | `cvcAudioManifest.ts`; local word/sentence paths; generation scripts use OpenAI TTS and Cloudinary metadata | **Blocked pending generation record and terms review** | Record each word/sentence text, model/voice/date, human pronunciation/content review, account/terms evidence, local modification rights, and any Cloudinary retention/deletion owner. |
| A-005 | `public/audio/letters/*.mp3`, `prompts/*.mp3`, `praise/*.mp3` | 36 | Generated manifest entries and local runtime paths | **Blocked pending generation record and terms review** | Attach generation records, source text, model/voice/date, reviewer, permitted commercial use, AI disclosure decision, and attribution/expiry treatment. |
| A-006 | `public/video/milo/milo_chomp_chew.mp4`, `milo_hungry_pose.mp4` | 2 | `MiloVideoCompanion.tsx`; SHA-256 fingerprints recorded below | **Blocked — creator/model/source rights unverified** | Identify creator(s), model/animation source, raw-project owner, music/SFX provenance, commercial rights, territory/term, modification/cropping rights, attribution, and expiry/review date. |
| A-007 | Referenced but absent: `milo_curious_rethink.mp4`, `milo_full_tummy_celebrate.mp4` | 2 | `VIDEO_PATHS` in `MiloVideoCompanion.tsx`; no matching files under `public/video/` | **Runtime asset gap** | Either add rights-cleared files and register them, or remove the states/references and verify the fallback path. Do not treat missing files as cleared assets. |
| A-008 | Curriculum words, sentences, prompts, labels, and UI copy | Repository strings | `curriculumData.ts`, `blendingData.ts`, `lettersData.ts`, manifests, and components | **Blocked — authorship/source record absent** | Identify author/editor, source texts or commissioned copy, copying/adaptation review, permitted markets, modifications, attribution, and version/review owner. Correct the VC/CVC classification and provenance questions before educational claims. |
| A-009 | Inline emoji, SVG favicon, CSS illustrations, and procedural Web Audio effects | No standalone media files | `index.html`, `CharacterMilo.tsx`, CSS, and `audioService.ts` | **Needs asset-source record** | Record whether each visual/audio element is original, platform-provided, open-licensed, or vendor-provided; retain applicable notices and confirm commercial use. |
| A-010 | Google Fonts Fredoka and Nunito | 2 families, remotely requested | `index.html` stylesheet/preconnect links | **Rights/privacy review required** | Pin the resolved font versions, retain official licence notices, decide whether to self-host, and record processor/hosting/privacy treatment. The current repository does not contain font files or notices. |
| A-011 | Runtime libraries: Clerk, Sentry, React, React DOM, `canvas-confetti`, `lucide-react` | 6 direct packages | `package.json` and `package-lock.json`; direct licences are recorded in [third-party notices](third-party-notices.md) | **Inventory recorded; release notices incomplete** | Retain the generated SPDX artifact and full licence text; record vendor contracts/DPAs separately for Clerk/Sentry. Package licence metadata is not a substitute for service terms. |
| A-012 | Build/dev libraries: Vite, TypeScript, Vitest, ESLint, Tailwind, OpenAI, Cloudinary, AgentRoom, and related tooling | 17 direct packages | `package.json`, `package-lock.json`, and [third-party notices](third-party-notices.md) | **Inventory recorded; licence review incomplete** | Retain the generated SPDX artifact and full notices; review FSL-1.1-MIT, CC-BY-4.0, and BlueOak-1.0.0. Keep OpenAI/Cloudinary credentials and terms records in the operator evidence store, never in the bundle. |

## Stable fingerprints for committed video files

These fingerprints identify the exact files currently in the repository; they do not establish ownership or permission.

| Path | SHA-256 |
| --- | --- |
| `public/video/milo/milo_chomp_chew.mp4` | `3306a9572c564c18d89f897ca7623c97a6ece7d2569b0e398932d540ec69d170` |
| `public/video/milo/milo_hungry_pose.mp4` | `9ed5a7ec3f3c2a70618f16aba0ed11f69a01728b09e3122b1c2fd020e0e568ac` |

## Direct dependency licence snapshot

The following values were read from the installed direct package manifests on 13 October 2026. They are a starting point for a generated SBOM, not a complete transitive notice bundle.

| Runtime package | Reported licence |
| --- | --- |
| `@clerk/clerk-react`, `@sentry/react`, `react`, `react-dom` | MIT |
| `canvas-confetti`, `lucide-react` | ISC |

| Build/dev package | Reported licence |
| --- | --- |
| `@eslint/js`, `@sentry/vite-plugin`, `@types/canvas-confetti`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `autoprefixer`, `cloudinary`, `create-agent-room`, `eslint`, `postcss`, `tailwindcss`, `tsx`, `typescript-eslint`, `vite`, `vitest` | MIT |
| `dotenv` | BSD-2-Clause |
| `openai`, `typescript` | Apache-2.0 |

## Open evidence ledger

| Evidence item | Owner | Status |
| --- | --- | --- |
| Oxford/source-dataset audio acquisition and commercial permission | Product/compliance owner | Missing |
| OpenAI generation account/terms, source text archive, reviewer approval, AI-audio disclosure | Audio/content owner | Missing |
| Cloudinary account owner, retention/deletion, CDN rights and logs | Infrastructure/privacy owner | Missing |
| Milo video creator/model/raw-source agreement and music/SFX rights | Creative owner | Missing |
| Curriculum and sentence authorship/source review | Curriculum owner | Missing |
| Font version/licence notices and self-hosting/privacy decision | Engineering/privacy owner | Missing |
| Generated SBOM and consolidated third-party notices | Engineering owner | Command and inventory recorded; release artifact and full notices missing |

## Release control

E1.1 is **in progress**. The repository inventory and dependency SBOM command are complete enough to route evidence requests, but no asset family is cleared for external launch until the open evidence ledger, generated release artifact, and full notices are resolved. E1.8 (Oxford names/recordings), E1.9 (AI-audio disclosure), E1.6 (vendor review), E1.10 (claims register), and E1.11 (Children’s Code/DPIA) remain linked release gates.
