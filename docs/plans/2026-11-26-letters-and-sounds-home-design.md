# Letters and Sounds home-teaching design

**Date:** 26 November 2026
**Status:** Approved by the maintainer (26 November 2026). Delivery steps 1–7 implemented on 26 November 2026; use with the child and specialist review are still to come.
**Scope:** Re-direct Milo from a commercial beta toward a parent-led home tool that follows the Letters and Sounds Phases 1–5 structure, for one child aged 3–4 who already knows a couple of letters.

This supersedes the commercial sequencing in `product-roadmap-and-android-strategy.md` and the E5/E7/E8/E9 backlog for current work. Those documents stay as historical strategy.

## Users and goal

- **Teacher:** the parent, who runs a short daily session and judges progress.
- **Learner:** one child aged 3–4 who knows a few letters.
- **Goal:** make 10 good minutes a day easy for the parent to run. The app supports the adult; it does not replace adult talk, modelling, or off-screen play.

## Principles

1. **Daily lesson shape:** Revisit → Teach → Practise → Apply.
2. **Adult-recorded progress:** the app cannot hear the child. After an item, the parent records *not yet*, *with help*, or *secure*. Stars remain child-facing rewards only and never drive progression.
3. **Readiness, not age or automatic unlocks:** every phase, set, and sound is open at any time.
4. **Pure sounds for the adult too:** a parent sound guide models each phoneme.
5. **Short, real-world sessions:** ≤ 10 minutes, each ending with an off-screen activity card.

## Phase strategy for the current child

Run Phase 1 aspects alongside Phase 2, as Letters and Sounds intends. A typical session: one Phase 1 listening game, one Phase 2 sound focus, and one oral blending round (audio and pictures only).

## Start anywhere

- **Curriculum map** (parent-gated): Phase → Set → individual grapheme. Selecting a grapheme opens a **sound page** with every activity for that sound: hear it, letter, picture words, sound-matching (Bubble Pop), initial-sound play (Feed Milo), blending words, and a sound-writing card.
- **Practise these:** the parent selects one or more graphemes as the focus; the Today session is built from them.
- **Sounds he knows:** the parent marks which graphemes have been introduced. This is separate from the focus.
- **Word selection rule:** a blending word must contain at least one focus grapheme and use only known or focus graphemes. If fewer than three words qualify, offer to introduce another grapheme or fall back to oral (letter-free) blending, which has no letter-knowledge requirement.

## Curriculum data

- Restructure the manifest as phase → set → grapheme-phoneme correspondence (GPC) → words, tricky words, captions.
- Phase 2 sets follow Letters and Sounds exactly: `s a t p`; `i n m d`; `g o c k`; `ck e u r`; `h b f ff l ll ss`, plus tricky words *the, to, no, go, I, into*.
- Phase 3 holds `j v w x`, `y z zz qu`, consonant digraphs, vowel digraphs/trigraphs, and its tricky words.
- Phase 1 content covers the seven aspects: environmental, instrumental, body percussion, rhythm and rhyme, alliteration, voice sounds, oral blending and segmenting.
- Extend `verify:curriculum` so every word and caption is decodable from the GPCs and tricky words taught by its position, including multi-letter graphemes.
- Phases 4–5 follow after Phase 3. Phase 6 is out of scope; the app points to matched decodable books instead.

## Progress and sync

- Per item (GPC, tricky word, blending word): status (`not-yet` | `with-help` | `secure`), last-practised date, and practice count.
- Revisit selects `with-help` items not practised for a few days.
- **Keep Clerk sync** using the existing `unsafeMetadata` mechanism with per-item newest-wins merge. Bump the progress version and migrate existing progress using the current content-migration pattern.
- Clerk metadata is limited to roughly 8 KB per user, so the stored shape is compact: short IDs, ISO dates, no event history.
- One child profile now; the shape keys progress by child ID so a second profile can be added later.

## Removed or paused

- **Remove Sentry** (SDK, Vite plugin, consent UI, tests, and documentation) and replace it with a local, child-safe error screen so a crash never shows a blank page.
- Pause commerce, the external claims programme, Android/Play, and school features. Keep the claims build guard as it is; it is cheap and harmless.
- Keep the installable offline PWA, audio reliability work, large touch targets, and no-failure feedback.

## Delivery order

Each step is its own `feature/` branch cut from latest `main`, test-first, within the guardrail limits.

1. Remove Sentry; add the error screen.
2. Curriculum restructure (data only) to Phases 1–5, extended validator, tricky words.
3. Progress v3 with parent marking and Clerk sync migration.
4. Curriculum map, sound pages, and the Practise these picker.
5. Phase 1 activities: Robot Milo oral blending and segmenting, letter-free Feed Milo, rhyme and odd-one-out.
6. Today session (Revisit → Teach → Practise → Apply).
7. Phase 3 content.

## Risks

- **Audio rights:** the bundled phoneme recordings are traced to an unlicensed repository sourcing Oxford dictionary audio. Acceptable only for private family use; keep the deployment private (Vercel protection or local-only) while those files are present.
- **Clerk metadata size:** monitor the serialized size in tests and fail before it approaches the limit.
- **Unobserved pacing:** session length and activity order need checking with the child and adjusting.
