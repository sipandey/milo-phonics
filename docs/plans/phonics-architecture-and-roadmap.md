# Phonics App Architecture & Technical Roadmap

## Architecture Overview

The application follows a clean, decoupled 4-layer architecture:

```text
┌─────────────────────────────────────────────────────────┐
│                       UI Layer                          │
│  HomeScreen | LetsPlayScreen | LetterScreens | Parent   │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│                      Game Layer                         │
│  Surprise Loop | Repeat Mechanics | Tactile Affordances │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│                    Learning Layer                       │
│  ProgressService | LocalStorage Persistence | Metrics   │
└────────────────────────────┬────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────┐
│             Content & Audio Abstraction Layer           │
│  lettersData.ts | audioService.ts (Web Audio + Speech)  │
└─────────────────────────────────────────────────────────┘
```

---

## 1. Content Layer
* **Data-driven**: Adding a new letter requires appending to `src/data/lettersData.ts`. No UI component refactoring is required.
* **Asset Decoupling**: Visuals use vector emojis and scalable SVGs, eliminating bulky static image pipelines.
* **Audio Synthesis**: Procedural Web Audio API sound synthesis eliminates asset fetching errors and allows 100% offline playback.

## 2. Learning & Adaptive Layer
* Current Phase: Tracks interactions per letter, per object, total taps, and session timestamps in `progressService.ts`.
* Phase 3 Expansion: Implements weighted letter exposure where sounds with lower exploration counts or incorrect mini-game matches are surfaced more frequently in "Let's Play" and "Sound Train".

## 3. Toddler-First Design Constraints
1. **Target Dimensions**: All primary buttons are ≥ 88px × 88px (`min-h-[88px]` or `w-64 h-64`).
2. **Visual Affordance**: Thick borders (4px to 8px), rounded corners (`rounded-3xl` to `rounded-5xl`), and 3D offset drop shadows (`shadow-[0_8px_0_#D97706]`).
3. **No Failure Modes**: Tapping anything triggers an active, positive response.

---

## Multi-Phase Roadmap

### Phase 1 (Completed)
- [x] Home Screen with primary visual tiles
- [x] Animated companion character (Milo) with mouth-speech synchronization
- [x] "Let's Play" surprise discovery loop
- [x] 3 letters: M, S, A with 5 objects each (15 objects total)
- [x] Procedural Web Audio SFX engine + toddler SpeechSynthesis
- [x] LocalStorage progress persistence
- [x] Arithmetic Parent Gate & Parent Dashboard
- [x] Integration with `create-agent-room` for mechanical agent governance

### Phase 2 (Next Up)
- [ ] Remaining 7 initial letters: **T, P, B, D, C, F, R**
- [ ] Sound Safari: Farm environment (Cow 🐄, Pig 🐷, Chicken 🐔, Sheep 🐑, Tractor 🚜, Horse 🐴)
- [ ] Mini-Game A: "Find the Sound" (3 visual choices with gentle guidance)
- [ ] Mini-Game B: "Pop the Letter" (floating letter bubbles)

### Phase 3
- [ ] Mini-Game C: "Feed the Monster"
- [ ] Mini-Game D: "Sound Train"
- [ ] Interactive Story: "Milo's Sound Adventure" (1–3 minute interactive narrative)
- [ ] Adaptive frequency learning model

### Phase 4
- [ ] Additional Sound Safari environments (Zoo, Ocean, Space, Kitchen)
- [ ] Microphone / speech imitation option with explicit parent permission
- [ ] Extended parent learning journey insights
