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
