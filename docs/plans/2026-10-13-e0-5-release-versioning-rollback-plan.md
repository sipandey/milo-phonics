# E0.5 Release Versioning and Rollback Implementation Plan

**Goal:** Emit a traceable release identity, add release notes and rollback instructions, and make the serving build verifiable without launching a production release.
**Architecture:** Derive release metadata from `package.json` in Vite, emit a no-store `release.json` artifact, and keep release operations documented and operator-driven.
**Tech stack:** TypeScript, Vite plugin API, Node `fs`, Vitest, npm scripts, Vercel static deployment.

---

### Task 1: Design and release boundary

**Files:**
- Create: `docs/plans/2026-10-13-e0-5-release-versioning-rollback-design.md`
- Create: `docs/plans/2026-10-13-e0-5-release-versioning-rollback-plan.md`
- Modify: `.agent-room/decisions.md`

**Step 1: Record the no-release boundary**

Document that E0.5 establishes infrastructure only; P0 audit and release-readiness gates still control any production tag.

**Step 2: Commit the design**

Commit the design and plan before implementation edits.

### Task 2: Write the failing release metadata test

**Files:**
- Create: `tests/releaseMetadata.test.ts`

**Step 1: Write the failing test**

Test that `createReleaseMetadata('1.0.0', 'abc123', 'preview')` returns the exact version, commit, and channel contract.

**Step 2: Run the focused test**

Run: `npx vitest run tests/releaseMetadata.test.ts`

Expected: FAIL because `src/release/releaseMetadata.ts` does not exist yet.

### Task 3: Implement and emit build identity

**Files:**
- Create: `src/release/releaseMetadata.ts`
- Modify: `vite.config.ts`
- Modify: `vercel.json`
- Create: `scripts/verify-release.ts`
- Modify: `package.json`

**Step 1: Implement the minimal formatter**

Add typed `ReleaseMetadata` and `createReleaseMetadata` with explicit defaults.

**Step 2: Verify focused green**

Run: `npx vitest run tests/releaseMetadata.test.ts`

Expected: PASS.

**Step 3: Add the Vite artifact plugin**

Read `package.json` version in `vite.config.ts`; choose deployment commit/channel from explicit environment variables; emit `release.json` with no secrets.

**Step 4: Add the verification command**

Make `npm run verify:release` fail if `dist/release.json` is absent, malformed, or has a version different from `package.json`.

**Step 5: Disable release-artifact caching**

Add a Vercel `release.json` header with `Cache-Control: no-store` while preserving existing audio caching.

### Task 4: Add release notes and rollback runbook

**Files:**
- Create: `CHANGELOG.md`
- Create: `docs/releases-and-rollback.md`
- Modify: `README.md`

**Step 1: Add the changelog**

Create an Unreleased section describing the current baseline and a rule that release entries are written before tags.

**Step 2: Add the runbook**

Document pre-release gates, version bump/tag commands, deployment identity check at `/release.json`, post-deploy checks, and the five-minute rollback path using the last known-good deployment/commit. State that database migrations are not part of E0.5.

**Step 3: Link the runbook**

Link it from README’s release/governance section without claiming a production deployment.

### Task 5: Verify and ship the process

**Files:**
- Create: `.agent-room/sessions/YYYY-MM-DD-HH-MM-e0-5-release-versioning-rollback.md`
- Modify: `.agent-room/decisions.md` or `.agent-room/anti-patterns.md` if closing-the-loop review requires it

**Step 1: Run all gates**

Run: `npm run lint`, `npm test`, `npm run build`, `npm run verify:release`, `npm run agent-room:validate`, and `git diff --check`.

Expected: all commands exit 0; `dist/release.json` identifies version `1.0.0` and the local/build channel.

**Step 2: Inspect release readiness**

Run the dependency/security check required by the release runbook. If findings remain, record that no production tag is authorized.

**Step 3: Commit and push**

Commit the release infrastructure and runbook, verify committer identity, and push `main` because the user explicitly authorized pushes.
