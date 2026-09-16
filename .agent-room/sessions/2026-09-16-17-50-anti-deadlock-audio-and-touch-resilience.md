# Session Log: Anti-Deadlock Audio Promise Architecture & Touch Resilience

**Date:** 2026-09-16 17:50
**Agent:** Antigravity (Advanced Agentic Pair Programmer)
**Classification:** Bug & Architecture / Audio Engineering

## Goal
Reproduce, diagnose, and resolve the issue where rapid multi-clicks on cards while speech is playing cause the app to freeze with all subsequent click interactions disabled, establishing fail-safe promise resolution and non-blocking touch architecture.

## Files touched
- Read:
  - `src/services/audioService.ts`
  - `src/components/common/ListenRipple.tsx`
  - `src/components/play/LetsPlayScreen.tsx`
  - `src/components/game/FeedMiloScreen.tsx`
  - `src/components/train/SoundTrainScreen.tsx`
  - `.agent-room/coordination/session-log-format.md`
  - `.agent-room/coordination/handoff-protocol.md`
  - `.agent-room/decisions.md`
  - `.agent-room/anti-patterns.md`
- Created:
  - `.agent-room/sessions/2026-09-16-17-50-anti-deadlock-audio-and-touch-resilience.md`
- Modified:
  - `src/services/audioService.ts` (added `currentAudioResolve`, `currentAudioTimeout`, `currentBlendToken`, safe resolver unblocking, and watchdog)
  - `src/components/common/ListenRipple.tsx` (de-weaponized overlay to `pointer-events-none z-20`, removed event interception)
  - `src/components/play/LetsPlayScreen.tsx` (wrapped tap handler in try-finally with 4.5s watchdog, guarded Milo tap)
  - `README.md` (updated architecture and pacing documentation)
  - `.agent-room/decisions.md` (recorded architectural decision)
  - `.agent-room/anti-patterns.md` (recorded anti-patterns for pause event omission and touch-blocking overlays)

## Actions taken
1. **Root Cause Analysis**:
   - Discovered that HTML5 `audio.pause()` does **not** dispatch `'ended'` or `'error'` events.
   - Identified that `playRemoteVoice` returned a Promise resolving only inside those event listeners; interrupting an active speech call via `stopVoice()` paused the audio element and leaked a hung Promise.
   - Traced the async dependency chain: `playPhonemeWordBlend` suspended indefinitely at `await playVoice`, preventing its `finally { this.setBusy(false); }` block from executing.
   - Traced UI consequences: in `LetsPlayScreen`, auto-advance was placed after the await, so `advanceToNext()` never ran, keeping `hasTappedCardRef.current = true` and the card permanently disabled.
   - Uncovered that `<ListenRipple>` was mounted at `z-40` with `cursor-wait select-none touch-none` and `e.stopPropagation()`. With `isAudioBusy` stuck at `true`, this overlay covered the entire viewport, intercepting and discarding all clicks across the app.
2. **Audio Promise & Concurrency Overhaul (`audioService.ts`)**:
   - Added `currentAudioResolve: (() => void) | null = null`. Calling `stopRemoteAudio()` or starting a new sound immediately invokes and clears the previous resolver, ensuring no Promise leaks.
   - Added a 5.5s fail-safe watchdog timer inside `playRemoteVoice` to guarantee resolution even during browser audio delays.
   - Added `currentBlendToken: number = 0` to track multi-step sequences (`playPhonemeWordBlend`, `playSequentialBlend`). Interruptions increment the token, aborting stale async steps cleanly without competing over `isBusy` state.
3. **De-Weaponizing Interaction Overlays (`ListenRipple.tsx`)**:
   - Replaced pointer-trapping container with `pointer-events-none z-20 select-none overflow-hidden`.
   - Stripped out `e.preventDefault()` and `e.stopPropagation()`, ensuring the listening aura is purely decorative and cannot block card or navigation taps.
4. **Hero Card Advance Watchdog (`LetsPlayScreen.tsx`)**:
   - Wrapped `handleTapObject` in `try { ... } finally { ... }`.
   - Added a 4.5s fail-safe watchdog timer that forces `advanceToNext()` and resets `hasTappedCardRef.current = false` if any browser audio stall occurs.
5. **Validation, Build & Git Push**:
   - Verified TypeScript strict compliance: `npm run build` passed cleanly.
   - Verified agent room governance: `npm run agent-room:validate` and `npm run agent-room:doctor` passed with green status.
   - Committed changes and pushed to `main` (`808113d`).
6. **Live Chrome DevTools MCP Production Verification**:
   - Injected 10 rapid card clicks within 500ms on `"Tap Star"` during speech: audio interrupted cleanly, celebration chime played, and card auto-advanced to `"Tap Sock"`.
   - Injected 15 rapid card clicks within 600ms on `"Tap Sock"` during speech: card auto-advanced cleanly to `"Tap Sheep"` with `disabled: false`.
   - Tested `"Go Home"` button: navigated back to Home Screen immediately.
   - Console error audit: 0 unhandled rejections, 0 errors logged.

## Tests run
- Command: `npm run build`
  - Result: Pass (`tsc && vite build` passed, 0 errors).
- Command: `npm run agent-room:validate`
  - Result: Pass (core files present, guardrails valid, skills verified).
- Command: `npm run agent-room:doctor`
  - Result: Pass (🟢 Looks good).
- Chrome DevTools MCP Live Production Stress Test:
  - 10 rapid clicks on card 1: PASS (`hasAdvanced: true, nextCardDisabled: false`).
  - 15 rapid clicks on card 2: PASS (`hasAdvanced: true, nextCardDisabled: false`).
  - Home button responsiveness: PASS (returned to Home cleanly).
  - Browser console audit: PASS (0 errors).

## Decisions made
- Interrupted HTMLAudioElement instances must immediately resolve their awaiting Promise wrappers rather than waiting for events that never fire.
- Multi-step audio blends require monotonic concurrency tokens (`currentBlendToken`) to discard aborted sequences.
- Overlays must be `pointer-events-none`; rapid-click absorption belongs on the individual buttons, not on a full-screen shield.

## Outcome
Completed

**Handoff note:**
- **Completed:**
  - Audio promise leak resolved in `audioService.ts` via `currentAudioResolve` and 5.5s watchdog.
  - Multi-step blend concurrency token implemented in `audioService.ts`.
  - Full-screen touch interception eliminated in `ListenRipple.tsx`.
  - Try-finally and 4.5s safety watchdog added to `LetsPlayScreen.tsx`.
  - Deployed to production (`808113d`) and verified with 10-tap and 15-tap live stress tests.
- **In Progress:** None.
- **Blocked On:** None.
- **Assumptions:** All pre-recorded audio files remain peak-normalized to -1.0 dBFS with Oxford priority.
