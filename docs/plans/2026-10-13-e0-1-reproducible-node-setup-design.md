# E0.1 Reproducible Node/npm Setup

**Goal:** Establish one supported Node.js/npm baseline so a fresh contributor can install and build Milo Phonics using documented steps.

**Architecture:** The repository will declare the supported runtime in `package.json` and pin the minimum compatible Node.js 20 release in `.nvmrc`. `README.md` will reference those same versions and use `npm ci` for lockfile-based installation. The existing GitHub Actions workflow already runs on the Node 20 channel and is protected by AgentRoom guardrails, so it remains unchanged.

**Tech stack:** Node.js 20.19+ LTS, npm 10.x, TypeScript, Vite, React, npm lockfile v3.

---

## Research baseline

- `.github/workflows/agent-room-validate.yml` already uses Node 20.
- `package.json` has no `engines` declaration or package-manager guidance.
- No `.nvmrc` or `.node-version` file exists.
- `README.md` currently documents Node.js 18+ and npm 9+, which is broader and older than the CI baseline.
- `package-lock.json` is present and uses lockfile version 3.
- E0.2 is intentionally deferred: the repository does not yet have `test` or `lint` scripts, and adding those scripts/tooling would expand this slice.

## Approved decision

Support Node.js `>=20.19.0 <21` and npm 10.x. Use `package.json` `engines` as the machine-readable contract, `.nvmrc` as the version-manager hint, and `npm ci` as the documented clean-install command.

## Scope

### Files to create

- `.nvmrc` — contains `20`.

### Files to modify

- `package.json` — add Node.js/npm `engines`.
- `README.md` — align prerequisites and setup steps with the runtime contract.
- `docs/plans/technical-delivery-backlog.md` — record E0.1 as the active/completed execution slice and point to E0.2 as the next separate slice.

### Explicitly out of scope

- `.github/workflows/**` changes; the workflow already uses Node 20 and is protected.
- Adding a test runner or ESLint; those belong to E0.2.
- Dependency upgrades, application code changes, deployment changes, or production releases.

## Verification

1. Confirm `.nvmrc`, `package.json`, `README.md`, and CI all name the same supported Node major line.
2. Run `npm ci --ignore-scripts` to validate the lockfile-based setup when the package registry/cache is available.
3. Run `npm run build` after dependencies are installed.
4. Run `npm run agent-room:validate` and `npm run agent-room:doctor` when the local dependency installation is available.
5. Run `git diff --check` and inspect the final diff for scope and secret violations.
