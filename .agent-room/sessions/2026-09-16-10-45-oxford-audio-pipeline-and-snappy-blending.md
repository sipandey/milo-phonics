# Session Log: Oxford-First Audio Pipeline, Zero SpeechSynthesis & Snappy Blending

**Date:** 2026-09-16 10:45
**Agent:** Antigravity (Advanced Agentic Pair Programmer)
**Classification:** Feature & Enhancement

## Goal
Completely eradicate browser native `speechSynthesis`, establish authentic Oxford Dictionary human audio as top precedence for phonemes, generate British Coral AI audio backed by Cloudinary CDN for all words/sentences/letters/praises/prompts, eliminate blending delays by trimming dead silence with ffmpeg, and implement toddler multi-tap pacing protection.

## Files touched
- Read:
  - `src/services/audioService.ts`
  - `src/data/audioManifest.ts`
  - `src/data/cvcAudioManifest.ts`
  - `src/data/generatedAudioManifest.ts`
  - `src/data/generatedAudioManifestTypes.ts`
  - `src/components/train/SoundTrainScreen.tsx`
  - `src/components/play/LetsPlayScreen.tsx`
  - `src/components/parent/ParentDashboard.tsx`
  - `package.json`
- Created:
  - `public/audio/letters/letter_a.mp3` ... `letter_z.mp3` (26 letter names)
  - `public/audio/prompts/prompt.*.mp3` (4 game prompts)
  - `public/audio/praise/praise.*.mp3` (6 praise cues)
  - `scripts/optimize-and-sync-audio.ts` (silence trimming & Cloudinary sync pipeline)
  - `.agent-room/sessions/2026-09-16-10-45-oxford-audio-pipeline-and-snappy-blending.md`
- Modified:
  - `src/services/audioService.ts` (removed all SpeechSynthesis, tightened blending delays)
  - `src/data/audioManifest.ts` (Oxford precedence, local & Cloudinary mappings)
  - `src/data/cvcAudioManifest.ts` (38 CVC words & 38 sentences with Cloudinary URLs)
  - `src/data/generatedAudioManifest.ts` (120 voice assets with Cloudinary URLs)
  - `src/data/generatedAudioManifestTypes.ts` (added localUrl, optional fingerprint/version)
  - `src/components/train/SoundTrainScreen.tsx` (streamlined blend unlock & attention spotlight)
  - `src/components/parent/ParentDashboard.tsx` (Oxford/AI Cloudinary pipeline monitor & blend tests)
  - `README.md` (comprehensive curriculum, sound train, audio pipeline docs)
  - `.agent-room/decisions.md` (added architectural decisions)
  - `.agent-room/anti-patterns.md` (added negative knowledge entries)
  - 160 MP3 audio files in `public/audio/` (trimmed trailing silence with ffmpeg)

## Actions taken
1. Diagnosed 12–14s Sound Train blending delay: discovered OpenAI TTS files had 1.5s–3.4s of trailing silence per file (`cvc.sat.mp3` was 3.89s with only 0.5s speech) and the sequence blocked on auto-narrating a 5s sentence.
2. Built `scripts/optimize-and-sync-audio.ts` to execute `ffmpeg silenceremove` across all 38 CVC words, 38 sentences, and 84 curriculum words. `cvc.sat.mp3` dropped 83% from 3.89s to 0.65s!
3. Generated missing speech assets (26 letter names, 4 game prompts, 6 praise cues) with OpenAI TTS `coral` voice at 0.75x pace matching Oxford RP, trimmed trailing silence, and uploaded to Cloudinary CDN (`phonics/audio/v1/...`).
4. Eradicated all `window.speechSynthesis` calls and browser native speech references from `audioService.ts` and UI components.
5. Configured `audioManifest.ts` so Oxford authentic human recordings (`/audio/phoneme_<letter>.mp3`) strictly take top precedence, followed by local AI files with Cloudinary CDN fallback.
6. Decoupled automatic blocking sentence playback from the Sound Train blend action; blending sequence now completes and unlocks action buttons immediately upon the blended word sound completing (~2.8s total).
7. Updated Parent Dashboard with an Oxford-First & AI Cloudinary Pipeline monitor and interactive blend test buttons.
8. Implemented toddler pacing protection (`ListenRipple.tsx`, Attention Spotlight, 600ms debounce guard, and "Your Turn" pulse) across both Sound Train and Let's Play modes.

## Tests run
- Command: `npm run build`
- Result: Pass (tsc && vite build completed in 3.11s, 0 errors).
- Command: `npm run agent-room:validate`
- Result: Pass (All core files present, guardrails valid, skills verified).
- Command: `git push origin main`
- Result: Pass (Pushed to https://github.com/sipandey/milo-phonics.git).

## Decisions made
- Permanently removed browser `speechSynthesis` to eliminate dropped utterances and robotic voices.
- Oxford human recordings strictly take top precedence for all letter phonemes.
- OpenAI TTS `coral` voice (0.70x–0.75x) is the sole AI voice for words, sentences, prompts, and praises.
- Decoupled secondary story sentence narration from the primary CVC blend interaction path.
- Enforced automated trailing silence trimming with ffmpeg on all generated voice assets.

## Outcome
Completed
