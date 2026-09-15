# 🦁 Milo Phonics (Ages 2–6)
*Pure British Sounds & Systematic Synthetic Phonics for Little Learners*

A production-quality, audio-first early language and phonics learning application designed specifically for toddlers aged 2–3 years old. Built with React 18, TypeScript, Tailwind CSS, Web Audio API, and mechanical agent governance via [`create-agent-room`](https://www.npmjs.com/package/create-agent-room).

---

## 🌟 Product Vision

> **"SEE → HEAR → TOUCH → REPEAT → PLAY → REMEMBER"**

The primary learning objective is developing **phonemic awareness, letter-sound association, spoken language imitation, and vocabulary** naturally through play.

* **Never Depend on Text**: Toddlers aged 2–3 cannot read. All instructions and feedback are communicated visually and through voice audio.
* **Fail-Safe Play**: No timers, no lives, no scores, no leaderboards, no failure screens, and no advertisements.
* **Tactile Feedback**: Touch targets ≥ 88px with squash-and-stretch micro-animations and zero-latency sound effects on every touch.
* **100% Client-Side Privacy**: Runs completely in the browser with LocalStorage progress tracking. Zero child data is collected or transmitted over the network (COPPA compliant).

---

## 🚀 Core Features

### 1. 🇬🇧 Authentic Oxford Dictionary British Phonics Audio
* **Human-Recorded British English**: All 47 phonemes sourced directly from the Oxford Dictionary pronunciation dataset (`/audio/phoneme_<letter>.mp3`).
* **Pedagogical Blend Sequence**: Object interactions speak the authentic Oxford phoneme sound first, pause 280ms, then speak the word slowly in British English (*"/m/... Monkey!"*).
* **100% Local Static Bundling**: All phoneme and word audio files are served locally from `public/audio/` for instant zero-latency playback with zero network dropouts.

### 2. 🔤 26-Letter Alphabet Explorer with In-Place Sound Buttons
* Full A through Z alphabet board featuring 84 interactive child-friendly objects.
* Each letter card features an instant **🔊 sound button** and clickable phoneme pill, letting toddlers tap and explore pure British phoneme sounds directly on the grid.
* Tapping a tile transitions smoothly to the deep-dive interactive Letter Detail Stage.

### 3. 🗣️ British English Sounds Chart (`Sounds 🇬🇧`)
* Dedicated sound chart organized by phonetic categories:
  * **Consonants (25 sounds)**: /p/, /b/, /t/, /d/, /k/, /g/, /m/, /n/, etc.
  * **Vowels (14 sounds)**: /iː/, /ɪ/, /e/, /æ/, /ə/, /ʌ/, etc.
  * **Diphthongs (8 sounds)**: /eɪ/, /əʊ/, /aɪ/, /aʊ/, /ɔɪ/, etc.
* Dual playback: tap any phonetic symbol to hear the pure isolated phoneme; tap any example word to hear native pronunciation.

### 4. 🦁 "Let's Play" Guided Surprise Loop
* Guided exploration through random objects and letters with tactile celebration, cartoon pops, and sound effects.
* Toddlers can tap the active object, letter badge, or companion Milo as many times as they want without being forced to progress.

### 5. 🐵 Milo the Lion Companion
* Expressive animated character with real-time mouth movement synchronized with speech audio.
* Natural eye-blinking and squash-tap interaction (giggles and wiggles when tapped).

### 6. 🛡️ Parent Mode & Arithmetic Gate
* Accessible via a discreet gear icon, protected by a simple adult math challenge (`a + b = ?`).
* Non-academic play observations (*"Total Play Taps: 42"*, *"Letter M explored 12 times"*).
* Voice speed adjustments, audio tester, and progress reset.

---

## 🛠️ Tech Stack & Architecture

```text
phonics/
├── .agent-room/             # Mechanical Agent Governance & playbooks
│   ├── decisions.md         # Architecture decisions log
│   ├── anti-patterns.md     # Negative knowledge & bug avoidance log
│   ├── guardrails.json      # Path protection & secret rules
│   ├── hooks/               # Pre-commit & close-the-loop stop hooks
│   └── skills/              # TDD, debugging, verification, and testing skills
├── docs/plans/              # Architectural plans & multi-phase roadmap
├── src/
│   ├── types/               # Strong typing for Letters, PhonicsObjects, and Audio
│   ├── services/
│   │   ├── audioService.ts  # Web Audio synth + SpeechSynthesis abstraction
│   │   └── progressService.ts # LocalStorage progress persistence
│   ├── data/
│   │   └── lettersData.ts   # Data-driven definitions for letters and objects
│   ├── components/
│   │   ├── common/          # Milo character, big buttons, parent gate, particles
│   │   ├── home/            # Home screen with big visual choices
│   │   ├── play/            # Guided discovery loop (Let's Play)
│   │   ├── letter/          # Letter explorer and detail stages
│   │   └── parent/          # Parent dashboard & audio settings
│   ├── App.tsx              # State & route coordinator
│   └── main.tsx             # Entry point
└── package.json
```

---

## 💻 Getting Started

### Prerequisites
* Node.js v18+ (v20+ recommended)
* npm v9+

### Installation
```bash
# Clone the repository and install dependencies
git clone <repo-url>
cd phonics
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

## 🗺️ Roadmap

* **Phase 1 (Completed)**: Core MVP, Home, Milo companion, Let's Play loop, Letters M, S, A with 15 objects, procedural audio engine, and Parent Gate/Dashboard.
* **Phase 2**: Introduce remaining 7 letters (**T, P, B, D, C, F, R**), Sound Safari Farm environment (Cow, Pig, Chicken, Sheep, Tractor, Horse), and mini-games ("Find the Sound", "Pop the Letter").
* **Phase 3**: Mini-game "Feed the Monster", "Sound Train", "Milo's Sound Adventure" interactive story, and adaptive frequency exposure.
* **Phase 4**: Multi-environment Sound Safari (Ocean, Zoo, Space), content customization, and enhanced parent analytics.
