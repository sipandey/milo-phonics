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

### 2026-09-15 — Oxford Dictionary British Audio & Local Static Word Bundling

**Decision:** Sourced authentic human British English recordings for all 47 phonemes from the Oxford Dictionary dataset (`xiaozhah/phoneme_audio`) as static files (`/audio/phoneme_<letter>.mp3`). Generated all 84 curriculum words using OpenAI TTS (voice: `coral`, speed: `0.70`) bundled directly into `public/audio/words/`. Expanded curriculum from 3 to all 26 letters with in-place sound buttons.
**Why:** Synthetic AI models struggle with pure isolated phonemes without letter-name contamination. Browser `SpeechSynthesis` silently fails or drops audio when called asynchronously after audio elements due to user-activation expiry and missing British OS voice packs. 100% local static MP3 files guarantee zero latency, zero API costs, zero CORS/proxy issues, and 100% offline reliability across all platforms.
**Rejected:** Remote Cloudinary streaming (blocked by local proxy/CORS), browser SpeechSynthesis for words (silent drops in Chrome/Safari), and synthetic formant phoneme approximation.

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
