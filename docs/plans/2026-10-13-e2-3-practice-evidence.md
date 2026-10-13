# E2.3 practice-evidence progression

## Decision

Milo Phonics separates exploration from demonstrated practice.

- Letter and object exploration is still recorded for resume and parent-visible activity history, but it does not award new stars or unlock levels.
- Sound Train records a successful blending attempt.
- Bubble Pop and Feed Milo record a correct identification attempt. An incorrect choice marks the round as attempted but does not create a correct-practice result.
- One correct practice attempt earns one star for the letter.
- A correct first attempt earns two stars for the letter.
- A later correct review earns the third star when the letter already has a correct first-attempt result.
- Existing `letterStars` values are never reduced. Existing progress remains valid after the migration.

The thresholds are deliberately modest and represent observed interaction evidence only. They are not a mastery, diagnostic, assessment, age-suitability, or learning-outcome claim.

## Implementation boundary

`ChildProgress.practiceEvidence` stores aggregate counts per letter: attempts, correct attempts, correct first attempts, review attempts, correct review attempts, and the latest practice timestamp. Item text and answer history are not persisted in this field.

`progressService.recordLetterInteraction` and `recordObjectInteraction` remain exploration commands. `progressService.recordPracticeAttempt` is the only new practice command and derives the target star level from the aggregate evidence before applying the existing non-downgrading star and level-unlock logic.

Practice evidence is retained by content-version migration and merged with deterministic per-field maxima during Clerk sync. This avoids double-counting snapshots while preserving the strongest known local or cloud evidence.

## Verification

The focused progress and migration tests cover exploration-without-stars, first-attempt and review thresholds, non-downgrade behavior, and practice-evidence migration. The full test, lint, build, AgentRoom validation, and curriculum-validation commands remain release evidence; the curriculum validator is expected to retain the existing `at`, `bed`, and `box` findings until a content owner resolves them.
