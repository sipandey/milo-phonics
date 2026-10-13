# E0.4 Current Product and Architecture Record Implementation Plan

**Goal:** Establish one current product/architecture source of truth and reconcile active documentation with the implemented local-first audio and data behavior.
**Architecture:** Add a canonical current record, keep the technical backlog as delivery control, and add explicit authority banners to older plans. Update only active user/developer guidance where it makes claims about runtime behavior.
**Tech stack:** Markdown documentation, repository search, AgentRoom validation, existing npm lint/test/build gates.

---

### Task 1: Create and approve the current-record boundary

**Files:**
- Create: `docs/plans/current-product-and-architecture.md`
- Modify: `.agent-room/decisions.md`

**Step 1: Write the current record**

Include the implementation status, runtime layers, local-first audio resolver, storage/data-flow caveats, claims hold, verified roadmap status, document hierarchy, and links to the audit and technical backlog.

**Step 2: Verify the record is self-contained**

Run: `rg -n "source of truth|local-first|speechSynthesis|Cloudinary|Clerk|claims|technical-delivery-backlog" docs/plans/current-product-and-architecture.md`

Expected: each authority and runtime fact is stated explicitly.

**Step 3: Record the source-of-truth decision**

Append the E0.4 decision to `.agent-room/decisions.md` before reconciling dependent documents.

**Step 4: Commit**

Commit the design/authority boundary before implementation edits.

### Task 2: Reconcile active product and audio guidance

**Files:**
- Modify: `README.md`
- Modify: `docs/audio-generation.md`

**Step 1: Replace unsupported current claims**

Use the audit-approved modest product description, disclose the optional account/data path, and avoid absolute privacy, Oxford, SSP, age-suitability, and compliance claims.

**Step 2: Correct audio flow**

Document local bundled URLs as runtime-first, Cloudinary as generation/manifest metadata, and the absence of browser `speechSynthesis` and on-error CDN fallback.

**Step 3: Verify active guidance**

Run: `rg -n -i "speech.?synthesis fallback|browser plays Cloudinary|Cloudinary fallback|zero child data|COPPA compliant|Letters and Sounds aligned|UK National Curriculum aligned" README.md docs/audio-generation.md`

Expected: no stale active claims remain; any retained terms are explicitly described as unsupported or gated.

### Task 3: Mark older plans and status records

**Files:**
- Modify: `docs/plans/phonics-architecture-and-roadmap.md`
- Modify: `docs/plans/international-phonics-product-roadmap.md`
- Modify: `docs/plans/product-roadmap-and-android-strategy.md`
- Modify: `docs/plans/technical-delivery-backlog.md`

**Step 1: Add authority banners**

Mark the early architecture document as historical, the international roadmap as aspirational, and the product roadmap as strategic. Point all readers to the current record for implemented facts.

**Step 2: Advance the execution slice**

Mark E0.4 complete in the technical backlog and identify E0.5 as the next item only after verification passes.

**Step 3: Check links and drift markers**

Run: `rg -n "current-product-and-architecture|technical-delivery-backlog|Historical|Aspirational|Strategic" docs/plans README.md`

Expected: each non-authoritative document points to the canonical record and the backlog remains the execution source.

### Task 4: Verify and ship

**Files:**
- Create: `.agent-room/sessions/YYYY-MM-DD-HH-MM-e0-4-current-product-architecture.md`
- Modify: `.agent-room/anti-patterns.md` or `.agent-room/decisions.md` as required by closing-the-loop review

**Step 1: Run verification**

Run: `git diff --check`, `npm run lint`, `npm test`, `npm run build`, and `npm run agent-room:validate`.

Expected: all commands exit 0.

**Step 2: Review the diff**

Confirm no runtime source or generated asset changed and that all stale wording changes are intentional.

**Step 3: Commit and push**

Set the repository committer identity, commit the E0.4 documentation changes, verify the commit identity, and push `main` because the user explicitly requested pushing completed slices.
