# 🦁 Milo Phonics
*Audio-led early phonics exploration and simple word blending*

An interactive, audio-led app with a fixed sequence of introductory letter–sound activities and simple word-blending practice. The repository is a React/TypeScript prototype and engineering beta foundation. See the [current product and architecture record](docs/plans/current-product-and-architecture.md) for verified implementation facts and the [pre-marketing audit](docs/audits/pre-marketing-content-rights-privacy-audit-2026-10-13.md) for claims that remain on hold.

Deployed on GitHub: [https://github.com/sipandey/milo-phonics.git](https://github.com/sipandey/milo-phonics.git)

---

## 🌟 Product Vision

> **"SEE → HEAR → TOUCH → REPEAT → PLAY → REMEMBER"**

The implemented experience provides audio-led letter–sound exploration and simple word-blending practice through play. It is not a complete or independently reviewed synthetic-phonics programme, diagnostic assessment, or reading-outcome product.

* **Audio-led interaction**: Core child interactions use visual and voice cues rather than written instructions.
* **Fail-Safe Play**: No timers, no lives, no scores, no leaderboards, no failure screens, and no advertisements.
* **Tactile & Responsive**: Touch targets ≥ 88px with squash-and-stretch micro-animations, bubble pop sound effects, and attention spotlighting on every touch.
* **Local progress by default**: Core progress is stored in browser LocalStorage. Optional parent-account sync and third-party services are present in the repository and require the privacy/data-flow review described in the audit.
* **Audio disclosure**: Some bundled curriculum voice audio was generated with OpenAI TTS. The parent dashboard identifies the bundled-local runtime; phoneme-source provenance, generation records, and vendor terms remain under review.

---

## 🚀 Core Features

### 1. 🎙️ Local-First Pre-Recorded Audio (No Browser Speech)
* **Semantic audio IDs**: Components request IDs such as `phoneme.s` and `word.monkey`; `src/data/audioManifest.ts` resolves them to runtime assets.
* **Bundled local playback**: The browser selects local files in `public/audio/` first for pre-recorded voice audio and uses Web Audio for procedural sound effects.
* **Generation metadata**: [`src/data/generatedAudioManifest.ts`](src/data/generatedAudioManifest.ts) retains Cloudinary URLs and generation metadata, but the current browser resolver does not implement an on-error Cloudinary fallback.
* **No native speech fallback**: The browser does not call OpenAI or native `speechSynthesis`. Audio provenance, disclosure, and public naming remain subject to the audit’s rights and review gates.

### 2. 🚂 The CVC Blending Sandbox ("Sound Train")
* **3-Carriage Elkonin Train**: Interactive steam locomotive with 3 wooden train carriages representing Consonant-Vowel-Consonant sound boxes.
* **Interactive Letter Replacer**: Tap any carriage to pop up candidate phonemes and build words like *S-A-T*, *C-A-T*, *B-A-G*, *P-I-N*, *F-O-X*, and *S-U-N*.
* **Snappy Sequential Blending (< 2.8s)**:
  * Carriages bounce sequentially in sync with configured phoneme audio (/s/ ... /æ/ ... /t/).
  * Golden blending sparks ignite as the train rolls forward.
  * The crisp blended word (*"Sat!"*) sounds immediately with celebration confetti.
  * All audio trailing dead silence trimmed via `ffmpeg silenceremove` (83% faster!).
* **One-Tap Slow Story Sentence Card**: Reveals an illustrated sentence card (*"The cat sat on the mat."*) narrated at an unhurried storybook cadence without blocking subsequent actions.

### 3. 🫧 "Which Sound Do You Hear?" (Bubble Pop Auditory Discrimination Game)
* **Active Listening-First Game Loop**: Uses short, audio-led rounds to practise phoneme discrimination through listening.
* **5-Round Micro-Sessions (~60–75s)**: Provides five glowing, tactile progress dots for a short repeatable session.
* **Configured Audio & Replay**: Automatically sounds the isolated target phoneme (`phoneme.<letter>`) on round entry. Companion Milo cups his ear (`🐾👂`) with radiating amber sound waves to non-verbally guide listening, paired with a chunky 80×80px **[ 🔊 Hear Again ]** squircle button.
* **Cognitive-Load Safeguards**: Strictly **2 bubbles** on Level 1 (binary choice); 3 bubbles on Levels 2–7, preventing choice paralysis.
* **Zero-Shame Error Resilience**: Tapping a wrong bubble triggers a friendly cartoon wobble (`animate-wiggle`), gentle boing sfx, softly whispers the tapped letter sound, and re-prompts the target sound after 1.2s. **Zero penalties, zero star loss, zero negative red crosses.**
* **6-Second Inactivity Lifeline**: If no tap occurs for 6 seconds, the correct bubble emits a subtle, pulsing golden glow (`ring-8 ring-amber-400`), gently guiding the child without interrupting their autonomy.
* **Grand Micro-Celebration**: Crowned Milo (`👑`), confetti bursts, fanfare audio, and a **+5 Stars!** session summary payout with chunky "Play Again! 🔁" and "Go Home 🏠" buttons.

### 4. 🍖 "Feed Milo!" (Initial-Sound Feeding Minigame & 3D Video Companion)
* **Initial-Sound Association Loop**: Milo is hungry! Milo asks for foods that begin with a configured phoneme sound (e.g., *"Milo wants food starting with /m/!"*).
* **Dual Interaction Affordance (Drag OR Tap)**: Children can drag-and-drop food plates into Milo's mouth or tap any food plate to trigger an arc swoop animation flying directly into Milo's belly. This accommodates different fine motor abilities.
* **3D Squircle Video Companion (`MiloVideoCompanion.tsx`)**: Displays an animated 3D video character (`milo_hungry_pose.mp4`) center-cropped in a 1:1 squircle frame (`aspect-square object-cover object-center`), featuring live mouth animations, dynamic state switching, hover drop indicators (`😋`), and graceful fallback to the SVG companion.
* **Procedural Chewing & Celebration**: Correct foods trigger procedural chewing/crunching and slurping sound effects (`audioService.playSfx('crunch')` / `'slurp'`), hearty giggles, +1 star, and radiant golden food halos.
* **Cognitive Safeguards & Lifeline**: Strictly **2 plates** for Level 1; 3 plates for Levels 2–7. Incorrect drops trigger a zero-shame cartoon wobble (`boing` sfx + gentle re-prompt); a 6-second inactivity lifeline pulses the target plate with a golden glow.
* **Chef Milo Micro-Celebration**: Completing 5 rounds triggers celebratory fanfare, a Chef Milo badge (`🧑‍🍳`), and a **+5 Stars!** payout modal.

### 5. 🎯 Focus Mode & Anti-Deadlock Audio Architecture
* **Single-Action Auto-Advancing Loop**: Strips away extraneous stepping-stone tabs, level-map pills, and manual "Next" buttons, providing a single, massive tactile Hero Card. Tapping triggers the configured phoneme blend, celebration chime, and automatically advances after a 1.2s golden pause.
* **Persistent Progress Resume**: Automatically tracks and restores both `lastLetter` and `lastObjectIndex`. Opening "Let's Play!" immediately resumes on the child's exact active card rather than resetting to Set 1.
* **Continuous Auditory Repetition**: Plays the configured sound every 5.5s with a gentle card wiggle until the child taps the card, cancelling immediately upon tap to celebrate.
* **Anti-Deadlock Audio Architecture (`audioService.ts`)**:
  * **Safe Resolver Unblocking**: Tracking active resolvers (`currentAudioResolve`) ensures that when `stopVoice()` pauses an HTMLAudioElement, awaiting Promises resolve immediately instead of hanging on omitted `'ended'` events.
  * **Concurrency Tokens (`currentBlendToken`)**: Multi-step blend routines discard stale asynchronous steps upon interruption, eliminating race conditions over busy state.
  * **Fail-Safe Watchdog Pacing**: 5.5s audio watchdog in `AudioService` and 4.5s card watchdog in `LetsPlayScreen` guarantee auto-advance and state cleanup even during browser audio pipeline stalls.
* **Non-Blocking Touch Experience (`ListenRipple.tsx`)**: Replaced pointer-trapping overlays with `pointer-events-none z-20`, rendering ambient musical notes without intercepting, delaying, or swallowing toddler taps.

### 6. 🔤 Full A–Z Alphabet Explorer (84 Configured Words)
* Full 26-letter interactive alphabet board featuring 84 illustrated child-friendly objects.
* Each letter card features an instant **🔊 sound button** and clickable phoneme pill, letting children explore configured phoneme sounds directly on the grid.
* Tapping a letter launches the deep-dive interactive Letter Detail Stage with object carousels and configured phoneme-to-word blends.

### 7. 🗺️ Fixed Letter-Set Learning Path
* Seven configured letter groups in the current curriculum data:
  * **Set 1**: S, A, T, P
  * **Set 2**: I, N, M, D
  * **Set 3**: G, O, C, K
  * **Set 4**: C, K, E, U, R
  * **Set 5**: H, B, F, L
  * **Set 6**: J, V, W, X
  * **Set 7**: Y, Z, Q
* Star reward tracking and automatic level unlocking based on the current application rules. This is not evidence of an independently reviewed SSP programme.

### 8. 🗣️ Sounds Chart (`Sounds`)
* Comprehensive IPA sound reference organized by phonetic category:
  * **Consonants (25 sounds)**: /p/, /b/, /t/, /d/, /k/, /g/, /m/, /n/, etc.
  * **Vowels (14 sounds)**: /iː/, /ɪ/, /e/, /æ/, /ə/, /ʌ/, etc.
  * **Diphthongs (8 sounds)**: /eɪ/, /əʊ/, /aɪ/, /aʊ/, /ɔɪ/, etc.
* Tap a symbol to hear its configured pre-recorded phoneme asset; tap example words to hear their configured word audio.

### 9. 🐵 Milo the Lion Companion
* Expressive animated character with real-time mouth movement synchronized with speech audio.
* Natural eye-blinking and squash-tap interaction (giggles and wiggles when tapped).

### 10. ⚙️ Parent Dashboard & Arithmetic Gate
* Accessible via a discreet gear icon protected by an adult math challenge (`a + b = ?`).
* Local audio pipeline monitor and interactive audio blend test buttons.
* Star progress breakdown across all 7 configured letter groups with one-click progress reset.

---

## 🛠️ Tech Stack & Architecture

```text
phonics/
├── .agent-room/             # Mechanical Agent Governance & playbooks
│   ├── decisions.md         # Architecture decisions log
│   ├── anti-patterns.md     # Negative knowledge & bug avoidance log
│   ├── guardrails.json      # Path protection & secret rules
│   ├── hooks/               # Pre-commit & close-the-loop stop hooks
│   └── sessions/            # Detailed session logs
├── scripts/
│   ├── generate-audio.ts    # OpenAI TTS batch generator for curriculum words
│   ├── generate-cvc-audio.ts# OpenAI TTS batch generator for CVC words & sentences
│   └── optimize-and-sync-audio.ts # FFmpeg silence trimmer & Cloudinary sync pipeline
├── public/
│   ├── audio/
│   │   ├── phoneme_<x>.mp3  # 26 local phoneme assets (provenance review pending)
│   │   ├── words/           # 84 generated voice words (trimmed)
│   │   ├── cvc/             # 38 CVC blended words (Coral, 0.75x, trimmed)
│   │   ├── sentences/       # 38 Story sentences (Coral, 0.75x, trimmed)
│   │   ├── letters/         # 26 generated voice letter names (trimmed)
│   │   ├── praise/          # 6 Gentle praise cues (Coral, 0.75x, trimmed)
│   │   └── prompts/         # 4 Game prompts (Coral, 0.75x, trimmed)
│   └── video/
│       └── milo/            # 3D Milo video companion clips (H.264 MP4)
├── src/
│   ├── types/               # Strong typing for Letters, Audio, CVC, and Progress
│   ├── services/
│   │   ├── audioService.ts  # Web Audio SFX + pre-recorded local audio engine
│   │   └── progressService.ts # LocalStorage progress persistence
│   ├── data/
│   │   ├── audioManifest.ts # Unified audio ID registry & local-first resolution rules
│   │   ├── cvcWordsData.ts  # 38 CVC word definitions, phonemes, and sentences
│   │   ├── cvcAudioManifest.ts # CVC word/sentence audio metadata
│   │   ├── generatedAudioManifest.ts # Generated audio metadata and optional local paths
│   │   └── lettersData.ts   # Data-driven definitions for 26 letters & 84 objects
│   ├── components/
│   │   ├── common/          # Milo character, MiloVideoCompanion, buttons, gate, ListenRipple
│   │   ├── home/            # Symmetrical 2x3 home screen grid
│   │   ├── game/            # Bubble Pop & Feed Milo minigames
│   │   ├── play/            # Guided discovery loop (Let's Play)
│   │   ├── letter/          # Letter explorer and detail stages
│   │   ├── train/           # Sound Train CVC Blending Sandbox
│   │   └── parent/          # Parent dashboard & audio pipeline monitor
│   ├── App.tsx              # State & route coordinator
│   └── main.tsx             # Application entry point
└── package.json
```

---

## 💻 Getting Started

### Prerequisites
* Node.js 24.x LTS
* npm 11.x (bundled with the supported Node.js line)
* (Optional for audio regeneration) `ffmpeg` and OpenAI / Cloudinary API keys in `.env`
* (Optional monitoring) Sentry deployment variables described in [`docs/sentry.md`](docs/sentry.md)

### Installation
```bash
# Clone the repository
git clone https://github.com/sipandey/milo-phonics.git
cd milo-phonics

# If you use nvm, select the repository's Node.js version
nvm install
nvm use

# Confirm the supported runtime before installing
node --version  # v24.x
npm --version   # 11.x

# Install exactly from package-lock.json
npm ci
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 🛡️ Agent Room Governance

This repository enforces engineering discipline with [`create-agent-room`](https://www.npmjs.com/package/create-agent-room):

```bash
# Validate agent-room structure and skills
npm run agent-room:validate

# Check agent-room health & hook status
npm run agent-room:doctor

# View agent activity and session metrics
npm run agent-room:metrics
```

---

## 🚢 Releases and Rollback

The versioned release process, serving-build identity check, changelog, and five-minute rollback procedure are documented in [`docs/releases-and-rollback.md`](docs/releases-and-rollback.md). A Vite build emits `dist/release.json`; E0.5 establishes this process but does not authorize a production tag while the audit and security gates remain open.

---

## 🗺️ Roadmap & Status

* [x] **Phase 1: Core Foundation & MVP**
  * Milo companion with live mouth animation & tactile micro-interactions.
  * Home screen, procedural Web Audio SFX, and Parent Arithmetic Gate.
* [x] **Phase 2: Curriculum Expansion & Sound Train**
  * Full 26-letter A–Z coverage with 84 illustrated objects.
  * Configured local phoneme audio assets and semantic audio resolution.
  * CVC Blending Sandbox ("Sound Train") with 38 CVC words & sentences.
  * Seven configured letter groups and star tracking.
  * Pre-recorded generated voice audio with local bundle paths and Cloudinary generation metadata.
  * Zero browser `speechSynthesis` policy enforcement.
  * Toddler impatience multi-tap pacing protection (`ListenRipple` & spotlight).
  * Audio trailing silence trimming via `ffmpeg silenceremove` (< 2.8s blending).
* [ ] **Phase 3: Extended Interactive Minigames**
  * [x] **"Which Sound Do You Hear?" (Bubble Pop)**: 5-round auditory discrimination minigame with configured phoneme audio, binary choices on Level 1, zero-shame wobble, ear-cupping listening Milo, 6s inactivity golden pulse, and celebration rewards.
  * [x] **"Feed Milo!" (Initial-Sound Feeding Minigame & 3D Video Companion)**: 5-round sorting minigame with dual feeding affordance (drag or tap), center-cropped 3D video companion (`milo_hungry_pose.mp4`), procedural crunch/slurp sfx, configured phoneme prompts, 6s golden shimmer lifeline, and Chef Milo celebration.
  * [ ] Digraphs & Blends expansion (sh, ch, th, ck, ng, qu, ee, oo).
* [ ] **Phase 4: Multi-Environment Sound Safaris & Offline PWA**
  * Farm, Ocean, Forest, and Space Sound Safari worlds.
  * ServiceWorker PWA caching for full offline mobile app experience.

> Roadmap note: this checklist is a feature inventory. For current implementation status and approved wording, use the [current product and architecture record](docs/plans/current-product-and-architecture.md).
