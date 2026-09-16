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

### 2026-09-16 — Retaining unmanaged trailing silence in AI-generated TTS audio files

**What happened:** Sound Train blending took 12–14 seconds, and sequential phoneme/word playback felt sluggish and laggy to toddlers.
**Root cause:** OpenAI TTS endpoints append 1.5s to 3.5s of digital silence after spoken words. Awaiting the HTML `<audio>` `ended` event forced the app to wait through dead silence before initiating the next step or releasing UI locks (`cvc.sat.mp3` was 3.89s with only 0.5s of speech).
**Avoid:** Always run automated silence removal via `ffmpeg -af silenceremove=stop_periods=-1:stop_duration=0.1:stop_threshold=-45dB` on all TTS audio assets before bundling or uploading to CDN.

### 2026-09-16 — Coupling secondary story narration into the critical interaction path

**What happened:** In Sound Train, after blending /s/ - /æ/ - /t/ $\to$ "Sat!", the UI remained locked for an extra 5 seconds while automatically reciting the example sentence ("The cat sat on the mat."). Toddlers became impatient and tapped frantically.
**Root cause:** Coupling secondary educational enrichment (story sentence) into the synchronous critical path of the primary interaction (CVC word blending).
**Avoid:** Let the primary action finish and unlock promptly (~2.8s total). Offer secondary enrichment as an enticing, 1-tap interactive card that the child or parent can choose to explore on-demand.

### 2026-09-15 — Unconstrained multi-tap handling during toddler audio playback

**What happened:** Excited or impatient toddlers tapped buttons repeatedly, creating overlapping audio calls, broken promise chains, and skipped educational content.
**Root cause:** Missing touch interceptor and lack of centralized busy state tracking in the audio service during multi-step blending routines.
**Avoid:** Guard interactive views with non-destructive touch absorption (`<ListenRipple>`), a 600ms hardware debounce, and centralized `audioService.isBusyPlaying()` lifecycle synchronization.

### 2026-09-15 — SpeechSynthesis user gesture expiry after HTMLAudioElement playback

**What happened:** Calling `window.speechSynthesis.speak()` after awaiting an `HTMLAudioElement` (`audio.play()`) resulted in complete silence on Chrome and Safari with no error thrown.
**Root cause:** Modern browsers enforce transient user activation (gesture tokens). While the initial user touch unlocks audio, the 1–2 second delay of playing the first audio file causes the user gesture window to expire. Browsers silently drop subsequent `SpeechSynthesis` requests that occur outside the immediate event loop turn of a user touch.
**Avoid:** Bundle sequenced audio pairs (such as phoneme $\to$ word blends) as static local audio files (`new Audio(url)`) or Web Audio buffers. Do not mix asynchronous promises between HTMLAudio and SpeechSynthesis.

### 2026-09-14 — CommonJS hooks in ES module project

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
