# Third-Party Dependency Notices and SBOM Record

**Review date:** 13 October 2026
**Application:** `phonics-toddler-app@1.0.0`
**Source of truth:** `package-lock.json` (lockfile version 3)
**Status:** Inventory generated; release artifact retention and licence review remain open.

This record covers npm packages. It does not clear audio, video, fonts, curriculum text, vendor services, or generated content; those are tracked in the [asset rights register](asset-rights-register.md). It is an engineering inventory, not legal advice.

## Reproducible SBOM command

Run the committed script from the repository root:

```sh
npm run sbom:spdx
```

The release job must capture stdout as `sbom.spdx.json` in its approved release-evidence store; do not commit credentials or transient release evidence to the application bundle.

The command uses npm 11's lockfile-only resolver and emits SPDX 2.3 JSON. The release owner must retain the resulting file with the release evidence and review any package or licence change before distribution. The output includes package versions, registry locations, integrity checksums, declared licences, and dependency relationships.

## Lockfile snapshot

The 13 October 2026 lockfile contains 410 package entries. Every entry has a declared `license` field. The licence identifiers are distributed as follows:

| Licence identifier | Package entries |
| --- | ---: |
| MIT | 346 |
| ISC | 17 |
| Apache-2.0 | 19 |
| BSD-2-Clause | 10 |
| BSD-3-Clause | 2 |
| BlueOak-1.0.0 | 5 |
| FSL-1.1-MIT | 9 |
| CC-BY-4.0 | 1 |
| 0BSD | 1 |

The snapshot is derived from the committed lockfile, not from a live registry lookup. Licence text and package notices remain available in the resolved npm package metadata and must be retained with the generated release artifact where redistribution requires them.

## Direct runtime dependencies

| Package | Locked version | Declared licence | Runtime role |
| --- | --- | --- | --- |
| `@clerk/clerk-react` | 5.61.9 | MIT | Optional parent account surface |
| `@sentry/react` | 11.7.0 | MIT | Optional parent-consented diagnostics |
| `canvas-confetti` | 1.9.4 | ISC | Celebration effect |
| `lucide-react` | 0.475.0 | ISC | UI icons |
| `react` | 18.3.1 | MIT | UI runtime |
| `react-dom` | 18.3.1 | MIT | Browser renderer |

## Direct development and build dependencies

| Package | Locked version | Declared licence | Use |
| --- | --- | --- | --- |
| `@eslint/js` | 10.0.1 | MIT | Lint configuration |
| `@sentry/vite-plugin` | 5.4.1 | MIT | Optional release upload integration |
| `@types/canvas-confetti` | 1.9.0 | MIT | Type declarations |
| `@types/react` | 18.3.31 | MIT | Type declarations |
| `@types/react-dom` | 18.3.7 | MIT | Type declarations |
| `@vitejs/plugin-react` | 4.7.0 | MIT | Vite React transform |
| `autoprefixer` | 10.6.0 | MIT | CSS build transform |
| `cloudinary` | 2.11.0 | MIT | Audio publication tooling |
| `create-agent-room` | 2.3.1 | MIT | AgentRoom workflow tooling |
| `dotenv` | 16.6.1 | BSD-2-Clause | Local/build configuration |
| `eslint` | 10.12.0 | MIT | Linting |
| `openai` | 4.104.0 | Apache-2.0 | Development-only audio generation |
| `postcss` | 8.5.28 | MIT | CSS processing |
| `tailwindcss` | 3.4.19 | MIT | CSS utilities |
| `tsx` | 4.23.13 | MIT | TypeScript scripts |
| `typescript` | 5.6.3 | Apache-2.0 | Type checking |
| `typescript-eslint` | 8.71.2 | MIT | TypeScript linting |
| `vite` | 6.4.3 | MIT | Build/dev server |
| `vitest` | 4.1.11 | MIT | Tests |

## Review flags

- `FSL-1.1-MIT` appears on `@sentry/cli` and its platform packages. These are development/release tooling dependencies, but the licence and redistribution treatment still require release-owner review.
- `CC-BY-4.0` appears on `caniuse-lite`, a build-time browser-compatibility data package. Retain its attribution treatment with the generated notices.
- `BlueOak-1.0.0` appears on several npm tooling packages. Keep the exact licence text in the release evidence rather than normalizing it to MIT.
- Package licences do not approve Clerk, Sentry, Cloudinary, OpenAI, Google Fonts, hosting, or other service terms. Those vendor/data-flow records remain separate release gates.

## Release checklist

- [x] Lockfile has a reproducible SPDX SBOM command.
- [x] Direct runtime and build dependency inventory is recorded.
- [x] Non-MIT licence families are called out for review.
- [ ] Attach the generated `sbom.spdx.json` to a release-evidence store.
- [ ] Retain full licence/notice text for every redistributed package.
- [ ] Obtain engineering/release-owner review of `FSL-1.1-MIT`, `CC-BY-4.0`, and `BlueOak-1.0.0` treatment.

Until the unchecked items are completed, E1.1 remains in progress and this document must not be presented as a complete legal notice bundle.
