# Session Log: Vercel Node 24 Runtime Compatibility

**Date:** 2026-10-13 19:20
**Agent:** Codex (GPT-5)
**Classification:** Bug

## Goal

Restore Vercel deploy compatibility after the Node.js 20.x build runtime was discontinued.

## Files touched

- Read: `package.json`, `package-lock.json`, `.nvmrc`, `.github/workflows/agent-room-validate.yml`, `README.md`, `docs/plans/current-product-and-architecture.md`, `.agent-room/decisions.md`, and the Vercel build log supplied by the user.
- Created: this session log.
- Modified: `package.json`, `package-lock.json`, `.nvmrc`, `.github/workflows/agent-room-validate.yml`, `README.md`, `docs/plans/current-product-and-architecture.md`, `.agent-room/decisions.md`, and `docs/plans/2026-10-13-e0-1-reproducible-node-setup-design.md`.

## Actions taken

1. Classified the deployment failure as a Bug-flow runtime compatibility correction.
2. Confirmed that the repository still declared Node 20.19/npm 10 while Vercel requires Node 24.x.
3. Updated the package, lockfile, local version hint, CI workflow, setup documentation, and current architecture record to Node 24.x/npm 11.x.
4. Recorded the superseding runtime decision and marked the historical E0.1 design baseline.

## Tests run

- Command: runtime contract assertion and `git diff --check`
  - Result: Pass; package, lockfile, `.nvmrc`, CI, and current documentation target Node 24.x/npm 11.x.
- Command: `npm run lint`
  - Result: Pass.
- Command: `npm test`
  - Result: Pass; 5 test files and 15 tests.
- Command: `npm run build`
  - Result: Pass; strict TypeScript compilation and Vite production build completed.
- Command: `npm run agent-room:validate`
  - Result: Pass.
- Command: `npm run verify:release`
  - Result: Pass; release metadata verified as `1.0.0 (local, local)` after rerunning with sandbox escalation for the temporary tsx IPC pipe.
- Command: `npx create-agent-room@2.3.1 lint-sessions .`
  - Result: Existing historical session-log errors remain outside this runtime correction; the new session log follows the required structure.

## Decisions made

- Use the exact Vercel-requested `24.x` package engine and CI line, with npm 11.x bundled by the supported Node line.
- Keep historical E0.1/E0.2 session logs unchanged; record the supersession in the decision log and current documentation instead of rewriting historical evidence.

## Outcome

Completed
