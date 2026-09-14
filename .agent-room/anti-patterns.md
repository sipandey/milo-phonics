# Anti-Patterns Log — phonics

Negative knowledge: things that have already gone wrong here, so nobody
(human or agent) repeats them. One avoided bug is worth more than one
polished example — keep entries short and concrete.

Append a new entry every time:
- a bug slips through and you find the root cause,
- an approach seemed reasonable but turned out wrong,
- a fix gets reverted because it only patched a symptom.

## Format

```
### YYYY-MM-DD — short title

**What happened:** one or two sentences.
**Root cause:** the actual cause, not the symptom.
**Avoid:** the concrete rule that would have prevented it.
```

<!-- Entries go below this line, newest first. -->

### 2026-09-14 — Root type module breaking CommonJS agent hooks

**What happened:** Git pre-commit hook running `.agent-room/hooks/guardrails-check.js` crashed with `ReferenceError: require is not defined in ES module scope`.
**Root cause:** The root `package.json` declared `"type": "module"`, causing Node.js to interpret all `.js` files in subdirectories as ES modules, breaking CommonJS `require()` calls in hooks.
**Avoid:** Add a scoped `{"type": "commonjs"}` `package.json` inside `.agent-room/hooks/` so hook scripts execute as CommonJS without altering root ESM configuration.

### 2026-09-14 — Unmanaged SpeechSynthesis on rapid toddler interaction

**What happened:** Rapid tapping on toddler interactive elements caused speech synthesis audio to glitch, cut off mid-phoneme, or overlap incoherently.
**Root cause:** Invoking `window.speechSynthesis.speak()` directly without cancelling previous pending utterances or debouncing creates browser audio buffer collisions.
**Avoid:** Route all speech through a centralized `audioService` that invokes `speechSynthesis.cancel()`, coordinates start/end event listeners for mouth animations, and provides procedural Web Audio fallback.

### 2026-09-14 — Unverified git committer identity across tools

**What happened:** Fresh repository initialization or tool switches can silently inherit incorrect global git author credentials.
**Root cause:** Relying on global git configuration rather than repo-level explicit identity.
**Avoid:** Always run `git config user.name "Siddharth Pandey"` and `git config user.email "siddharth.pandey06@gmail.com"` immediately before every commit and verify with `git log -1 --format='%an <%ae>'`.
