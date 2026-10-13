# E0.2 Automated Quality Gates

**Goal:** Add repeatable lint, unit-test, type-check, and production-build gates that run locally and on pull requests.

**Architecture:** Use Vitest because the application already uses Vite and TypeScript, keeping module transformation close to the production toolchain. Use ESLint 9’s flat configuration with `typescript-eslint` for the TypeScript source and Vite config. Extend the existing AgentRoom workflow so one required pull-request job installs the lockfile dependencies, runs lint, runs the unit suite, and builds the production bundle.

**Tech stack:** Node.js 20.x LTS, npm 10.x, TypeScript, Vite, Vitest, ESLint 9, `typescript-eslint`.

---

## Research baseline

- `package.json` has no `test` or `lint` script.
- No test files, Vitest/Jest configuration, or ESLint configuration exists.
- `tsconfig.json` already enables strict TypeScript checks and `npm run build` already performs `tsc` before Vite.
- `.github/workflows/agent-room-validate.yml` runs on pushes to `main` and pull requests targeting `main`, but currently installs only the global AgentRoom CLI and does not install or build the application.
- E0.3 will add focused behavior tests for progress migration, unlocking, audio URL resolution, and the parent gate. E0.2 therefore adds only one small curriculum contract test to prove the harness without duplicating that later test scope.

## Approved design

### Tooling

- Add `vitest`, `eslint`, `@eslint/js`, and `typescript-eslint` as development dependencies. Let npm resolve compatible current versions and commit the resulting lockfile.
- Add `vitest.config.ts` with a Node test environment and an explicit `tests/**/*.test.ts` include pattern.
- Add `eslint.config.js` using the flat-config API, ignoring generated/dependency directories and linting `src` plus `vite.config.ts`.
- Add `tests/curriculumData.test.ts` with a small contract assertion against the existing curriculum data.

### Scripts

- `npm test` → `vitest run`
- `npm run lint` → `eslint src vite.config.ts`
- Keep `npm run build` as the type-check plus production-build gate.

### CI

Add an application-quality sequence to `.github/workflows/agent-room-validate.yml` after Node setup:

1. `npm ci`
2. `npm run lint`
3. `npm test`
4. `npm run build`

The existing AgentRoom validation steps remain in the same workflow. Any failed command produces a failed job; repository branch protection remains an external GitHub setting and is not changed by this task.

## Bite-sized implementation plan

### Task 1: Add the failing test contract

**Files:** Create `tests/curriculumData.test.ts`.

Write a Vitest test that imports `CURRICULUM_LEVELS` and asserts the published curriculum contains seven ordered levels and that the first level begins with `s`, `a`, `t`, `p`. Before the test runner is installed, `npm test` is expected to fail because the script/tooling does not yet exist.

### Task 2: Install and configure Vitest

**Files:** Modify `package.json`, `package-lock.json`; create `vitest.config.ts`.

Add the `test` script and Vitest dependency/configuration. Run `npm test` and expect the curriculum contract test to pass.

### Task 3: Install and configure ESLint

**Files:** Modify `package.json`, `package-lock.json`; create `eslint.config.js`.

Add the `lint` script and TypeScript-aware flat config. Run `npm run lint` and fix only lint findings introduced or exposed by the selected source scope; do not weaken strict TypeScript rules or suppress warnings globally.

### Task 4: Extend pull-request CI

**Files:** Modify `.github/workflows/agent-room-validate.yml`.

Install the locked dependencies and run lint, test, and build on the existing Node 20 workflow before the AgentRoom checks. Run the same commands locally before committing.

### Task 5: Update backlog and serialize the session

**Files:** Modify `docs/plans/technical-delivery-backlog.md`; create a dated `.agent-room/sessions/` log; update `.agent-room/decisions.md` only if implementation reveals a non-obvious choice.

Mark E0.2 complete only after fresh local verification and record E0.3 as the next slice. Commit the implementation separately from the design commit.

## Verification

- `npm ci`
- `npm run lint`
- `npm test`
- `npm run build`
- `npm run agent-room:validate`
- `npm run agent-room:doctor`
- `git diff --check`
- Confirm the workflow contains the same four application-quality commands and remains scoped to Node 20.

## Alternatives rejected

- Jest + `ts-jest`: introduces a second transform/configuration model beside Vite without a current repository need.
- Deferring the unit runner and adding only lint/build: fails the E0.2 acceptance criteria and leaves regressions without an executable test gate.
- Creating a second quality workflow: duplicates checkout/setup and separates application quality from the existing pull-request gate unnecessarily.
