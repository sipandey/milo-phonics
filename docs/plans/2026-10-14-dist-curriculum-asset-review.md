# Distribution curriculum asset review

**Review date:** 14 October 2026
**Scope:** The local Vite `dist/` output after a fresh `npm run build`.
**Source of truth:** `public/`, the typed audio manifests, and the runtime resolvers. `dist/` is ignored generated output and is not a curriculum source-of-truth.

## Build result

`npm run build` passed TypeScript compilation, `npm run verify:claims`, and Vite packaging. Vite emitted its existing advisory about the JavaScript chunk being larger than 500 kB; no build error occurred.

The generated output contains 322 files:

| Output family | Count | Review result |
| --- | ---: | --- |
| Static shell (`index.html`, `release.json`, one CSS bundle, one JS bundle) | 4 | Present and produced by the build |
| Audio | 316 | Present, source/path/hash reconciled, and decodable |
| Video | 2 | Present, source/path/hash reconciled, and decodable |
| **Total** | **322** | **Packaging pass** |

## Curriculum media inventory

| `dist` path family | Count | Runtime/source mapping |
| --- | ---: | --- |
| `audio/` root | 120 | 26 letter phoneme files plus 94 IPA isolation/example-word files resolved by `audioService.playOxfordSound` |
| `audio/cvc/` | 38 | CVC word entries from `cvcAudioManifest.ts` |
| `audio/sentences/` | 38 | CVC sentence entries from `cvcAudioManifest.ts` |
| `audio/words/` | 84 | Generated word entries and `getAudioEntry` word fallback |
| `audio/letters/` | 26 | Generated letter entries |
| `audio/praise/` | 6 | Praise entries in the audio manifest |
| `audio/prompts/` | 4 | Prompt entries in the audio manifest |
| `video/milo/` | 2 | Existing Milo states referenced by `MiloVideoCompanion.tsx` |
| **Media total** | **318** | **316 MP3 + 2 MP4** |

The generated manifest contains 120 entries, and the CVC manifest contains 38 entries. Their 196 explicit local URLs all resolve under `public/`. The remaining root audio files are intentionally addressed through the typed runtime resolver rather than duplicated as manifest records.

## Reconciliation evidence

- Every one of the 318 media paths under `public/audio/` and `public/video/` has exactly one matching path under `dist/audio/` or `dist/video/`.
- Source-to-build comparison found **0 missing paths**, **0 extra paths**, and **0 SHA-256 differences**.
- The generated media set contains **0 zero-byte files**.
- `ffprobe` accepted all 318 media files; no MP3 or MP4 failed the container/format check.
- The two present video files are `milo_chomp_chew.mp4` and `milo_hungry_pose.mp4`.

This proves that the build packages the checked-in media faithfully. It does not prove rights, provenance, pronunciation, educational suitability, or curriculum approval.

## Findings carried into the delivery plan

1. **No packaging defect:** do not copy `dist/` into Git or make it a second source-of-truth. Re-run the parity and decode checks as release evidence when media changes.
2. **Curriculum validation remains blocked:** all 38 CVC word/sentence pairs are present, including `at`, `bed`, and `box`. Asset presence does not resolve the existing validator findings: `at` is VC but uses the CVC shape, `bed` precedes taught `b`, and `box` precedes taught `x`.
3. **Video runtime gap remains open:** code still references `milo_curious_rethink.mp4` and `milo_full_tummy_celebrate.mp4`, but neither file exists in `public/` or `dist/`. The owner must either supply rights-cleared replacements and register them or remove those states and verify fallback behavior.
4. **Rights gates remain open:** all shipped media remains subject to the evidence ledger in the asset rights register. Build parity is not rights clearance.

## Next acceptance steps

- Attach the per-file media hashes/sizes and this build/parity result to the release evidence for any media release.
- Obtain curriculum-owner decisions for `at`, `bed`, and `box`; update the typed manifest and content version only after review.
- Resolve the two missing Milo states with the creative/rights owner before treating the video surface as complete.
- Complete the open A-001–A-012 rights/provenance evidence before external launch, paid distribution, school pilots, or Oxford/accent/educational claims.

