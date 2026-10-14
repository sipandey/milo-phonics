# Decisions Log — phonics

Short, append-only record of architecture/design decisions and why. A
decision belongs here if a future session (or a future you) would otherwise
have to re-derive it from scratch by reading git history.

## Format

```
### YYYY-MM-DD — short title

**Decision:** what was decided.
**Why:** the constraint or trade-off that drove it.
**Rejected:** what else was considered, and why it lost.
```

<!-- Entries go below this line, newest first. -->

### 2026-10-14 — Treat `dist/` as a generated curriculum release artifact

**Decision:** Keep `public/`, typed manifests, and runtime resolvers as the curriculum media source-of-truth. Review `dist/` as generated release evidence: the 14 October build contains 316 MP3 and 2 MP4 media files with exact path and SHA-256 parity to `public/`, zero zero-byte files, and no `ffprobe` failures. Do not commit or curate `dist/` separately.
**Why:** Build parity verifies packaging without conflating generated output with curriculum ownership, rights, pronunciation, or educational approval. The review also preserves the distinction between explicit manifest URLs and the 94 IPA files addressed through the dynamic sound resolver.
**Rejected:** Treating a successful build or local file presence as rights/curriculum clearance, duplicating generated media in Git, or moving/removing `at`, `bed`, or `box` only to make the validator green.

### 2026-10-13 — Gate Sentry errors and traces behind parent consent and scrub events

**Decision:** Keep Sentry default-off until a parent enables Optional Technical Diagnostics behind the arithmetic gate. Store a versioned local decision, fail closed when storage is unavailable, drop future events after revocation, and scrub user/account data, request URLs, breadcrumbs, contexts, tags, extras, transaction names, span attributes, and free-text exception messages. Retain only minimal release/environment metadata and sanitized stack structure; keep replay, logging, and metrics disabled.
**Why:** The app is likely to be used by children and has no prior consent or telemetry policy. A parent-controlled, reversible opt-in is the smallest repository-native boundary while preserving useful synthetic crash diagnostics. Sentry’s standard ingestion/network metadata and retention still require vendor/privacy review.
**Rejected:** Enabling Sentry whenever a DSN exists, using a deployment-only flag as a substitute for parent consent, transmitting raw exception messages or browser spans, and claiming E0.6 complete before retention/data-flow review.

Project-level server scrubbing, default scrubbers, IP-address storage prevention, and additional `user`/`geo` sensitive-field matches were enabled for new events. A consented synthetic event confirmed message/URL/content scrubbing and a readable stack, but Sentry still exposed an inferred geography context; that unresolved enrichment is retained as a vendor/privacy review item.

### 2026-10-13 — Keep Sentry production enablement blocked after vendor review

**Decision:** Record the Sentry Developer-plan/EU-storage/30-day-retention configuration and successful release `1.0.0` synthetic verification, but do not enable a production DSN yet. Keep the parent consent control and project scrubbers as the implementation boundary.
**Why:** The release dashboard is usable without child data, but the Sentry DPA still needs authorized review/acceptance, the privacy notice and deletion/backup/subprocessor behavior are undocumented, and Sentry-derived geography remained visible after IP redaction.
**Rejected:** Treating a free-plan retention period as complete privacy acceptance, accepting contractual terms on behalf of the product owner, or claiming that client-side scrubbing eliminates vendor-generated metadata.

### 2026-10-13 — Expose a review-marked parent privacy notice draft

**Decision:** Add a typed, arithmetic-gated Parent Dashboard notice that explains the Sentry opt-in, data categories, current retention evidence, revocation behavior, inferred geography, and pending approvals. Keep the notice explicitly marked as a draft until a privacy owner supplies a contact and accepts the DPA/data-flow wording.
**Why:** Parents need understandable information at the consent decision, while the repository does not have authority to publish legal terms or invent a deletion contact. A draft preserves truthful transparency without implying compliance approval.
**Rejected:** Hiding the data-flow caveats behind the toggle, presenting the Sentry runbook as a parent notice, or claiming E1.2/E0.6 acceptance from a technical implementation alone.

### 2026-10-13 — Add an opt-in, privacy-gated Sentry foundation

**Decision:** Provision the `milo-phonics` Sentry project, initialize `@sentry/react` only when `VITE_SENTRY_DSN` is configured, enable browser errors and 10% tracing by default, and activate Vite source-map upload only with the secret `SENTRY_AUTH_TOKEN`. Keep Session Replay, client logging, and application metrics disabled.
**Why:** Release-versioned browser errors and readable production stack traces are useful engineering signals, while the child-facing product requires telemetry minimization. DSN opt-in keeps contributors and deployments without an approved monitoring configuration unaffected.
**Rejected:** Enabling replay, logging, or metrics by default; hardcoding a DSN or token; and treating the base SDK wiring as completion of E0.6 before parent consent, event scrubbing, retention, and vendor data-flow review are accepted.

### 2026-10-13 — Align the supported runtime with Vercel Node 24.x

**Decision:** Set the supported runtime to Node.js 24.x and npm 11.x in `package.json` and `package-lock.json`, pin `.nvmrc` to the Node 24 line, run CI on Node 24.x, and update setup documentation.
**Why:** Vercel discontinued the Node 20.x build runtime and rejects deployments using the previous contract. Keeping the package, local version hint, CI, current architecture record, and README aligned prevents another deployment/runtime mismatch.
**Rejected:** Changing only the Vercel project setting, which would leave local and CI drift; retaining Node 20 because the E0.1 baseline is superseded by the platform requirement.

### 2026-10-13 — E0.3 uses production-boundary unit tests with a pure parent-gate seam

**Decision:** Test progress persistence through an in-memory `Storage` implementation, test audio URL resolution through `getAudioEntry`, and extract only the arithmetic challenge generation/comparison from `ParentGateModal` into a pure helper.
**Why:** This covers the backlog’s normal, corrupt, migration, fallback, and gate-rule cases headlessly while preserving the current singleton, manifest, and modal behavior. It avoids introducing a DOM test dependency for rules that are inherently pure.
**Rejected:** Rendering the modal with a new jsdom/testing-library stack for E0.3, or duplicating resolver and gate logic inside tests.

### 2026-10-13 — E0.4 establishes a canonical current product and architecture record

**Decision:** Use `docs/plans/current-product-and-architecture.md` as the source of truth for implemented facts, runtime architecture, data-flow caveats, claims status, and current status. Keep the technical backlog as execution control, the product roadmap as strategy, and older roadmaps as explicitly non-authoritative.
**Why:** README, audio guidance, and older roadmaps had drifted from the local-first audio resolver and the audit’s privacy/rights findings. A hierarchy with one current record prevents sales, compliance, and engineering from treating planned or unsupported claims as shipped behavior.
**Rejected:** Updating only README, which leaves developer guidance stale; rewriting the backlog into a product document, which mixes acceptance tracking with product facts; deleting older plans, which loses useful historical and strategic context.

### 2026-10-13 — E0.5 emits a no-store release identity without authorizing a production tag

**Decision:** Derive build version from `package.json`, emit `dist/release.json` with version, commit, and channel metadata, verify it mechanically after build, and document operator-led tagging/deployment/rollback steps. Do not bump or tag a production release in E0.5.
**Why:** The repository already has a package version but no serving-build identity or rollback runbook. The current audit and release gates still contain P0 holds, so release traceability must be implemented without implying production readiness.
**Rejected:** Maintaining a manually edited public version file, embedding only a compile-time UI label without a deployment smoke endpoint, or tagging `v1.0.0` before rights/privacy/security gates close.

### 2026-10-13 — Raise the Node 20 minimum for the E0.2 toolchain

**Decision:** Set the supported Node range to `>=20.19.0 <21` and pin `.nvmrc` to `20.19.0`.
**Why:** The resolved ESLint 10 toolchain requires Node 20.19.0 or newer. Keeping a generic Node 20.x contract would advertise versions that cannot run the configured lint gate reliably.
**Rejected:** Pinning an older ESLint major solely to retain compatibility with earlier Node 20 patch releases; the current flat-config toolchain is the approved E0.2 baseline and the existing CI Node 20 channel resolves to a compatible release.

### 2026-10-13 — Use Vitest and ESLint flat config for E0.2 quality gates

**Decision:** Use Vitest for the unit-test command, ESLint 10 with `typescript-eslint` flat config for linting, and extend the existing AgentRoom pull-request workflow with `npm ci`, `npm run lint`, `npm test`, and `npm run build`.
**Why:** Vitest shares the Vite/TypeScript module model already used by the application, while the flat ESLint configuration is the current native configuration path. Npm resolved the current compatible ESLint 10 and Vitest 4 releases under the Node 20 contract. One workflow keeps the existing AgentRoom checks and application gates together without duplicating CI setup.
**Rejected:** Jest plus `ts-jest` because it adds a second transform model, lint/build-only because E0.2 requires a unit-test gate, and a second workflow because it would duplicate checkout and Node setup.

### 2026-10-13 — Standardize the Node/npm baseline for E0.1

**Decision:** Support Node.js 20.x LTS and npm 10.x. Declare the contract in `package.json`, provide `.nvmrc` with the Node 20 major line, and document `npm ci` as the clean-install path.
**Why:** CI already runs on Node 20, while the README permits Node 18+ and npm 9+ and the repository has no machine-readable local runtime contract. Aligning local setup with CI reduces environment drift without changing protected workflow configuration.
**Rejected:** Keeping the broad Node 18/npm 9 guidance because it does not match the existing CI baseline, and changing CI because `.github/workflows/**` is protected and already uses the target Node major.

### 2026-09-16 — Automatic Level Graduation, Home Mute Protection & Parent Level Selector

**Decision:** Addressed three high-impact P0 product findings across curriculum progression, sensory stability, and parent agency:
- **Automatic Level Graduation**: Connected `advanceToNext` in `LetsPlayScreen` to detect when the child completes the final object of the final letter in their active curriculum set. Instead of looping back to `s`, the engine triggers a grand milestone celebration (fanfare audio, confetti, celebratory milestone card), promotes `progressService.unlockLevel(nextLevelId)` and `progressService.setCurrentLevel(nextLevelId)`, and smoothly transitions into Level 2 (`i, n, m, d`).
- **Cross-Game Level Synchronization**: Connected `SoundTrainScreen` to subscribe to `progressService` updates and prioritize newly unlocked level words (`pan`, `pin`, `mat`, `dad`) so the entire four-game ecosystem immediately reflects the new phonics set.
- **Accidental Mute Protection**: Replaced the prominent 56px bare `Mute` button in the top-left corner of `HomeScreen` with a child-friendly `Star Bank Badge` (`{progress.totalStars} Stars`), completely eliminating accidental toddler mute taps. Relocated master audio and volume controls exclusively inside the `ParentDashboard` (behind the math gate).
- **Interactive Parent Level Selector**: Converted read-only curriculum set cards in `ParentDashboard` into interactive buttons, allowing parents to tap any unlocked phonics set (e.g. Level 2: `I N M D`) to set it as active with immediate acoustic confirmation.
**Why:** In Toddler Focus Mode, removing modal buttons previously trapped toddlers in Level 1 indefinitely. Furthermore, exposing a bare mute toggle on the toddler home screen led to accidental silent-mode drop-offs. Automating graduation and empowering parents behind the math gate preserves zero-text toddler simplicity while ensuring continuous pedagogical advancement.
**Rejected:** Requiring toddlers to manually select levels via complex map drawers, leaving the mute toggle exposed on the child stage, and keeping curriculum sets read-only in the Parent Dashboard.


### 2026-09-16 — Synchronous Ref Guards & Hardware Debounce Against Duplicate Audio Triggering

**Decision:** Implemented synchronous reference guards (`hasPoppedRef`, `isAudioBusyRef`, `isProcessingIncorrectRef`, `lastTapTimeRef`) and a 400ms–450ms hardware debounce across interactive game elements (`BubblePopScreen`, `CharacterMilo`, `FeedMiloScreen`):
- **Synchronous vs Asynchronous Guarding**: Replaced purely asynchronous React state checks (`poppedLetterId`, `isAudioBusy`) with immediate synchronous refs (`hasPoppedRef.current = true`). Rapid subsequent clicks (50–250ms) are dropped before any audio synthesis or delayed `setTimeout` callbacks can be scheduled.
- **Milo Tap Decoupling**: Updated `<CharacterMilo>` to debounce clicks (450ms) and eliminated redundant internal `audioService.playBoing()` calls when an explicit `onTap` handler is passed, preventing layered dual-sound collisions (boing + pop + voice).
- **Explicit Speech Timer Cancellation**: Centralized `clearPendingActionTimers()` in `BubblePopScreen` to actively clear any in-flight speech or reset timeouts when a new round or user action begins.
**Why:** Real-world toddler and multi-touch interactions frequently produce double-taps within 50–150ms before React state updates flush to the DOM. Relying on asynchronous state allowed multiple click handlers to run concurrently, triggering duplicate Web Audio oscillator pops and duplicate HTMLAudioElement speech playbacks.
**Rejected:** Relying solely on React `disabled` DOM attributes (disabled attributes do not take effect until the next render commit, leaving a multi-frame window where rapid taps execute).


### 2026-09-16 — Single-Action Auto-Advancing Loops for Bubble Pop & Sound Train

**Decision:** Simplified the interaction architecture of both Bubble Pop and Sound Train under Toddler Focus Mode (`progress.toddlerFocusMode !== false`):
- **Bubble Pop Simplification**:
  - Enforced strictly 2 bubbles across all curriculum levels in Focus Mode for clean binary auditory discrimination (/s/ vs /a/), eliminating visual search fatigue.
  - Eradicated the redundant yellow "Hear Again" squircle button (companion Milo is the sole, intuitive audio trigger).
  - Eradicated unreadable footer instruction text.
  - Scaled bubbles to responsive 160–192px touch targets with specular reflections.
  - Added a 5.0s auditory repetition loop and 1.1s auto-advance with 3.5s fail-safe watchdog timer.
- **Sound Train Simplification**:
  - Eradicated 10-button cognitive overload: removed footer navigation dock ("Again" & "Next" buttons), header level drawer modal button, and complex story sentence card.
  - Unified blending into an autonomous locomotive journey: 1-tap on Train Engine or Blend button triggers sequential carriage bounce `/s/` -> `/æ/` -> `/t/` -> whistle chime -> "SAT!".
  - Displays a clean celebratory picture + word card (`🐱 SAT`) with a 1.5s golden pause before automatically chugging to the next word.
  - Added 5.5s idle whistle prompt and 5.5s fail-safe watchdog timer to guarantee zero hangs.
- **Parent Dashboard Toggle**: Preserved full multi-button Explorer Mode when Toddler Focus Mode is disabled.
**Why:** Toddlers aged 24–36 months are easily overwhelmed by multiple UI options and text instructions, resorting to frantic button-mashing rather than phoneme processing. Reducing screens to a single clear action followed by automatic progression transforms the app into an engaging, self-pacing cause-and-effect learning toy.
**Rejected:** Keeping mandatory "Next" buttons (toddlers don't read or notice them, leading to abandonment), leaving 3+ bubble choices on early levels, or cluttering Sound Train with secondary sentence narration.


### 2026-09-16 — Anti-Deadlock Audio Promise Architecture, Concurrency Tokens & Non-Blocking Visual Aura

**Decision:** Overhauled audio promise lifecycle management and interaction overlays to permanently eliminate deadlocks caused by rapid multi-clicks while audio is speaking:
- **Immediate Resolver Unblocking**: Added `currentAudioResolve` tracking to `AudioService`. When `stopRemoteAudio()` or a new sound is triggered, any pending resolver is invoked immediately, guaranteeing that no awaiting Promise is leaked or suspended when an active audio element is paused.
- **Concurrency Token (`currentBlendToken`)**: Added sequential tokens to all multi-step blend routines (`playPhonemeWordBlend`, `playSequentialBlend`). If a new tap interrupts playback, stale asynchronous steps abort immediately, preventing race conditions over `setBusy(false)`.
- **Fail-Safe Watchdog Pacing**: Added a 5.5s watchdog timeout inside `playRemoteVoice` and a 4.5s fail-safe watchdog timer in `LetsPlayScreen`'s `handleTapObject`, ensuring that even under severe audio pipeline or network stalls, auto-advance and state resets are 100% guaranteed.
- **De-Weaponization of Overlays**: Replaced full-screen pointer-blocking attributes (`cursor-wait`, `select-none`, `touch-none`, `e.stopPropagation()`) in `<ListenRipple>` with `pointer-events-none z-20`, ensuring visual musical notes never intercept, trap, or swallow toddler taps.
**Why:** In the HTML5 Audio standard, `audio.pause()` does not fire `'ended'` or `'error'` events. Awaiting `ended` caused interrupted speech promises to hang forever, preventing `finally { this.setBusy(false); }` and auto-advance from executing, while `ListenRipple` at `z-40` covered the screen and blocked all clicks.
**Rejected:** Keeping full-screen blocking overlays to absorb touch jitter (creates catastrophic deadlocks whenever audio stalls or rejects) and relying on unmonitored HTMLAudioElement event callbacks without fallback watchdogs.

### 2026-09-16 — Persistent Progress Resume, Continuous Repetition Loop & Scaled-Up Card Visuals

**Decision:** Implemented persistent position resumption and continuous auditory repetition in "Let's Play", alongside scaled-up character and card visuals:
- **Last Position Resume**: Added `lastObjectIndex` to `ChildProgress` schema and implemented `progressService.setLastPosition(letterId, objectIndex)`. When opening "Let's Play", the screen reads `lastLetter` and `lastObjectIndex` and resumes exactly at the child's previous sound card rather than resetting to `S Sun`.
- **Continuous Auditory Repetition Loop**: When a card is active, after initial audio completes, a 5.5s timer triggers unhurried repetition of `playPhonemeWordBlend` with a gentle card wiggle until the child taps the card. Tapping immediately cancels the loop, awards stars, and auto-advances.
- **Scaled-Up Visuals**: Enlarged companion Milo to `size="lg"` (`w-32 h-32 sm:w-40 sm:h-40`, a 35% scale-up) and expanded the Hero Card to responsive `w-[min(84vw,340px)] h-[min(84vw,340px)] sm:w-84 sm:h-84 md:w-92 md:h-92` with `text-9xl sm:text-[9.5rem]` emoji and `text-4xl sm:text-5xl` typography.
**Why:** Toddlers easily lose focus or get distracted; repeating the authentic sound every 5.5s maintains auditory engagement without annoying pacing. Storing exact progress honors the child's learning journey across sessions. Scaling up the hero card and Milo takes full advantage of the uncluttered Focus Mode canvas, creating a massive, inviting tactile centerpiece.
**Rejected:** Resetting to S on every entry, repeating audio faster than 4 seconds (creates sensory overload), and rigid non-responsive card widths that clip on small viewports.

### 2026-09-16 — Toddler Focus Mode (Single-Action Auto-Advancing Pacing) & Audio Remastering to -1.0 dBFS Peak

**Decision:** Introduced Toddler Focus Mode (`toddlerFocusMode: true` by default, toggled via Parent Dashboard) with single-action auto-advancing pacing across the app, and remastered all 269 voice audio files to broadcast loudness standard (-1.0 dBFS peak).
- In `LetsPlayScreen`: Eradicated the 4-letter stepping stone tabs, top level-map badge button, and footer "Again" / "Next" dock when in Toddler Focus Mode. The central Giant Card is the sole visual affordance. Tapping the card plays authentic Oxford phoneme blend + word sound, celebrates with star rewards, and smoothly advances to the next object after a 1.2s golden pause without requiring any manual button taps.
- In `FeedMiloScreen`: Eradicated redundant replay/yum buttons under Milo and bottom instruction text; toddlers focus purely on Milo and feeding plates.
- In `HomeScreen`: Filtered out adult reference dictionary grids ("Letters" and "Sounds"), presenting pre-readers with only 4 colorful core play activities.
- In Audio Infrastructure: Peak-normalized all 269 speech/word files to exactly -1.0 dBFS (permanent +12dB to +20dB boost) and restored corrupted silent `cvc.cat.mp3`. Added dynamic SFX ducking in `AudioService` (procedural chimes/pops duck to 40% gain during speech and restore to 90% afterwards).
**Why:** Real-world toddler playtesting revealed that 2-year-olds frantically tap every button in sight (tabs, map, next, replay) without listening to phonemes, while faint audio (~-29 LUFS on mobile) was drowned out by background noise or Web Audio SFX. Removing extraneous buttons transforms frantic button-mashing into a focused "Tap -> Listen -> Celebrate -> Auto-Advance" single-action loop.
**Rejected:** Keeping mandatory "Next" and "Play Again" buttons for toddlers (causes cognitive overload and premature sound skipping), leaving volume unbalanced, or forcing non-reversible UI stripping (Parent Dashboard toggle preserves full Explorer Mode for older children).

### 2026-09-16 — Toddler Paced Chewing (3.8s) with Tap-to-Skip & Eradication of Text Speech Bubbles

**Decision:** Extended Milo's chewing reward duration from 1.8s to 3.8s in "Feed Milo!", completely eradicated the text speech bubble from the game arena, and added a dual early-advance affordance: tapping Milo directly or tapping the chunky `[ 😋 Yum! ]` button after the 1.4s Oxford phoneme audio finishes skips ahead to the next round immediately.
**Why:** Toddlers aged 24–36 months cannot read; text speech bubbles add vertical clutter, compete for attention with the 3D character video, and contradict the app's zero-text first principle. Furthermore, 1.8s was too brief, cutting off Milo's chewing video right before his puffed-cheek munch and smile (Beat 2 & 3), while creating auditory crowding (~1.1s) between the reward sound and the next target phoneme. A 3.8s auto-advance provides unhurried auditory consolidation and full video appreciation, while tap-to-skip provides impatient toddlers with 100% agency without introducing a mandatory blocking "Next" button.
**Rejected:** Mandatory blocking "Next" buttons (causes toddler drop-off/abandonment when children don't realize they have to click a UI arrow to continue) and keeping text dialogue balloons for pre-readers.

### 2026-09-16 — "Feed Milo!" Initial-Sound Feeding Minigame & 3D Video Companion Architecture for 24–36 Months

**Decision:** Built an initial-sound sorting minigame ("Feed Milo!") structured as 5-round micro-sessions (~60–75s duration) with dual feeding affordances (physical pointer/touch drag-and-drop OR 1-tap arc swoop feeding into Milo's mouth). Integrated a center-cropped 1:1 squircle 3D video avatar (`<MiloVideoCompanion>`) using AI-generated 3D character video (`milo_hungry_pose.mp4`) with smooth fallback to `<CharacterMilo />` SVG. Rounds feature authentic Oxford RP phoneme prompts (`phoneme.<letter>`), Level 1 binary choices (strictly 2 plates) and Levels 2–7 3 plates, procedural chewing/slurping Web Audio SFX (`audioService.playSfx('crunch')` / `'slurp'`), zero-shame carton wobble on incorrect drops, a 6-second golden shimmer lifeline, and a Chef Milo celebration modal with +5 stars payout.
**Why:** Toddlers aged 24–36 months are developing fine motor skills; requiring drag-and-drop alone causes drop fatigue and frustration, so dual affordance (drag OR 1-tap swoop) guarantees 100% accessibility. Video companions create profound emotional bonding, while center-cropping (720×720 square crop from 1280×720 16:9) isolates the character dead-center and eliminates edge watermarks without letterboxing. Muted video playback prevents audio collision with pure Oxford RP phonemes.
**Rejected:** Strict drag-and-drop only without tap fallback (unforgiving for toddler motor control), unmuted video audio (conflicts with phoneme learning), and 3+ food choices on Level 1.

### 2026-09-16 — Home Screen 2×3 Symmetrical Activity Grid Layout

**Decision:** Arranged toddler activities on the Home Screen into an even 2×3 grid: Row 1: Core Exploration (`Let's Play!` yellow) + Blending (`Sound Train!` green); Row 2: Auditory Discrimination (`Bubble Pop!` purple) + Initial Sounds (`Feed Milo!` amber); Row 3: Reference Tools (`Letters` coral) + (`Sounds` sky). Styled with responsive heights fitting within `100dvh` on mobile and desktop without vertical scroll clipping.
**Why:** Maintains visual symmetry and equal access to all 6 core learning activities without burying features in submenus or forcing scrolling on compact mobile devices (320px–390px viewports).
**Rejected:** 2-1-2 layout with an oversized solitary banner (unbalanced once the 6th feature was added) and vertical scrolling feeds.

### 2026-09-16 — Bubble Pop Auditory Discrimination Game Architecture for 24–36 Months

**Decision:** Built an active auditory discrimination game ("Bubble Pop!") structured as 5-round micro-sessions (~60–75s total duration) with binary choices (strictly 2 bubbles: Target + 1 Distractor) for Level 1, and 3 bubbles for Levels 2–7. Rounds begin with automatic Oxford RP isolated phoneme playback (`phoneme.<letter>`), companion Milo in an ear-cupping listening pose (`isListening`), an 80×80px "Hear Again" squircle replay button, zero-shame cartoon wobble on errors (`boing` sfx + softly whispered error sound + re-prompts target + zero star penalty), a 6-second inactivity golden shimmer lifeline, and a grand 5-round celebration card with a crowned Milo (`👑`) and +5 stars payout.
**Why:** Toddlers aged 24–36 months have ~60s attention spans and limited auditory working memory. Binary choices prevent visual choice overload; zero-shame resilience keeps toddlers engaged without frustration or fear of failure; non-verbal ear-cupping posture directs listening focus without relying on unreadable text instructions.
**Rejected:** Timed rounds, negative buzzer sounds, deducting stars on error, 4-bubble layouts for Level 1, and text-only instructions.

### 2026-09-16 — Home Screen 2 - 1 - 2 Symmetrical Activity Layout

**Decision:** Arranged toddler activities on the Home Screen into a balanced 2 - 1 - 2 grid: Row 1 features core exploration (`Let's Play!` yellow) and blending (`Sound Train!` green); Row 2 features the active auditory game (`Bubble Pop!` purple banner with `🫧` icon and `Listen & Pop! 👂` badge); Row 3 features reference tools (`Letters` coral and `Sounds` sky). Styled with responsive heights fitting within `100dvh` on mobile and desktop.
**Why:** Balances the 5 core learning activities without burying new features in submenus or forcing toddlers to scroll vertically on compact mobile viewports (e.g. 320×568 and 390×844).
**Rejected:** 1-column vertical list (forces excessive scrolling on mobile), hiding minigames in a parent/settings drawer.

### 2026-09-16 — Complete Eradication of Browser SpeechSynthesis in Favor of Oxford-First & AI Cloudinary Pipeline

**Decision:** Completely eliminated all calls to `window.speechSynthesis`, utterances, and browser native speech synthesis across `audioService.ts` and all components. Authentic Oxford Dictionary human recordings (`/audio/phoneme_<letter>.mp3`) strictly take top precedence for all 26 letter phonemes. Everything else (84 curriculum words, 38 CVC words, 38 story sentences, 26 letter names, 4 game prompts, 6 praise cues) is pre-recorded with OpenAI TTS (`coral` voice, slow 0.70x–0.75x British RP pace matching Oxford) backed by Cloudinary CDN URLs and local edge caching in `public/audio/`.
**Why:** User directives: "never use browser native capability for speaking, always use / get the recording from AI ans store in cloudinary" and "for phonemes and words and audio in oxford audio should take precedence". Modern browsers (Chrome/Safari) throttle or cancel speech synthesis outside immediate user gestures, and OS system voices sound robotic and inconsistent across operating systems.
**Rejected:** Hybrid speech synthesis fallback, client-side Web Speech API, or live streaming TTS.

### 2026-09-16 — Trailing Dead Silence Trimming & Decoupled Blending UX

**Decision:** Automated `ffmpeg silenceremove` across all pre-recorded TTS audio files, stripping 1.5s–3.4s of trailing dead silence per file (e.g. `cvc.sat.mp3` reduced 83% from 3.89s to 0.65s). Decoupled automatic blocking story sentence playback from the Sound Train blend action; blending sequence unlocks action buttons immediately once the blended word sounds (~2.8s total sequence instead of 13s), leaving the sentence accessible on-demand via the revealed card.
**Why:** Blending previously took 12–14s due to OpenAI TTS silent padding and blocking sentence narration, exceeding toddler attention spans. Snappy < 2.8s blending keeps toddlers engaged while preserving clear phonemic isolation.
**Rejected:** Artificial audio acceleration or omitting pauses between phonemes (harms phonics learning).

### 2026-09-15 — Toddler Impatience Protection: Non-Destructive Tap Absorber & Attention Spotlight

**Decision:** Built `<ListenRipple>` touch absorber with floating musical emojis (`🎵`, `🎶`, `✨`), 600ms hardware debounce guard, glowing attention spotlight on sounding items, and "Your Turn" unlock pulse across both Sound Train and Let's Play modes. Synchronized through centralized `audioService.isBusyPlaying()` lifecycle.
**Why:** Toddlers aged 2–3 tap frantically and repeatedly when excited or impatient. Crudely locking the screen or ignoring taps frustrates children, while unmanaged taps cause audio stutter, clipped utterances, and accidental screen skips.
**Rejected:** Intrusive warning dialogs, negative error buzzer sounds, or rigid modal freezes.

### 2026-09-15 — Oxford Dictionary British Audio & Local Static Word Bundling

**Decision:** Sourced authentic human British English recordings for all 47 phonemes from the Oxford Dictionary dataset (`xiaozhah/phoneme_audio`) as static files (`/audio/phoneme_<letter>.mp3`). Generated all 84 curriculum words using OpenAI TTS (voice: `coral`, speed: `0.70`) bundled directly into `public/audio/words/`. Expanded curriculum from 3 to all 26 letters with in-place sound buttons.
**Why:** Synthetic AI models struggle with pure isolated phonemes without letter-name contamination. Browser `SpeechSynthesis` silently fails or drops audio when called asynchronously after audio elements due to user-activation expiry and missing British OS voice packs. 100% local static MP3 files guarantee zero latency, zero API costs, zero CORS/proxy issues, and 100% offline reliability across all platforms.
**Rejected:** Remote Cloudinary streaming (blocked by local proxy/CORS), browser SpeechSynthesis for words (silent drops in Chrome/Safari), and synthetic formant phoneme approximation.

### 2026-09-14 — Semantic Audio Manifest Architecture

**Decision:** Refactored audio architecture to route all spoken content through semantic audio IDs (e.g. `letter.m`, `phoneme.m`, `word.monkey`, `phrase.m-monkey`) registered in `src/data/audioManifest.ts`. `AudioManager` resolves IDs, supports remote URL playback with in-memory caching and preloading, and falls back to calibrated `SpeechSynthesis` using manifest `fallbackText`. Procedural Web Audio SFX remain distinct and local.
**Why:** Decouples game components from browser speech synthesis and prepares the application for pre-generated Cloudinary audio assets in Phase 2 without changing component contracts or learner interactions.
**Rejected:** Embedding remote Cloudinary URLs directly in component files or replacing procedural Web Audio SFX with streamed audio files.

### 2026-09-14 — Progressive Letter Introduction Starting with M, S, A

**Decision:** Do not present toddlers with an A–Z alphabet grid. Introduce letters progressively, starting specifically with **M**, then expanding to **S** and **A**.
**Why:** Bilabial hums (*"Mmmm"*) and continuous sibilants (*"Sssss"*) are among the easiest phonemes for 2–3-year-olds to isolate and vocalize. Leading with M and familiar concrete objects (Monkey, Moon, Milk) prevents cognitive overload.
**Rejected:** Traditional alphabetical order (A–Z grid) which promotes rote visual memorization rather than phonemic listening.

### 2026-09-14 — Zero-Text Toddler UX with 88px+ Touch Targets

**Decision:** Never depend on written text for any core child interaction; enforce minimum 88px touch boundaries with squash-and-stretch CSS active feedback and instant procedural audio cues.
**Why:** Children aged 2–3 cannot read, possess developing fine motor control, and often tap with multiple fingers or palms. Every tap must deliver immediate auditory/visual feedback without failure states.
**Rejected:** Standard 44px mobile touch targets, text instructions, menus, timers, and scoring screens.

### 2026-09-14 — Arithmetic Parent Gate and Local Observability

**Decision:** Protect parent settings and play metrics behind a quick arithmetic gate (`a + b = ?`), storing all progress purely in LocalStorage.
**Why:** Effectively stops toddlers from wandering into settings without requiring passwords or cloud accounts, guaranteeing 100% COPPA compliance and toddler privacy.
**Rejected:** Cloud auth/account registration which introduces user friction and child privacy liability.

### 2026-09-14 — Integrate create-agent-room for engineering governance

**Decision:** Scaffolding full `create-agent-room` profile with Claude, Cursor, and Git adapters, plus testing, security, and release skill packs.
**Why:** Establishes mechanical agent governance, stop-hooks, guardrail checks, pre-commit validation, and structured decision tracking directly within the phonics project.
**Rejected:** Ad-hoc unversioned rules or unvalidated agent prompts.

### 2026-09-14 — Phonics App Toddler-First Client-Side Architecture

**Decision:** Built using React 18, Vite, TypeScript, Tailwind CSS with procedural Web Audio SFX and toddler-calibrated SpeechSynthesis API.
**Why:** Zero latency on touches, 100% offline functionality, full COPPA compliance (no toddler data leaves device), and procedural audio synthesis eliminating missing audio asset failures.
**Rejected:** Server-side streaming audio or heavy external audio asset CDNs that cause buffering delays for toddlers.

### 2026-10-13 — E0.7 production review boundaries and observed runtime state

**Decision:** Treat E0.7 as in progress until an authenticated release check can capture a complete network trace and safely cover reset, induced audio failure, and release metadata. Record the current production Clerk Development-mode surface and the dashboard’s Cloudinary wording as findings rather than silently changing authentication or audio behavior in an audit slice.
**Why:** The browser review verified first visit, local progress, the arithmetic parent gate, sign-in inspection, and a 390×844 smoke session, but the available tooling could not provide HAR/resource timing, `/release.json` was blocked by the browser client, reset would delete local test progress, and production fault injection was unavailable. Authentication changes are approval-sensitive, and the runtime resolver currently prefers bundled local audio even though generated metadata retains Cloudinary URLs.
**Rejected:** Marking E0.7 complete from source inspection alone, accepting the destructive reset without explicit confirmation, or changing Clerk/audio implementation while the release dependency and privacy decisions remain open.

### 2026-10-13 — E1.1 asset register as a rights evidence gate

**Decision:** Use `docs/asset-rights-register.md` as the single inventory for shipped media, referenced media, fonts, inline visuals, and direct libraries. Keep each row blocked until creator/source, licence or contract, markets, term, modification rights, attribution, expiry/review date, and retained evidence are recorded.
**Why:** Repository presence, generated metadata, a vendor URL, or an installed package licence field does not prove commercial rights, provenance, or service-term acceptance. The inventory also exposed two video paths referenced by code but absent from `public/`, which must be resolved before treating the video surface as complete.
**Rejected:** Inferring rights from file presence, treating Cloudinary/OpenAI metadata as ownership evidence, or marking E1.1 complete with a catalogue that lacks owner evidence.

### 2026-10-13 — Use npm's lockfile SBOM as the dependency evidence source

**Decision:** Add `npm run sbom:spdx` as the reproducible SPDX 2.3 generation command and record its 410-package licence snapshot in `docs/third-party-notices.md`. Retain the generated JSON and full notice text with release evidence; do not treat the checked-in summary as a complete legal notice bundle.
**Why:** The lockfile contains exact versions, integrity values, dependency relationships, and declared licences. The snapshot also exposes FSL-1.1-MIT, CC-BY-4.0, and BlueOak-1.0.0 entries that require explicit review rather than an unsafe MIT-only summary.
**Rejected:** Installing an unpinned licence tool, relying on direct dependencies only, normalizing non-MIT identifiers to MIT, or claiming E1.1 complete before the generated release artifact and notice text are retained.

### 2026-10-13 — Keep E1.2 as a typed, parent-gated draft

**Decision:** Replace the Sentry-only parent notice surface with a typed `PARENT_PRIVACY_NOTICE` draft that covers the currently observed local storage, optional Clerk sync, Google Fonts, bundled audio, OpenAI/Cloudinary generation roles, hosting, Sentry diagnostics, retention, deletion, transfers, and contact gaps. Render it only inside the existing arithmetic-gated Parent Dashboard.
**Why:** E1.2 needs a single plain-language record aligned with runtime facts, but the controller contact, vendor terms, deletion paths, and public publication location are not approved. A typed model plus a contract test prevents the dashboard and review document from silently omitting a data surface.
**Rejected:** Publishing a legal-looking notice without a contact, claiming compliance or zero data, describing Cloudinary as a browser fallback, or treating the arithmetic gate as proof of parental responsibility or legal consent.

### 2026-10-13 — Separate observed data flows from unverified vendor evidence

**Decision:** Use `docs/data-flow-inventory.md` as the E1.3 technical source of truth. Record authored runtime/build destinations and observed fields, but leave controller/processor roles, retention, deletion, subprocessors, transfers, hosting logs, and security fields explicitly unknown until an owner attaches evidence.
**Why:** The E0.7 source/network review identified the browser destinations but could not provide packet-level tracing, credentialed Clerk sync, vendor contract terms, or host-log settings. The inventory must not turn those gaps into privacy claims.
**Rejected:** Treating a browser SDK import as proof of vendor terms, treating absence of authored analytics as proof of no deployment data collection, or marking E1.3 complete from source inspection alone.

### 2026-10-13 — Add bounded retry protection to the parent gate

**Decision:** Keep the arithmetic gate as a UX safeguard and add browser-crypto-backed challenge randomness when available, unbiased answer shuffling, and an in-memory five-failure/60-second window followed by a 30-second lockout. Reset failures after a correct answer; do not persist a bypass token.
**Why:** E1.4 requires a non-predictable challenge and rate limiting for parent-only actions. The existing helper used `Math.random()` and the modal regenerated indefinitely after wrong answers. A bounded client-only tracker improves accidental/brute-force resistance without pretending to establish identity or legal consent.
**Rejected:** Persisting a parent unlock token in LocalStorage, treating the challenge as parental verification, or adding server-side claims where the current app has no account-gated authorization endpoint.

### 2026-10-13 — Add scoped AI-audio disclosure without overclaiming provenance

**Decision:** Disclose in the parent audio panel and README that some bundled curriculum voice audio was generated with OpenAI TTS. Keep the statement scoped and separate from phoneme-source, Oxford, accent, rights, vendor-term, and quality claims.
**Why:** E1.9 requires clear disclosure where the repository evidences OpenAI TTS generation. The register does not establish that every audio file has the same origin, nor does it contain complete generation/rights records.
**Rejected:** Calling all audio AI-generated, describing OpenAI or Cloudinary as browser runtime dependencies, or using the disclosure as proof of rights, pronunciation quality, or legal compliance.

### 2026-10-13 — Enforce paused claims at the production build boundary

**Decision:** Maintain `docs/claims-register.md` as the claims authority and run `npm run verify:claims` from `npm run build` over the checked-in README, HTML shell, and selected React user-facing surfaces. Keep historical/audit records outside the automated scan and require human review for new distribution copy.
**Why:** The audit found unsupported Oxford, accent, curriculum, privacy, age/outcome, and offline claims still present in the app shell and parent/sound surfaces. A narrow build guard catches their reintroduction while preserving explanatory historical records.
**Rejected:** Treating a regex guard as legal approval, scanning only README, deleting historical audit evidence, or allowing paused claims because they appear in comments or generated metadata without a reviewed owner decision.

### 2026-10-13 — Separate technical vendor assessment from vendor acceptance

**Decision:** Record E1.6 in `docs/plans/2026-10-13-e1-6-vendor-review.md` with one matrix for Clerk, Google Fonts, Cloudinary, OpenAI, Vercel hosting, and Sentry. Keep each configuration decision conditional until current contracts/DPAs, subprocessors, regions/transfers, retention/deletion, security, and owner sign-offs are attached.
**Why:** Source and deployment review establish where a service is referenced and what the app intends to send, but they cannot accept vendor terms or prove host logs, deletion, or production configuration. The inventory needs a repeatable evidence request and an explicit “do not accept” boundary.
**Rejected:** Treating package installation or an environment variable as vendor approval, treating a public URL as a cleared CDN dependency, or enabling Clerk Development mode/Sentry production DSN while privacy and data-flow decisions remain open.

### 2026-10-13 — Fail curriculum validation before content changes are approved

**Decision:** Add `npm run verify:curriculum` as a separate release-control command. It reports duplicate IDs, invalid levels, non-CVC shape, taught-letter prerequisite gaps, phoneme alignment, missing audio IDs, and missing local assets. Keep it out of the general build while the current findings (`at`, `bed`, `box`) require curriculum-owner decisions.
**Why:** E2.2 needs deterministic checks, but changing word classification or sequence without a curriculum/pronunciation owner would silently alter the learning programme. A failing report preserves the defect and blocks release without making an unreviewed content change.
**Rejected:** Moving/removing words to make the checker green, treating three-letter shape as educational approval, or suppressing the validator until rights and specialist review are complete.

### 2026-10-13 — Use a review-state curriculum manifest as the application boundary

**Decision:** Add `src/data/curriculumContent.ts` as the single application-facing adapter for ordered sound sets, prerequisites, phonemes, graphemes, VC/CVC word shapes, audio references, draft digraphs, reader-page extension points, review rules, content version, and intended scope. Keep the manifest at `review` status and leave the known `at`, `bed`, and `box` records unchanged.
**Why:** E2.1 needs a machine-readable content contract that can grow beyond the current screen-specific catalogue without silently turning repository data into educational or rights approval. A typed adapter allows the UI and progress service to consume one manifest while preserving the existing source records and release-blocking validation findings.
**Rejected:** Duplicating curriculum order in each screen, marking draft digraphs or empty reader pages as published, changing content merely to satisfy the validator, or treating a schema/status field as evidence of pronunciation, educational alignment, rights, or learning outcomes.

### 2026-10-13 — Version and explicitly map progress across content releases

**Decision:** Add `contentVersion` to local progress and Clerk export/sync, treat missing versions as `legacy-unversioned`, and map only stable progress fields through `migrateProgressContent`. Sanitization filters unknown level IDs while preserving known stars and exploration history; the helper accepts an explicit target for rollback tests.
**Why:** A versioned curriculum without a progress migration boundary can strand a child when levels are added, reordered, or retired. Stable progress must survive content changes, but future or removed curriculum IDs must not be trusted blindly.
**Rejected:** Assuming the storage-key suffix is the curriculum version, silently resetting progress on content updates, copying unknown snapshot fields into rollback targets, or treating migration as approval of the new curriculum.

### 2026-10-13 — Make media production evidence a release checklist

**Decision:** Use `docs/content-media-production-checklist.md` for every new or changed curriculum audio/video asset. Require rights-register linkage, source/generation records, human pronunciation review, loudness/silence checks, bundle/offline/runtime checks, manifest and content-version updates, and a rollback record.
**Why:** Generation scripts and local files prove only that an asset can be produced and loaded. They do not prove rights, pronunciation acceptance, child-safe content, acceptable media quality, offline behavior, or release recoverability.
**Rejected:** Treating a generated manifest, public URL, local playback, or vendor metadata as the complete release record; using a technical pass to imply rights or educational approval; and publishing media without a versioned rollback target.

### 2026-10-13 — Separate exploration from practice progression

**Decision:** Keep exploration counts for activity history but stop exploration taps from awarding new stars or unlocking levels. Route Sound Train blending and correct Bubble Pop/Feed Milo identification through aggregate practice evidence: one star after a correct attempt, two after a correct first attempt, and three after a later successful review. Preserve existing stars and migrate the evidence field with progress snapshots.
**Why:** E2.3 requires progression to reflect demonstrated practice rather than repeated tapping, while preserving the existing positive reward model and avoiding a destructive reset for current families. The counters are intentionally an observed-interaction signal, not a mastery or diagnostic claim.
**Rejected:** Awarding stars from every exploration tap, unlocking the next level after the final exploration card, downgrading existing stars, or presenting the thresholds as educational assessment.

### 2026-10-13 — Complete E0.7 checks without treating deployment findings as runtime approval

**Decision:** Run the production reset only in the disposable browser profile after explicit confirmation, use Chrome DevTools offline mode to induce the audio failure, export a sanitized network trace outside the repository, and record the serving-build metadata as observed. Keep E0.7 open while `/release.json` reports `channel: local` and the deployed Clerk instance reports Development mode.
**Why:** The requested checks now provide evidence for reset behavior, offline audio recovery, first-visit request volume, headers, and release identity without submitting credentials or child data. A passing fault-injection flow does not authorize production vendor configuration, and a matching commit is not sufficient when the channel field is wrong.
**Rejected:** Marking E0.7 complete from the UI pass alone, enabling Clerk production sync without vendor/privacy decisions, hiding the channel mismatch, or committing a HAR that may contain request metadata.

### 2026-10-13 — Derive release channel from the hosting environment

**Decision:** Keep `RELEASE_CHANNEL` as the explicit override, otherwise derive the release channel from Vercel’s `VERCEL_ENV`, with `ci` and `local` fallbacks. Add tests for production, preview, explicit override, CI, and local behavior.
**Why:** The live deployment had the correct version and commit but emitted `channel: local` because no explicit channel was configured. Deriving the channel at build time removes that deployment drift without making a local build appear production-like.
**Rejected:** Hardcoding `production`, removing the explicit override, or changing the already-serving deployment’s metadata without a new build and live verification.

### 2026-10-13 — Close the E0.7 release-channel mismatch after live verification

**Decision:** Close the `channel: local` deployment finding after pushing the typed Vercel-aware resolver and verifying that the live serving endpoint for `282ed50` returns `channel: production`. Keep the Clerk Development-mode and vendor/privacy findings open.
**Why:** The source fix was tested in isolation and the serving URL now identifies the intended production channel, so the release metadata evidence is complete for this deployment. The result does not authorize Clerk sync or imply vendor acceptance.
**Rejected:** Treating the simulated local build as live proof, closing E0.7 solely because the channel is correct, or changing Clerk configuration without the required owner decision.

### 2026-10-13 — Proxy Clerk production traffic through a server-only Vercel function

**Decision:** Supersede the technical production-mode portion of the earlier E0.7 decision. Keep the Vite client on the public `VITE_CLERK_PUBLISHABLE_KEY`, route production Clerk requests through same-origin `/__clerk` to `/api/clerk-proxy`, and provide the Clerk secret only as the Vercel Production `CLERK_SECRET_KEY`. The proxy forwards the Clerk asset request with `Clerk-Proxy-Url` and `Clerk-Secret-Key`; local `pk_test` development keeps Clerk’s direct behavior unless an explicit proxy URL is configured.
**Why:** A static Vite bundle cannot safely hold the Clerk secret, while Clerk production proxying requires server-side forwarding. The live deployment registered the Node.js 24 function, returned `200` for direct and rewritten Clerk asset paths, and opened the parent modal without a Development-mode indicator. The explicit `.js` ESM import is required by the deployed Node runtime.
**Rejected:** Shipping the secret in client environment variables or source control, relying on the SPA fallback for `/__clerk`, forcing the proxy for local development keys, or treating the technical proxy pass as vendor/DPA, retention, deletion, transfer, or parental-verification acceptance.
