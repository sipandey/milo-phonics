# E0.5 Release Versioning and Rollback — Design

**Date:** 13 October 2026  
**Backlog item:** E0.5 — versioned releases and rollback instructions  
**Workflow:** AgentRoom RPI — Enhancement + release-management gate

## Goal

Make every future build identify its application version and source commit, provide human-readable release notes, and give an operator a tested five-minute rollback path without treating the current audit-held repository as production-ready.

## Recommended approach

1. **Build identity from the package version:** Keep `package.json` as the single version input. Extend the Vite build to emit `dist/release.json` containing the package version, deployment commit (from `RELEASE_COMMIT`, Vercel, or GitHub environment), and channel. Keep the artifact uncached so a deployment smoke check reads the serving build’s identity.
2. **Mechanical verification:** Add `npm run verify:release` to compare `dist/release.json.version` with `package.json.version` and fail on a missing or mismatched artifact. Test the metadata formatter first, then verify the actual Vite output after build.
3. **Release record and rollback:** Add `CHANGELOG.md` with an Unreleased section and `docs/releases-and-rollback.md` covering SemVer/version bump commands, annotated tags, required quality gates, Vercel deployment identity, smoke checks, and rollback by redeploying the last known-good commit/deployment. Explicitly state that no production tag is authorized while the P0 audit and security/release gates remain open.

## Data flow and error handling

- Local builds use `channel: local` and `commit: local` when CI/deployment variables are absent.
- CI/Vercel builds preserve the source commit identifier in `release.json`; missing commit metadata is visible rather than guessed.
- `release.json` is served with `Cache-Control: no-store` so a post-deploy smoke check cannot read a stale identity.
- Rollback is stateless redeployment of a known-good commit/deployment. No database migration or irreversible schema change is introduced by E0.5.

## Release readiness boundary

E0.5 establishes the process and artifact, not a release. The current repository remains blocked from broad production/marketing release by the audit’s rights, privacy, educational, claims, and AI-audio disclosure findings, plus the full-audit development-tree findings recorded in the runbook. A future release owner must re-run those checks at tag time.

## Non-goals

- No automatic production deploy, tag, or version bump in this task.
- No runtime feature flags, database migrations, analytics, or error-reporting implementation.
- No claim that Vercel or another host has been production-verified; the repository documents the smoke check to run against the actual deployment URL.

## Verification

Write the formatter test first and confirm red. Then run the focused test, `npm run build`, `npm run verify:release`, the existing lint/unit/build gates, AgentRoom validation, and `git diff --check`. Review `dist/release.json` and the release/rollback document before committing.
