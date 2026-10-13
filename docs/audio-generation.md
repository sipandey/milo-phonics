# Audio Generation — Developer Guide

> Development-time audio generation pipeline.
> Voice audio is pre-generated using OpenAI TTS and may be uploaded to Cloudinary
> for publishing metadata. The browser runtime currently prefers bundled local
> MP3 paths from `generatedAudioManifest.ts`.
> The browser app **never** calls OpenAI. No secrets reach the client.

> **Runtime authority:** See the [current product and architecture record](plans/current-product-and-architecture.md). This guide describes generation and publishing mechanics, not unsupported CDN-first or speech-synthesis fallback behavior.

---

## Architecture

```
Semantic Audio ID  (e.g. "word.monkey")
        ↓
  audioManifest.ts  (base: fallbackText, type, source)
        ↓
  generate:audio script  ← runs at dev time only
        ↓
  OpenAI TTS  (gpt-4o-mini-tts, voice: coral)
        ↓
  MP3  →  generated/audio/  (temp, gitignored)
        ↓
  Cloudinary Upload  →  phonics/audio/v1/<type>/<slug>
        ↓
  generatedAudioManifest.ts  ← committed to git
        ↓
  audioManifest.ts  merges URL into AudioEntry
        ↓
  audioService.ts (AudioManager)
        ↓
  audioManifest.ts resolves localUrl first
        ↓
  Browser plays bundled local MP3
        ↓
  No native speech-synthesis or automatic CDN fallback
```

---

## Required Environment Variables

Copy `.env.example` to `.env` and fill in your credentials.

| Variable | Purpose | Reaches browser? |
|---|---|---|
| `OPENAI_API_KEY` | OpenAI TTS generation | ❌ Never |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud | ❌ Never |
| `CLOUDINARY_API_KEY` | Cloudinary upload auth | ❌ Never |
| `CLOUDINARY_API_SECRET` | Cloudinary upload auth | ❌ Never |
| `TTS_MODEL` | TTS model (default: `gpt-4o-mini-tts`) | ❌ Never |
| `AUDIO_TTS_VOICE` | TTS voice (default: `coral`) | ❌ Never |
| `TTS_INSTRUCTION_VERSION` | Instruction config version (default: `1`) | ❌ Never |

> **Security rule**: Variables without the `VITE_` prefix are never injected by Vite into client bundles.
> Never add `VITE_OPENAI_API_KEY` or `VITE_CLOUDINARY_API_SECRET`.

---

## Running the Generation Script

### Dry-run (safe — no API calls)
```bash
npm run generate:audio:dry-run
# or:
npm run generate:audio -- --dry-run
```
Shows what would be generated, what would be skipped, and which phonemes require review.

### Generate all assets
```bash
npm run generate:audio
```

### Generate a specific asset by ID
```bash
npm run generate:audio -- --id word.monkey
npm run generate:audio -- --id phrase.m-monkey
```

### Generate all assets of a type
```bash
npm run generate:audio -- --type word
npm run generate:audio -- --type phrase
npm run generate:audio -- --type prompt
npm run generate:audio -- --type praise
npm run generate:audio -- --type letter
```

---

## Idempotency / Fingerprinting

The script computes a deterministic SHA-256 fingerprint:

```
fingerprint = SHA256(id | text | model | voice | instructionVersion)
```

If an existing entry in `generated/generatedAudioManifest.json` has a matching fingerprint, the asset is **skipped** — no OpenAI call, no Cloudinary upload.

To force regeneration:
- Change the `text` (via `fallbackText` in `audioManifest.ts`)
- Change the `model`, `voice`, or `TTS_INSTRUCTION_VERSION` in `.env`

---

## Cloudinary Asset Structure

```
phonics/audio/v1/<type>/<slug>
```

Examples:
| Semantic ID | Cloudinary public_id |
|---|---|
| `letter.m` | `phonics/audio/v1/letter/m` |
| `phoneme.m` | `phonics/audio/v1/phoneme/m` |
| `word.monkey` | `phonics/audio/v1/word/monkey` |
| `phrase.m-monkey` | `phonics/audio/v1/phrase/m-monkey` |
| `prompt.lets-play` | `phonics/audio/v1/prompt/lets-play` |
| `praise.yay` | `phonics/audio/v1/praise/yay` |

Assets are stored as Cloudinary `resource_type: 'video'` (Cloudinary's type for audio).
Format: `mp3` — universally supported by Chrome, Safari, iOS, Android.

---

## Generated Manifest

**`src/data/generatedAudioManifest.ts`** — committed to git, safe to deploy.

Contains Cloudinary URLs, optional local paths, and generation metadata for generated assets.
The `audioManifest.ts` `getAudioEntry()` function merges this at runtime:
- If a generated entry has a `localUrl` → returns that local path with `source: 'local'`
- If no generated local path exists → returns the configured local/conventional path when available
- Unknown non-word IDs return no entry; `audioService` does not invoke browser `speechSynthesis`

> Components never reference Cloudinary directly. They use semantic IDs only.

---

## Phoneme Handling

**Phonemes (`phoneme.m`, `phoneme.s`, `phoneme.a`) are NOT auto-generated.**

Reason: TTS systems often produce the letter name ("em") instead of the isolated phoneme sound (/m/).
Even extended representations ("Mmmmm") may vary unpredictably by model and voice.

**Policy:**
1. Phonemes are flagged as `needs-review` in generation output
2. They use the checked-in local phoneme assets; no browser `SpeechSynthesis` fallback is available
3. To generate phonemes: set `GENERATE_PHONEMES=true` in `.env`, run the script, listen carefully to each asset, and manually approve before committing

---

## Changing Voice or Model

1. Update `.env`:
   ```
   AUDIO_TTS_VOICE=nova
   TTS_INSTRUCTION_VERSION=2
   ```
2. Run `npm run generate:audio:dry-run` to see what would regenerate
3. Run `npm run generate:audio` to regenerate

Bumping `TTS_INSTRUCTION_VERSION` forces ALL assets to regenerate (fingerprint changes).
Changing only the voice forces all assets to regenerate (voice is part of fingerprint).

---

## TTS Instructions

Each audio type has tailored instructions in `scripts/generate-audio.ts` → `TTS_INSTRUCTIONS`:

| Type | Instruction focus |
|---|---|
| `letter` | Clear letter name, warm, unhurried |
| `phoneme` | Isolated phoneme, slightly elongated, gentle |
| `word` | Single word, child-friendly pace |
| `phrase` | Short phrase, joyful discovery, natural pause |
| `prompt` | Friendly invitation, playful energy |
| `praise` | Enthusiastic but not over-the-top |

---

## Selective Generation Workflow

When updating a single word:
1. Change `fallbackText` in `src/data/audioManifest.ts`
2. Run: `npm run generate:audio -- --id <changed-id>`
3. The new asset is generated; all others are skipped via fingerprint match
4. Commit updated `src/data/generatedAudioManifest.ts`

---

## Security Rules

- ✅ `OPENAI_API_KEY` — generation script only, never in browser
- ✅ `CLOUDINARY_API_SECRET` — generation script only, never in browser
- ✅ `.env` is in `.gitignore` — never committed
- ✅ `generated/` directory is in `.gitignore` — temp MP3s not committed
- ✅ `generatedAudioManifest.ts` contains Cloudinary URLs plus optional local paths — safe to commit and ship
- ✅ Vite does NOT inject any `OPENAI_*` or `CLOUDINARY_API_SECRET` variables (no `VITE_` prefix)
- ✅ `openai`, `cloudinary`, `dotenv` are `devDependencies` — excluded from production bundle by Vite

---

## Local Temporary Files

```
generated/
  audio/
    word_monkey.mp3       ← temp files, gitignored
    phrase_m-monkey.mp3
    ...
  generatedAudioManifest.json  ← pipeline state file, gitignored
```

These are cleaned between runs (overwritten) and are not committed.
Cloudinary is the canonical long-term store.

---

## Safe Failure Guarantees

- If OpenAI TTS fails → asset is `failed`, other assets continue
- If Cloudinary upload fails → local MP3 is preserved, manifest is NOT updated for that asset
- If manifest writing fails → inconsistency is reported clearly
- Failed assets never overwrite a previously good manifest entry
- Exit code is non-zero if any asset failed

---

## Running the App Locally

```bash
npm run dev
# then open http://localhost:3000
```

The app uses bundled local audio paths resolved from semantic IDs. Cloudinary URLs in
`generatedAudioManifest.ts` are publishing metadata; the current browser code does not
perform an on-error CDN fallback and does not use browser `SpeechSynthesis`.

---

## Build

```bash
npm run build
```

TypeScript compilation + Vite bundle. The generated manifest is compiled into the bundle.
No secrets are included.
