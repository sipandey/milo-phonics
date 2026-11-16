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
