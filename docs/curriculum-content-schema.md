# Curriculum content schema

`src/data/curriculumContent.ts` is the application-facing manifest for the current curriculum catalogue. It adapts the existing level, letter, and blending records into one typed, versioned structure without changing the current learning content.

## Release state

| Field | Current value |
| --- | --- |
| Schema version | `1` |
| Content version | `2026.10.13.1` |
| Manifest status | `review` |
| Intended scope | Introductory letter-sound and short-word blending activities |
| Published digraph content | None; `sh`, `ch`, `th`, `ck`, `ng`, and `qu` are draft records |
| Reader pages | None yet; the typed collection is reserved for a later reviewed reader |

The review status is deliberate. The manifest does not approve pronunciation, rights, educational alignment, age suitability, mastery, or learning outcomes. The existing curriculum validation command still reports the known `at`, `bed`, and `box` findings; this schema does not reclassify or remove those records.

## Data contract

| Manifest collection | Purpose |
| --- | --- |
| `soundSets` | Ordered levels, level prerequisites, review-rule references, audio IDs, and content status |
| `phonemes` | Phoneme text, owning grapheme, introduction level, phoneme audio ID, and status |
| `graphemes` | Grapheme text, phoneme mapping, letter audio ID, introduction level, and status |
| `words` | VC/CVC/DIGRAPH/OTHER shape, level, grapheme and phoneme IDs, word/sentence audio references, and source record |
| `digraphs` | Future multi-letter graphemes with explicit draft status and unassigned audio/prerequisite fields |
| `readerPages` | Future connected-text pages with word and audio references |
| `reviewRules` | Data-defined review-session limits and revisit timing |
| `scope` | Approved modest description, included content, and claims that remain excluded |

The UI and progress service import level and word lookups from this manifest. Legacy data modules remain available for compatibility and as the source records used by the adapter; screens do not add their own curriculum ordering or word catalogue.

## Practice progression boundary

Exploration and practice are separate progress signals. Letter/object exploration is retained as activity history but does not award new stars or unlock levels. Explicit blending and identification activities submit aggregate practice evidence through `progressService.recordPracticeAttempt`; the current policy awards one star after a correct attempt, two after a correct first attempt, and three after a later correct review when a correct first-attempt result already exists. Existing stars are preserved. These signals describe observed interaction evidence only and are not a mastery or diagnostic assessment.

## Change control

Content changes should update `CURRICULUM_CONTENT_VERSION`, add or update a focused schema test, run `npm run verify:curriculum`, and retain the result with release evidence. Progress snapshots are migrated through `src/services/contentMigration.ts`; the migration must preserve stable progress and explicitly map any removed or reordered level IDs. A content owner must resolve or explicitly approve any validation finding before the manifest can move from `review` to `published`.
