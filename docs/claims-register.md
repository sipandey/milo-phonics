# External Claims Register

**Review date:** 13 October 2026
**Owner:** Unassigned — product, privacy, curriculum, and release owners required
**Status:** Technical guard active; high-risk claims remain paused until evidence and specialist approval exist.

This register controls user-facing claims in the application shell, README, and selected React surfaces. It is not approval to use the paused wording in advertising, app stores, school materials, or distribution metadata. Historical audits and strategic plans may quote a paused claim to explain why it is blocked; the build guard intentionally checks only user-facing surfaces.

## Approved baseline wording

> An interactive, audio-led app with a fixed sequence of introductory letter–sound activities and simple word-blending practice.

This wording describes observed functionality without asserting accreditation, outcomes, age suitability, accent provenance, rights clearance, compliance, or privacy absolutes.

## Paused claims

| Claim ID | Paused wording family | Why paused | Minimum evidence/owner before approval | Current treatment |
| --- | --- | --- | --- | --- |
| C-001 | Oxford, Oxford Advanced Learner’s Dictionary, Oxford-authentic/source claims | Audio provenance, commercial permission, and trade-mark permission are not retained | Rights owner attaches written licence/permission, attribution, territory/term, and asset map | Removed from checked user-facing surfaces; historical records retain the finding |
| C-002 | Pure British, Received Pronunciation, British RP, or equivalent accent-quality claims | No independent pronunciation/accent review is recorded for every published asset | Qualified audio/phonics reviewer signs the complete asset set and rights owner clears source | Removed from checked user-facing surfaces |
| C-003 | Systematic Synthetic Phonics, Letters and Sounds, UK National Curriculum, or accreditation/alignment claims | Current content is a partial sequence and is not a complete independently reviewed programme | Curriculum specialist maps scope, sequence, GPCs, blending, assessment, and review evidence | Removed from checked user-facing surfaces |
| C-004 | COPPA compliant, zero child data, 100% client-side privacy, or equivalent certification/absolute claims | Optional Clerk sync, Google Fonts, hosting logs, and consent-gated Sentry create unresolved data flows | Privacy owner and qualified reviewer approve data-flow, lawful-basis, retention, deletion, transfer, and jurisdiction record | Removed from checked user-facing surfaces |
| C-005 | Toddler-tested, ages 2–3, mastery, learn-to-read, effectiveness, or learning-outcome claims | No approved child-development/usability study or outcome evidence | Research owner records protocol, consent, sample, analysis, limitations, and review | Removed from checked user-facing surfaces |
| C-006 | Cloudinary browser fallback, fully offline/PWA, or equivalent runtime claims | Current resolver uses bundled local assets and no shipped service-worker acceptance path exists | Engineering release evidence must verify the exact runtime and offline matrix | Existing technical wording is constrained; no user-facing fallback claim is allowed |

## Automated guard

`npm run verify:claims` scans these checked-in user-facing surfaces:

- `README.md`
- `index.html`
- `src/components/home/HomeScreen.tsx`
- `src/components/parent/ParentDashboard.tsx`
- `src/components/sounds/OxfordSoundsScreen.tsx`

The command is part of `npm run build`; a matching paused phrase fails the production build and prints the file, line, rule, and matched text. The checker is deliberately narrow and is not a substitute for human review of new marketing, app-store, legal, or distribution surfaces. Add any new user-facing surface to the scanner before release.

## Release checklist

- [x] Paused claim families are recorded with owners and required evidence.
- [x] Existing checked surfaces use the modest baseline description or factual feature wording.
- [x] The build fails when the configured paused patterns reappear.
- [ ] Assign claim owners and review dates.
- [ ] Review all app-store, Vercel, social, sales, school, and distribution copy outside this repository.
- [ ] Obtain rights, SSP/curriculum, privacy, age-suitability, and outcome evidence before approving any paused family.

E1.10 remains **in progress** until the owner/evidence fields are completed and every distribution surface is reconciled.
