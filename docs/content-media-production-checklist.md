# Content media production checklist

Use this checklist for every new or changed curriculum audio/video asset. It is an engineering release checklist, not a rights clearance or pronunciation certification. Attach the completed record to the release evidence for the content and app versions involved.

## 1. Change and scope

- [ ] Record the semantic asset ID, content version, media type, source text or animation brief, owning sound set/word/reader page, and intended runtime surface.
- [ ] Confirm the asset is represented in the [curriculum content manifest](curriculum-content-schema.md) or the relevant runtime media manifest.
- [ ] Record whether the item is `draft`, `review`, `published`, or `retired`; draft assets must not be presented as released content.
- [ ] Run `npm run verify:curriculum` for curriculum-linked words and retain the result, including any owner-approved findings.

## 2. Source rights and provenance

- [ ] Assign the matching row in the [asset rights register](asset-rights-register.md) before committing or publishing the asset.
- [ ] Retain the creator/source, acquisition or generation date, licence/contract/terms record, permitted markets, term, modification rights, attribution requirement, and expiry/review date.
- [ ] For generated voice, retain the exact source text, model, voice, instruction/configuration version, operator/account evidence, generation timestamp, fingerprint, human reviewer, and AI-audio disclosure decision.
- [ ] For video, retain the raw-project owner, models/stock sources, music/SFX provenance, edit rights, and the SHA-256 fingerprint of the shipped file.
- [ ] Do not infer rights from a local file, a public URL, a generated manifest, or a vendor account alone.

## 3. Pronunciation and content review

- [ ] A named content reviewer listens to every phoneme, word, sentence, prompt, or reader line in the target device/browser playback path.
- [ ] Record the reviewer, date, source text, accepted/rejected decision, and any correction required; do not convert a technical pass into an educational or accent claim.
- [ ] Confirm the audio matches the manifest’s grapheme/phoneme/word mapping and the published prerequisite state.
- [ ] For a changed curriculum item, obtain curriculum-owner review before changing classification, sequence, or prerequisite.

## 4. Audio processing and quality

- [ ] Inspect for clipping, distortion, dropped audio, unintended noise, and excessive leading/trailing silence.
- [ ] Run the repository’s silence-trim path used by the generation pipeline, or record the equivalent manual processing command and reviewer.
- [ ] Run `scripts/normalize_audio_loudness.py` when normalization is required; verify the intended peak target of `-1.0 dBFS` and inspect a mobile playback sample.
- [ ] Confirm the encoded format and sample plays through the semantic audio ID, not a hard-coded screen URL.
- [ ] For video, check dimensions, frame rate, duration, seek/start behavior, muted fallback, and no unintended text or external links.

## 5. Bundle, offline, and runtime checks

- [ ] Record the compressed file size and cumulative media-size impact; flag any bundle growth that needs release-owner review.
- [ ] Confirm the local path exists under `public/` and matches the manifest entry exactly, including case and extension.
- [ ] Run `npm run build` and load the asset through the browser runtime using the semantic ID.
- [ ] Test first play, replay, interruption/cancellation, mute state, and a missing/failed asset path without leaving the screen locked.
- [ ] In an isolated browser profile or test deployment, test the asset after the application is unavailable from the network. Do not make a fully-offline claim from source inspection alone.

## 6. Versioning and release record

- [ ] Bump `CURRICULUM_CONTENT_VERSION` when the curriculum meaning, prerequisite, classification, or review state changes.
- [ ] Ensure generated audio fingerprints and `generatedAudioManifest.ts` identify the model/voice/config change when generation changes.
- [ ] Record the application release version, source commit, content version, changed asset IDs, reviewer decisions, test results, and rollback target.
- [ ] Confirm progress migration exists for any changed or removed level IDs before shipping the content release.
- [ ] Keep unresolved rights, vendor, pronunciation, curriculum, or offline findings visible in the release record; do not silently waive them.

## Minimum evidence bundle

The release record should contain the completed checklist, rights-register references, generated manifest diff, media hashes/sizes, reviewer record, `npm run verify:curriculum` output, `npm run build` output, offline/runtime notes, and the rollback commit or deployment target.
