# 🦁 Milo Phonics (Ages 2–6)
*Pure British Sounds, Systematic Synthetic Phonics & The Sound Train for Little Learners*

A production-quality, audio-first early language and phonics learning application designed specifically for toddlers and early readers. Built with React 18, TypeScript, Tailwind CSS, Web Audio API, authentic Oxford Dictionary phonemes, OpenAI TTS (British RP `coral` voice), Cloudinary CDN audio backing, and mechanical agent governance via [`create-agent-room`](https://www.npmjs.com/package/create-agent-room).

Deployed on GitHub: [https://github.com/sipandey/milo-phonics.git](https://github.com/sipandey/milo-phonics.git)

---

## 🌟 Product Vision

> **"SEE → HEAR → TOUCH → REPEAT → PLAY → REMEMBER"**

The primary learning objective is developing **phonemic awareness, letter-sound association, blending skills, spoken language imitation, and vocabulary** naturally through play.

* **Never Depend on Text**: Toddlers aged 2–3 cannot read. All instructions, sounds, and positive feedback are communicated visually and through clear voice audio.
* **Fail-Safe Play**: No timers, no lives, no scores, no leaderboards, no failure screens, and no advertisements.
* **Tactile & Responsive**: Touch targets ≥ 88px with squash-and-stretch micro-animations, bubble pop sound effects, and attention spotlighting on every touch.
* **100% Client-Side Privacy**: Runs in the browser with LocalStorage progress tracking. Zero child data is collected or transmitted over the network (COPPA compliant).

---

## 🚀 Core Features

### 1. 🎙️ 100% Pre-Recorded Audio: Oxford-First & AI Cloudinary Pipeline (Zero Browser Speech)
* **Oxford Dictionary Human Audio Precedence**: All 26 letter phonemes (`/audio/phoneme_<letter>.mp3`) and sound catalog entries are authentic, studio-recorded British English from the Oxford Dictionary dataset.
* **Warm British AI Narration (`coral`)**: All 84 curriculum words, 38 CVC words, 38 story sentences, 26 letter names, 4 game prompts, and 6 praise cues are pre-recorded with OpenAI TTS using the gentle, articulate `coral` British voice at an unhurried 0.70x–0.75x toddler pace matching Oxford tone.
* **Cloudinary CDN + Local Static Caching**: Every audio asset is stored locally in `public/audio/` for instant zero-latency playback and backed by Cloudinary CDN URLs in [`src/data/cvcAudioManifest.ts`](src/data/cvcAudioManifest.ts) and [`src/data/generatedAudioManifest.ts`](src/data/generatedAudioManifest.ts).
* **Zero Browser `speechSynthesis`**: Completely removed native browser speech synthesis to eliminate robotic system voices, platform inconsistencies, and silent audio drops caused by mobile browser user-activation timeouts.

### 2. 🚂 The CVC Blending Sandbox ("Sound Train")
* **3-Carriage Elkonin Train**: Interactive steam locomotive with 3 wooden train carriages representing Consonant-Vowel-Consonant sound boxes.
* **Interactive Letter Replacer**: Tap any carriage to pop up candidate phonemes and build words like *S-A-T*, *C-A-T*, *B-A-G*, *P-I-N*, *F-O-X*, and *S-U-N*.
* **Snappy Sequential Blending (< 2.8s)**:
  * Carriages bounce sequentially in sync with pure Oxford phoneme sounds (/s/ ... /æ/ ... /t/).
  * Golden blending sparks ignite as the train rolls forward.
  * The crisp blended word (*"Sat!"*) sounds immediately with celebration confetti.
  * All audio trailing dead silence trimmed via `ffmpeg silenceremove` (83% faster!).
* **One-Tap Slow Story Sentence Card**: Reveals an illustrated sentence card (*"The cat sat on the mat."*) narrated at an unhurried storybook cadence without blocking subsequent toddler actions.

### 3. 🫧 "Which Sound Do You Hear?" (Bubble Pop Auditory Discrimination Game)
* **Active Listening-First Game Loop**: Built specifically for toddlers (24–36 months) to test and reinforce phonemic awareness through pure listening.
* **5-Round Micro-Sessions (~60–75s)**: Perfectly calibrated to toddler attention spans with 5 glowing, tactile progress dots.
* **Pure Oxford RP Audio & Replay**: Automatically sounds the isolated target phoneme (`phoneme.<letter>`) on round entry. Companion Milo cups his ear (`🐾👂`) with radiating amber sound waves to non-verbally guide listening, paired with a chunky 80×80px **[ 🔊 Hear Again ]** squircle button.
* **Cognitive-Load Safeguards**: Strictly **2 bubbles** on Level 1 (binary choice); 3 bubbles on Levels 2–7, preventing choice paralysis.
* **Zero-Shame Error Resilience**: Tapping a wrong bubble triggers a friendly cartoon wobble (`animate-wiggle`), gentle boing sfx, softly whispers the tapped letter sound, and re-prompts the target sound after 1.2s. **Zero penalties, zero star loss, zero negative red crosses.**
* **6-Second Inactivity Lifeline**: If no tap occurs for 6 seconds, the correct bubble emits a subtle, pulsing golden glow (`ring-8 ring-amber-400`), gently guiding the child without interrupting their autonomy.
* **Grand Micro-Celebration**: Crowned Milo (`👑`), confetti bursts, fanfare audio, and a **+5 Stars!** session summary payout with chunky "Play Again! 🔁" and "Go Home 🏠" buttons.

### 4. 🛡️ Toddler Impatience & Multi-Tap Pacing Protection
* **Non-Destructive Touch Absorber (`ListenRipple.tsx`)**: When impatient or excited toddlers tap rapidly while educational audio is speaking, screen taps are gently absorbed without stopping audio or triggering premature navigation.
* **Tactile Musical Particles**: Floating whimsical emojis (`🎵`, `🎶`, `✨`, `⭐`, `👂`) rise under the child's touch with a soft wooden bubble pop sound.
* **Visual Attention Spotlight**: Active Elkonin sound carriages or story cards receive a glowing golden focus ring, while surrounding UI controls dim, focusing toddler attention directly on the sound source.
* **600ms Hardware Debounce & "Your Turn" Unlock Pulse**: Prevents accidental double-taps while pulsing the next action button with a welcoming bounce once audio finishes.

### 5. 🔤 Full A–Z Alphabet Explorer (84 Curriculum Words)
* Full 26-letter interactive alphabet board featuring 84 illustrated child-friendly objects.
* Each letter card features an instant **🔊 sound button** and clickable phoneme pill, letting toddlers explore pure British phoneme sounds directly on the grid.
* Tapping a letter launches the deep-dive interactive Letter Detail Stage with object carousels and authentic Oxford phoneme-to-word blends.

### 6. 🗺️ Systematic Synthetic Phonics (SSP) Learning Path
* 7-Set progression aligned with UK National Curriculum / Letters & Sounds:
  * **Set 1**: S, A, T, P
  * **Set 2**: I, N, M, D
  * **Set 3**: G, O, C, K
  * **Set 4**: C, K, E, U, R
  * **Set 5**: H, B, F, L
  * **Set 6**: J, V, W, X
  * **Set 7**: Y, Z, Q
* Star reward tracking and automatic level unlocking as toddlers master sounds.

### 7. 🗣️ British English Sounds Chart (`Sounds 🇬🇧`)
* Comprehensive IPA sound reference organized by phonetic category:
  * **Consonants (25 sounds)**: /p/, /b/, /t/, /d/, /k/, /g/, /m/, /n/, etc.
  * **Vowels (14 sounds)**: /iː/, /ɪ/, /e/, /æ/, /ə/, /ʌ/, etc.
  * **Diphthongs (8 sounds)**: /eɪ/, /əʊ/, /aɪ/, /aʊ/, /ɔɪ/, etc.
* Tap any symbol to hear the pure Oxford phoneme; tap example words to hear native British pronunciation.

### 8. 🐵 Milo the Lion Companion
* Expressive animated character with real-time mouth movement synchronized with speech audio.
* Natural eye-blinking and squash-tap interaction (giggles and wiggles when tapped).

### 9. ⚙️ Parent Dashboard & Arithmetic Gate
* Accessible via a discreet gear icon protected by an adult math challenge (`a + b = ?`).
* Oxford-First & AI Cloudinary Pipeline monitor and interactive audio blend test buttons.
* Star progress breakdown across all 7 SSP sets with one-click progress reset.

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
├── public/audio/
│   ├── phoneme_<x>.mp3      # 26 Authentic Oxford Dictionary human recordings
│   ├── words/               # 84 Slow British AI words (Coral, 0.70x, trimmed)
│   ├── cvc/                 # 38 CVC blended words (Coral, 0.75x, trimmed)
│   ├── sentences/           # 38 Story sentences (Coral, 0.75x, trimmed)
│   ├── letters/             # 26 British letter names (Coral, 0.75x, trimmed)
│   ├── praise/              # 6 Gentle praise cues (Coral, 0.75x, trimmed)
│   └── prompts/             # 4 Game prompts (Coral, 0.75x, trimmed)
├── src/
│   ├── types/               # Strong typing for Letters, Audio, CVC, and Progress
│   ├── services/
│   │   ├── audioService.ts  # Web Audio SFX + Pre-recorded Oxford/AI Audio Engine
│   │   └── progressService.ts # LocalStorage progress persistence
│   ├── data/
│   │   ├── audioManifest.ts # Unified audio ID registry & Oxford precedence rules
│   │   ├── cvcWordsData.ts  # 38 CVC word definitions, phonemes, and sentences
│   │   ├── cvcAudioManifest.ts # Cloudinary CDN manifest for CVC words & sentences
│   │   ├── generatedAudioManifest.ts # Cloudinary CDN manifest for 120 AI voice assets
│   │   └── lettersData.ts   # Data-driven definitions for 26 letters & 84 objects
│   ├── components/
│   │   ├── common/          # Milo character, big buttons, parent gate, ListenRipple
│   │   ├── home/            # Home screen with big visual choices (2-1-2 layout)
│   │   ├── game/            # Bubble Pop auditory discrimination minigame
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
* Node.js v18+ (v20+ recommended)
* npm v9+
* (Optional for audio regeneration) `ffmpeg` and OpenAI / Cloudinary API keys in `.env`

### Installation
```bash
# Clone the repository
git clone https://github.com/sipandey/milo-phonics.git
cd milo-phonics

# Install dependencies
npm install
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

## 🗺️ Roadmap & Status

* [x] **Phase 1: Core Foundation & MVP**
  * Milo companion with live mouth animation & tactile micro-interactions.
  * Home screen, procedural Web Audio SFX, and Parent Arithmetic Gate.
* [x] **Phase 2: Curriculum Expansion & Sound Train**
  * Full 26-letter A–Z coverage with 84 illustrated objects.
  * Oxford Dictionary authentic human phoneme audio integration.
  * CVC Blending Sandbox ("Sound Train") with 38 CVC words & sentences.
  * Systematic Synthetic Phonics (SSP) 7-set learning progression & star tracking.
  * 100% pre-recorded British Coral AI audio with Cloudinary CDN backing.
  * Zero browser `speechSynthesis` policy enforcement.
  * Toddler impatience multi-tap pacing protection (`ListenRipple` & spotlight).
  * Audio trailing silence trimming via `ffmpeg silenceremove` (< 2.8s blending).
* [ ] **Phase 3: Extended Interactive Minigames**
  * [x] **"Which Sound Do You Hear?" (Bubble Pop)**: 5-round auditory discrimination minigame with pure Oxford RP phonemes, binary choices on Level 1, zero-shame wobble, ear-cupping listening Milo, 6s inactivity golden pulse, and celebration rewards.
  * [ ] "Feed Milo": Drag the initial-sound food items into Milo's basket.
  * [ ] Digraphs & Blends expansion (sh, ch, th, ck, ng, qu, ee, oo).
* [ ] **Phase 4: Multi-Environment Sound Safaris & Offline PWA**
  * Farm, Ocean, Forest, and Space Sound Safari worlds.
  * ServiceWorker PWA caching for full offline mobile app experience.
