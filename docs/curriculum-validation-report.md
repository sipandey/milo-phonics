# Curriculum and Asset Validation Report

**Review date:** 13 October 2026
**Command:** `npm run verify:curriculum`
**Status:** Failing by design until curriculum/content owners resolve the findings below.

The validator checks blending IDs, level references, simple three-letter CVC shape, taught-letter prerequisites, phoneme alignment, audio IDs, and bundled local audio paths. It is a release-control tool; it does not decide whether a word is pedagogically appropriate or change curriculum/audio content automatically.

## Current findings

| Code | Item | Finding | Required owner decision |
| --- | --- | --- | --- |
| `NON_CVC_WORD` | `at` | `at` is a two-letter VC entry but uses the `cvc.at`/CVC curriculum shape | Reclassify as VC with a separate schema/audio path, or remove/replace it after curriculum review |
| `UNTAUGHT_LETTER` | `bed` | `b` is introduced at Level 5 but `bed` is published at Level 4 | Move the entry after `b` is taught, change the sequence, or obtain a documented curriculum exception |
| `UNTAUGHT_LETTER` | `box` | `x` is introduced at Level 6 but `box` is published at Level 5 | Move the entry after `x` is taught, change the sequence, or obtain a documented curriculum exception |

No missing local CVC/sentence assets or duplicate IDs were reported in this run. That result does not establish asset rights, pronunciation quality, or educational suitability; those remain E1.1/E1.8/E1.9 and specialist-review gates.

## Release policy

- Keep `npm run verify:curriculum` available for content CI/review and do not suppress the three findings.
- Do not wire this failing validator into the general production build until the content owner resolves or formally records each finding; once clean, add it as a required build step.
- Any exception must include the owner, rationale, prerequisite mapping, word classification, audio IDs, source/rights evidence, and review date.
- Re-run after every curriculum, audio manifest, or level-sequence change.

E2.2 remains **in progress**. The validator is implemented and the current defects are reproducible; content correction and pronunciation/educational approval are not inferred from code.
