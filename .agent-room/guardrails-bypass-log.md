# Guardrails Bypass Log — create-agent-room

Append-only, machine-written record of every commit that used
`GUARDRAILS_BYPASS=1` (or `SKIP_GUARDRAILS_CHECK=1`) to override a blocked
commit. Written automatically by `.agent-room/hooks/guardrails-check.js` -
do not edit by hand; edits here don't reflect what actually happened.

Review this periodically (or in code review) so bypasses stay visible
instead of scrolling off a terminal and being forgotten.

<!-- Entries below this line, newest first, appended automatically. -->
- 2026-09-15T10:19:14.942Z | author: Siddharth Pandey <siddharth.pandey06@gmail.com> | bypassed: Change scope exceeds guidance: 226 files changed (limit 20); Change scope exceeds guidance: 4866 lines changed (limit 500)
