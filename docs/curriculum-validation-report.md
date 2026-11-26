# Curriculum and Asset Validation Report

**Review date:** 16 November 2026
**Command:** `npm run verify:curriculum`
**Status:** Passed after removing the misclassified VC entry and validating multi-phoneme grapheme groups.

The validator checks blending IDs, level references, CVC shape, taught-letter prerequisites, phoneme alignment (including multi-phoneme grapheme groups), audio IDs, and bundled local audio paths. It is a release-control tool; it does not decide whether a word is pedagogically appropriate or change curriculum/audio content automatically.

## Current findings

No release-blocking curriculum or bundled audio findings were reported for the 37 blending entries. The `at` VC item was removed from the CVC catalogue. Final `x` is represented as the grapheme group `/k/` + `/s/` and its flattened phoneme sequence is checked by the validator.

This result does not establish asset rights, pronunciation quality, or educational suitability; those remain separate specialist-review gates.

## Release policy

- Keep `npm run verify:curriculum` available for content CI/review and re-run it after curriculum changes.
- The current validation is clean; retain it as a release gate.
- Any exception must include the owner, rationale, prerequisite mapping, word classification, audio IDs, source/rights evidence, and review date.
- Re-run after every curriculum, audio manifest, or level-sequence change.

E2.2 validation is **clean** for the current catalogue. Pronunciation/educational approval is not inferred from code and remains pending specialist review.

## Letters and Sounds programme (26 November 2026)

**Command:** `npm run verify:curriculum` (second check)
**Status:** Passed for 5 phases and 242 words. The programme lives in `src/data/lettersAndSounds/` and is not yet used by the screens; the 37-entry catalogue above still drives the current app.

The checker (`src/curriculum/lettersAndSoundsValidation.ts`) walks the programme in teaching order and reports:

- a word that uses a grapheme before it is taught, including split digraphs and multi-letter graphemes;
- a word that does not contain the correspondence it is listed under;
- a Phase 4 word without adjacent consonants;
- malformed segmented words, duplicate correspondence IDs, and duplicate tricky words.

Doubled consonants (nn, mm, tt…) are accepted once a doubled grapheme (ff, ll, ss) has been taught and the single letter is known.

### Changes from the supplied word lists

| Word | Listed under | Change | Reason |
| --- | --- | --- | --- |
| Ken | k (Set 3) | Moved to e (Set 4) | Uses e, taught in Set 4 |
| pocket | ck (Set 4) | Moved to e (Set 4) | Uses e, taught after ck |
| run | u (Set 4) | Moved to r (Set 4) | Uses r, taught after u |
| carrot | r (Set 4) | Removed | rr is not taught in Phase 2 |

Phase 4 adjacent-consonant words beyond trap, strong, milk, and crept were added for practice. Irregular pronunciations (for example *of*, *as*, *sure*, and unstressed vowels in longer Phase 5 words) are recorded as notes, not errors. A phonics specialist has not reviewed the sequence or word lists.

### Readers (26 November 2026)

Six four-page readers (`src/data/lettersAndSounds/readers.ts`) pass the same check: each is decodable after its stated correspondence, and tricky words come only from its own or earlier phases. The readers were written for this app and have not been specialist-reviewed. Sound-by-sound playback gives th its /θ/ sound in "then", and readers avoid short-oo words.
