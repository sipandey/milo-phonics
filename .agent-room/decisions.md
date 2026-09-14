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

### 2026-09-14 — Integrate create-agent-room for engineering governance

**Decision:** Scaffolding full `create-agent-room` profile with Claude, Cursor, and Git adapters, plus testing, security, and release skill packs.
**Why:** Establishes mechanical agent governance, stop-hooks, guardrail checks, pre-commit validation, and structured decision tracking directly within the phonics project.
**Rejected:** Ad-hoc unversioned rules or unvalidated agent prompts.

### 2026-09-14 — Phonics App Toddler-First Client-Side Architecture

**Decision:** Built using React 18, Vite, TypeScript, Tailwind CSS with procedural Web Audio SFX and toddler-calibrated SpeechSynthesis API.
**Why:** Zero latency on touches, 100% offline functionality, full COPPA compliance (no toddler data leaves device), and procedural audio synthesis eliminating missing audio asset failures.
**Rejected:** Server-side streaming audio or heavy external audio asset CDNs that cause buffering delays for toddlers.
