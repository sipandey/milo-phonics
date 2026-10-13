# Milo Phonics pre-marketing audit

**Audit date:** 13 October 2026  
**Scope:** Educational content, content rights and provenance, privacy/data flows, and external marketing claims.

> **Role and limitation.** This is an AI-produced, evidence-based educational and compliance review, not legal sign-off. It is not advice from an accredited SSP adviser, solicitor, or data-protection officer. Specialist UK SSP and privacy/legal review remains necessary.

## Executive summary and readiness

**Overall readiness: not ready for broad external marketing.**

The app demonstrably provides a fixed, cumulative single-letter sound sequence, audio-led letter exploration, and CVC/VC blending activities. However, Oxford provenance, AI-audio disclosure, privacy notices/vendor evidence, and SSP-alignment claims are not evidenced sufficiently for public claims.

The repository itself identifies this as a launch gate: [product roadmap](../plans/product-roadmap-and-android-strategy.md#L42).

## Prioritised findings

| Priority | Finding | Evidence | Next action |
|---|---|---|---|
| P0 | “Oxford” audio, name, and attribution claims lack a licence/provenance record. | [`src/data/audioManifest.ts`](../../src/data/audioManifest.ts#L14), [`OxfordSoundsScreen.tsx`](../../src/components/sounds/OxfordSoundsScreen.tsx#L135) | Pause all Oxford claims; obtain written commercial-content and trade-mark permission or remove references/assets. |
| P0 | “Zero child data… COPPA compliant” is unsupported. | [`README.md`](../../README.md#L19), [`index.html`](../../index.html#L9), optional [`ParentClerkSync.tsx`](../../src/components/parent/ParentClerkSync.tsx#L31) | Replace immediately; complete data map, vendor review, privacy notice and legal review. |
| P0 | Optional Clerk sync uploads child-linked progress to a parent account, with no account/data deletion path in app. | [`progressService.ts`](../../src/services/progressService.ts#L316) | Confirm controller/processor roles, lawful basis, deletion, retention, transfers, security and parent verification. |
| P0 | OpenAI TTS disclosure required by current official documentation is absent. | [`generate-audio.ts`](../../scripts/generate-audio.ts#L232) | Add clear end-user disclosure before marketing/release; preserve generation records and terms. |
| P1 | “SSP aligned with UK National Curriculum / Letters and Sounds” overstates the implemented content. | [`curriculumData.ts`](../../src/data/curriculumData.ts#L3), [`README.md`](../../README.md#L73) | Use a modest feature description only; commission SSP review and define a full curriculum specification. |
| P1 | The advertised seven sets do not faithfully reproduce the cited Letters and Sounds Phase 2 sequence. | [`curriculumData.ts`](../../src/data/curriculumData.ts#L53) | Correct the claim or change content after specialist review. |
| P1 | Audio/architecture documents conflict with code, so they are not reliable marketing evidence. | [`audio-generation.md`](../audio-generation.md#L4), [`audioManifest.ts`](../../src/data/audioManifest.ts#L422) | Establish one reviewed source of truth. |

## SSP and educational review

### What the code demonstrably does

- Uses seven cumulative groups: `s a t p`; `i n m d`; `g o c k`; `e u r`; `h b f l`; `j v w x`; `y z q`. It offers phoneme playback and left-to-right sequential blending. See [`curriculumData.ts`](../../src/data/curriculumData.ts#L3) and [`audioService.ts`](../../src/services/audioService.ts#L362).
- Provides 38 entries labelled CVC, including **“at”**, which is VC rather than CVC. See [`blendingData.ts`](../../src/data/blendingData.ts#L56).
- Makes `bed` available at Level 4 before `b` is introduced in Level 5. See [`blendingData.ts`](../../src/data/blendingData.ts#L301) and [`curriculumData.ts`](../../src/data/curriculumData.ts#L68).
- Includes a 47-item IPA reference screen, but this is not evidence that each recording is accurate, “pure”, Oxford-sourced, or suitable for teaching. See [`OxfordSoundsScreen.tsx`](../../src/components/sounds/OxfordSoundsScreen.tsx#L18).

The first three sets broadly resemble the early Letters and Sounds Phase 2 order. But that scheme specifies `ck` in Set 4, double-letter graphemes in Set 5, then `j v w x`, then `y z zz qu`; Milo instead treats `c`, `k`, and `q` as single-letter items and omits those graphemes. The documented Letters and Sounds sequence confirms this distinction: [DfE Letters and Sounds material](https://assets.publishing.service.gov.uk/media/5a7aa7b6e5274a34770e630c/Letters_and_Sounds_-_DFES-00281-2007.pdf).

A full SSP programme needs much more than a sound order: cumulative coverage of major GPCs, blending and segmenting, spelling/dictation, tricky words, decodable reading material, assessment, intervention and delivery guidance. DfE validation applied only to complete programmes, not partial resources: [DfE criteria](https://www.gov.uk/government/publications/phonics-teaching-materials-core-criteria-and-self-assessment/validation-of-systematic-synthetic-phonics-programmes-supporting-documentation).

**Supported, modest wording:** “An interactive, audio-led app with a fixed sequence of introductory letter–sound activities and simple word-blending practice.”

Do not claim SSP-programme status, DfE/Letters and Sounds/National Curriculum alignment, reading outcomes, “mastery”, or age suitability until an independent UK SSP specialist has heard every recording and reviewed the complete learning pathway. EYFS covers birth to five and is play-based, but that does not validate this app or establish suitability for ages 2–6: [EYFS guidance](https://www.gov.uk/early-years-foundation-stage).

## Content-rights and provenance register

| Material | Apparent use | Available evidence | Missing evidence / risk |
|---|---|---|---|
| Oxford phoneme and chart recordings | 26 `phoneme_*.mp3`, plus 47-chart screen | Code labels them Oxford; public files exist. | No licence, source URL, acquisition record, allowed territory/commercial scope, attribution requirements, or audio audit. **High risk.** Oxford’s published sample terms are internal-analysis only and prohibit name/brand use without consent; the actual licence may differ, but is not present. [Oxford terms](https://languages.oup.com/data-sample-terms-and-conditions/) |
| Oxford name/marks | README and app labels, including “Oxford Advanced Learner’s Dictionary” | Visible in UI. | No written trade-mark permission. **High risk.** |
| OpenAI TTS | Letters, words, prompts, praise and CVC/sentence generation | Scripts use `gpt-4o-mini-tts` and `coral`. | Account/plan terms at time of creation, generation logs, human acceptance testing, disclosure, and a record of all source text. **Medium/high.** Official OpenAI documentation requires clear disclosure that TTS voices are AI-generated: [OpenAI TTS guide](https://developers.openai.com/api/docs/guides/text-to-speech). |
| Milo videos | Two local MP4s | Files and code reference exist: [`MiloVideoCompanion.tsx`](../../src/components/common/MiloVideoCompanion.tsx#L1). | Creator agreement, model/animation/music licences, raw source and commercial rights. **High until proved.** |
| Text, word list, sentences, emojis | Curriculum and contextual sentences | Repository has the strings. | Editorial source/provenance and copying review are absent. **Medium.** |
| Google Fonts: Fredoka, Nunito | Remote page styling | Google-hosted stylesheet in `index.html`. | Version/licence record and privacy assessment; the fonts are not bundled. **Low rights / privacy relevant.** |
| Dependencies/icons/confetti | React, Clerk, Lucide, canvas-confetti etc. | Lockfile identifies licences for many packages, but no consolidated notices/SBOM. | Automated licence/security inventory and retained notices. **Low/medium.** |

## Privacy data-flow map

| Flow | Data and recipient | Code evidence | Unresolved questions |
|---|---|---|---|
| Local progress | Sound/object interaction counts, stars, levels, last-played timestamp, last letter and focus setting; stored on device | [`phonics.ts`](../../src/types/phonics.ts#L94), [`progressService.ts`](../../src/services/progressService.ts#L54) | Whether this becomes personal data in context; retention; user-facing deletion/explanation. Reset rewrites local state, but does not remove cloud data. |
| Google Fonts | Browser request metadata, including an IP address/online identifier, to Google on page load | [`index.html`](../../index.html#L9) | Google terms, locations/transfers, logs, retention and whether self-hosting is preferable. IP addresses can be personal data depending on context: [ICO guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/personal-information-what-is-it/what-is-personal-data/what-are-identifiers-and-related-factors/). |
| Clerk, if deployment enables its key | Parent account identifiers, potentially email/name, authentication data, and child-linked progress metadata | [`main.tsx`](../../src/main.tsx#L10), [`ParentClerkSync.tsx`](../../src/components/parent/ParentClerkSync.tsx#L27) | Active production settings, social login scope, cookies, subprocessors, UK transfer mechanism, security, retention, data-subject rights, deletion and parental-responsibility verification. |
| Cloudinary | Development-time uploads of generated audio; Cloudinary URLs remain in manifests | [`optimize-and-sync-audio.ts`](../../scripts/optimize-and-sync-audio.ts#L58) | Account owner, retention/deletion, access controls, CDN logs and hosting regions. Current browser resolver selects local paths first; it does **not** implement an on-error Cloudinary fallback. |
| OpenAI | Development-time fixed educational text sent to TTS API | [`generate-cvc-audio.ts`](../../scripts/generate-cvc-audio.ts#L77) | Account configuration, retention/usage settings, historic terms and operator access. The browser code does not call OpenAI. |
| Hosting | At least request/server logs and static-asset delivery are likely at the deployed host | [`vercel.json`](../../vercel.json#L1) | Actual host, logging, edge/CDN configuration, security headers, analytics/injected scripts and retention. Not knowable from this repository. |
| Analytics/ads/error reporting | None found in authored source or direct dependencies beyond third-party SDK behaviour | Source scan found no telemetry or advertising calls. | This is not proof that deployment, hosting, Clerk, browser extensions or future tags do not collect data. |

The app is plainly likely to be accessed by children. If it processes personal data, the UK Children’s Code is likely relevant to the service provider, including edtech providers; it calls for data mapping, high privacy by default and age-appropriate treatment: [ICO Children’s Code](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/introduction-to-the-childrens-code).

Local storage is a storage/access technology, not automatically exempt from consideration; the ICO’s current guidance specifically covers web storage and PECR/UK GDPR interaction: [ICO storage guidance](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/).

A parent account or arithmetic gate does not itself settle consent or child-data obligations. If relying on consent for an information-society service offered directly to a child, UK GDPR Article 8 rules apply below age 13, including reasonable efforts to verify parental responsibility: [ICO consent guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/children-and-the-uk-gdpr/what-are-the-rules-about-an-iss-and-consent/).

## Marketing claim matrix

| Current wording | Verdict | Safer wording |
|---|---|---|
| “100% Client-Side Privacy… Zero child data… (COPPA compliant).” [`README.md`](../../README.md#L19) | **Unsupported** | “The core play experience stores progress in the browser. Optional account backup and third-party services are described in our privacy notice.” |
| “Authentic Oxford Dictionary” / “Oxford Advanced Learner’s Dictionary” | **Pause — rights/expert review** | Do not use Oxford branding until written permission is verified. |
| “Pure British Received Pronunciation” [`index.html`](../../index.html#L8) | **Unsupported** | “Pre-recorded English phonics audio” only after an SSP/audio review; avoid accent claims until verified. |
| “Systematic Synthetic Phonics progression” / “aligned with UK National Curriculum / Letters & Sounds” [`README.md`](../../README.md#L73) | **Qualification required** | “Uses a fixed sequence of introductory letter-sound and blending activities.” |
| “38 CVC words” | **Inaccurate** | “38 simple word-blending entries,” unless the VC entry and all sound mappings are corrected. |
| “100% pre-recorded” | **Code-supported, provenance pending** | “Uses pre-recorded local audio assets.” Do not add origin/accent/quality claims without evidence. |
| “Cloudinary CDN backup/fallback” | **Unsupported by runtime code** | “Cloudinary URLs are retained in development manifests.” |
| “Toddler-tested”, “gold-standard”, effectiveness or “learn to read” | **Unsupported** | “Designed for short, audio-led phonics play.” |
| “Safe” or “privacy-first” | **Needs specialist review** | Avoid absolute safety/privacy claims; describe specific, verified controls instead. |
| “Ages 2–6” / “recommended ages 2–3” | **Needs evidence** | “Designed for parent-led early phonics exploration”; only add an age band after child-development, accessibility and usability review. |

## Owner evidence checklist

- Executed Oxford audio/content licence and written permission for every Oxford name, mark and attribution.
- Asset register for every audio file, video, character, illustration, text and font: creator, source, licence, permitted markets, term, modification rights and attribution.
- OpenAI account/terms record, model/voice/generation date, prompts, human pronunciation QA and the required AI-audio disclosure.
- Clerk, Google Fonts, Cloudinary and host contracts/DPAs, subprocessors, UK/international transfer mechanism, retention/deletion, security and incident processes.
- A production network capture covering first visit, local mode, Clerk sign-in/sync, reset, audio failure, mobile browsers and parent-gate flow.
- Child-facing and parent-facing privacy notice; storage/cookie explanation; rights/deletion process; controller contact; lawful-basis and Children’s Code/DPIA assessment reviewed by a UK privacy professional.
- SSP scope/sequence, GPC and pronunciation audit, assessment/review method, treatment of tricky words, and decodability audit signed off by a qualified UK SSP specialist.
- Pilot protocol and findings before any claims of learning, engagement, suitability or effectiveness.
- Software bill of materials and consolidated third-party licence notices.

## Claims to pause now

Pause: **Oxford**, **authentic Oxford**, **Oxford Advanced Learner’s Dictionary**, **pure British/RP**, **Letters and Sounds aligned**, **UK National Curriculum aligned**, **systematic synthetic phonics programme**, **COPPA compliant**, **zero child data**, **100% client-side privacy**, **Cloudinary fallback**, **fully offline/PWA**, **toddler-tested**, **safe**, **mastery**, and all learning-outcome claims.

## Verification note

No code or public claims were changed. The TypeScript build was attempted but dependencies are not installed in this checkout (`tsc: command not found`), so runtime verification remains outstanding.
