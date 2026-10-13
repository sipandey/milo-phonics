# Session — E2.3 practice evidence

Date: 13 October 2026

## Request/plan

Implement the approved E2.3 policy under AgentRoom RPI: exploration remains recorded without new stars; explicit practice earns positive progression using first-attempt and later-review evidence; existing stars remain intact; do not alter the known curriculum findings.

## Red/green evidence

- Added failing-first service tests for exploration without stars and practice thresholds.
- Added `PracticeAttempt`/`PracticeEvidence` contracts and `ChildProgress.practiceEvidence`.
- Implemented persistence, sanitisation, content migration, Clerk merge/export, and reset handling.
- Wired Sound Train, Bubble Pop, and Feed Milo to `recordPracticeAttempt`.
- Removed exploration reward effects and guarded play-screen advancement against direct level unlocking.
- Added migration coverage and documented the non-diagnostic interpretation.

## Gates

Focused progress and migration tests: pass.

Lint and remaining repository gates: run before commit; `verify:curriculum` is expected to retain the existing `at`, `bed`, and `box` findings.

## Decision boundary

No content, rights, privacy, specialist-review, production-network, or other approval-dependent findings were changed.
