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
