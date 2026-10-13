# Releases and Rollback

This runbook defines the release process for the Vite application. It is an operator procedure, not evidence that the current repository is ready for a public launch.

## Current release state

- Package version: `1.0.0` in `package.json`.
- Release status: unreleased baseline; no production tag is authorized by E0.5.
- Serving-build identity: every Vite build emits `release.json` with `version`, `commit`, and `channel`.
- Runtime source of truth: [current product and architecture](plans/current-product-and-architecture.md).
- Claims/release gate: [pre-marketing audit](audits/pre-marketing-content-rights-privacy-audit-2026-10-13.md).
- Dependency status checked 13 October 2026: `npm audit --omit=dev --audit-level=high` found 0 runtime vulnerabilities; the full audit reported 8 development-tree vulnerabilities, including 6 high-severity findings. Do not use `npm audit fix --force` without reviewing its breaking Tailwind upgrade.

## Pre-release gate

Before changing a version or creating a tag, the release owner must have:

1. A clean working tree and a reviewed `CHANGELOG.md` entry.
2. `npm ci` completed from the committed lockfile.
3. `npm run lint`, `npm test`, `npm run build`, `npm run verify:release`, and `npm run agent-room:validate` passing.
4. No unresolved high or critical dependency findings, or a documented security owner decision that blocks release.
5. Rights/provenance, AI-audio disclosure, privacy/data-flow, parent-safety, educational-scope, and claims reviews closed for the release surface.
6. A rollback target selected: the last known-good deployment and its commit must be identifiable.

If any gate is open, record the blocker and do not tag or promote a production release.

## Version, notes, and tag

Use Semantic Versioning. A backward-compatible feature is a minor bump; a bug-only change is a patch; a breaking contract is a major bump.

```bash
npm version minor --no-git-tag-version
# Edit CHANGELOG.md: move the relevant Unreleased notes under the new version/date.
npm ci
npm run lint
npm test
npm run build
npm run verify:release
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore(release): version X.Y.Z"
git tag -a vX.Y.Z -m "Version X.Y.Z"
git push origin main --follow-tags
```

Do not use `npm version`’s automatic commit/tag behavior here; the release note review and quality gates must be visible before the annotated tag.

## Build identity and deployment smoke check

CI/Vercel should provide the commit and channel before building:

```bash
RELEASE_COMMIT=<full-source-commit> RELEASE_CHANNEL=production npm run build
npm run verify:release
```

After deployment, check the actual serving URL rather than only the local artifact:

```bash
curl --fail --silent --show-error https://<deployment-host>/release.json
```

The response must show the intended `version`, the source `commit`, and `channel: "production"`. Also open the home route, exercise the parent gate, load one local audio asset, and confirm the deployment URL is the candidate being promoted. `release.json` is configured with `Cache-Control: no-store` so this check can identify the serving build.

## Five-minute rollback

The app is stateless for this release slice; E0.5 adds no database migration.

1. Stop promotion and record the failing deployment URL and release metadata.
2. Identify the last known-good deployment/commit from the hosting history or its `/release.json` response.
3. Redeploy that exact known-good deployment using the hosting provider’s rollback/redeploy action. If the provider has no redeploy action, check out the known-good commit in a clean checkout, run the pre-release gates, and deploy that build.
4. Re-run `curl --fail --silent --show-error https://<deployment-host>/release.json`; confirm the version and commit match the rollback target.
5. Smoke-test the home route, parent gate, progress load, and one local audio asset. Record the incident, rollback time, target release, and follow-up owner before investigating the failed release.

Never “fix forward” under release pressure before restoring the last known-good build. If a future release adds irreversible data migrations, this stateless rollback procedure must be replaced with a tested forward/restore plan before tagging.

## Post-release observation

For a real production release, watch errors and key product/availability signals for at least 15 minutes. The repository currently lacks consent-safe client error reporting, so the release owner must use the approved hosting/deployment observability path and must not collect child audio, free text, identifiers, or profiling data.
