# Session Log: E0.1 Reproducible Node/npm Setup

**Date:** 2026-10-13 18:35
**Agent:** Codex (GPT-5)
**Classification:** Enhancement

## Goal

Start execution of the technical delivery backlog by standardizing the local Node.js/npm runtime and documenting a repeatable install path.

## Files touched

- Read: `AGENTS.md`, `.agent-room/principles.md`, `.agent-room/workflow-classifier.md`, `.agent-room/guardrails.md`, `.agent-room/skills/brainstorming.md`, `.agent-room/skills/writing-plans.md`, `.agent-room/skills/verification-before-completion.md`, `.agent-room/skills/closing-the-loop.md`, `.agent-room/decisions.md`, `.agent-room/anti-patterns.md`, `docs/plans/technical-delivery-backlog.md`, `docs/plans/product-roadmap-and-android-strategy.md`, `package.json`, `package-lock.json`, `README.md`, `.github/workflows/agent-room-validate.yml`, `tsconfig.json`, `tsconfig.node.json`.
- Created: `.nvmrc`, `docs/plans/2026-10-13-e0-1-reproducible-node-setup-design.md`, this session log.
- Modified: `package.json`, `README.md`, `docs/plans/technical-delivery-backlog.md`, `.agent-room/decisions.md`.

## Actions taken

1. Classified the next backlog slice as Enhancement E0.1 under the AgentRoom workflow.
2. Confirmed CI already uses Node 20 and identified the mismatch with README guidance of Node 18+/npm 9+.
3. Presented and received approval for the E0.1 design: Node 20.x LTS, npm 10.x, `.nvmrc`, package engines, `npm ci`, and no protected CI changes.
4. Recorded the design and runtime decision, then created local design commit `d6cc342` (`docs: record E0.1 runtime setup design`).
5. Added `.nvmrc`, package runtime engines, clean-install instructions, and backlog execution status.
6. Kept E0.2 separate because test/lint scripts and CI changes are not yet present and CI workflow files are protected.

## Tests run

- Command: `npm ci --ignore-scripts --cache /private/tmp/milo-phonics-npm-cache`
  - Result: Pass; 189 packages installed. The host Node 25/npm 11 runtime emitted the expected unsupported-engine warning for the declared Node 20/npm 10 contract. npm reported existing dependency audit findings (2 moderate, 6 high); dependency remediation is outside E0.1.
- Command: `npm run build`
  - Result: Pass; TypeScript compilation and Vite production build completed successfully.
- Command: `npm run agent-room:validate`
  - Result: Pass; core files, guardrails, and skill metadata validated.
- Command: `npm run agent-room:doctor`
  - Result: Pass with recommendation; `.git/hooks/pre-commit` is absent. No hook was added because hook setup is outside E0.1.
- Command: runtime contract assertion plus `git diff --check`
  - Result: Pass; `.nvmrc`, package engines, and CI all align on Node 20, and the diff is clean.
- `npm test` and `npm run lint`
  - Result: Not available; scripts do not yet exist. These are explicitly tracked by E0.2.

## Decisions made

- Standardized on Node.js 20.x LTS and npm 10.x because the existing CI workflow already targets Node 20; recorded in `.agent-room/decisions.md`.
- Did not modify `.github/workflows/**` because it is protected and already uses the target Node major.

## Outcome

Completed. E0.1 is marked complete in `docs/plans/technical-delivery-backlog.md`; E0.2 is the next implementation slice.
