# Early Years Audit: User Stories

**Status:** Implementation pass in progress. Code changes and automated checks are recorded below; practitioner, family, child, and specialist review remains outstanding where noted. Priorities indicate suggested order, not an approved delivery schedule.

**Outcome:** Help children explore sounds at a pace suited to their development, while giving adults an honest picture of participation and practical ways to support learning.

The audit did not include observation of children or a complete listening review of audio. Validate the assumptions below with early years practitioners and families before treating them as evidence of learning.

## P0 — Trustworthy curriculum and progress

### US-01: Keep blending words within the taught curriculum

**Delivery note (16 November 2026):** Corrected Q/X grapheme-to-phoneme mapping, moved *bed* and *box* to the appropriate levels, and added `npm run validate:curriculum` to check all blending words. Automated check passes for 38 words. Phonics specialist sign-off is still needed before claiming pedagogical approval.

**As a child learning to blend**, I want to practise words made from sound–letter correspondences I have encountered, so that I can apply what I have learned.

**Acceptance criteria**

- Each word offered for a level uses only correspondences introduced by that level; audit the complete word list, including *bed* and *box*.
- Represent a word's graphemes and phonemes accurately, including cases such as the two sounds /k/ and /s/ represented by **x** in *fox*. Do not assume one printed letter always equals one sound box.
- A phonics specialist reviews exceptions and the sequence before affected words are offered as decodable practice.
- A maintainable check flags future words that introduce untaught correspondences or have inconsistent sound mappings.

### US-02: Describe participation honestly

**Delivery note (16 November 2026):** Parent progress labels now say “Exploration Progress” and explain stars as repeated activity, not evidence of sound knowledge. Existing progress storage remains compatible; available play sets remain selectable.

**As a parent**, I want to see what my child has explored, so that I understand their activity without mistaking taps for mastery.

**Acceptance criteria**

- Progress based on taps or visits is labelled as participation or exploration, with a brief explanation of what it measures.
- Stars and automatic progression are not presented as proof that a child recognises, produces, or can blend a sound.
- Existing stored progress remains usable, and parents can revisit available material.
- If assessment is introduced later, independently correct responses and responses supported by hints are recorded and described separately.

## P1 — Developmentally appropriate play

### US-03: Explore sounds before formal decoding

**Delivery note (16 November 2026):** Added an always-available picture-and-word “Listen & Talk” pathway with no letters or unlock requirement. It uses familiar object words and invites adult conversation. Practitioner and family review is still needed before expanding the content.

**As a young child beginning to listen and talk**, I want to play with familiar sounds and pictures, so that I can enjoy language before I am ready to blend printed words.

**Acceptance criteria**

- An adult can choose a listening and language pathway without needing to unlock a phonics level.
- The pathway includes familiar objects or environmental sounds and gives space for an adult to talk, sing, or play alongside the child.
- Activities communicate the main action through sound and visuals; reading is not required.
- Letter and blending activities remain available when the adult judges the child ready; age is guidance, not a gate.
- Prototype content and interactions are reviewed with practitioners and families before expansion.

### US-04: Repeat and move on at my own pace

**Delivery note (16 November 2026):** Replay and Continue are visible in toddler focus mode; automatic advancement was removed from both play and blending. Adults can toggle repeat prompts in Parent Dashboard (off by default). Real child observation is still required to evaluate pacing.

**As a child**, I want to hear and explore an item again and choose when to continue, so that I have time to enjoy and understand it.

**Acceptance criteria**

- The current item has an obvious, large touch target for replay and a clear way to continue.
- Replaying does not automatically move the child to a different item.
- Automatic audio prompts can be reduced or disabled by an adult; they do not prevent navigation or interaction.
- Observe children using the proposed pacing and adjust it using the findings, including children who prefer longer pauses.

### US-05: Match the listening task to readiness

**Delivery note (16 November 2026):** Listen & Talk now offers a picture-only “Listen and find” choice activity, replay, gentle retry feedback, and an optional adult hint. The app does not record this as an assessment. Choice order and feedback need observation with children.

**As a child developing listening skills**, I want choices that make sense to me, so that I can practise hearing differences without needing skills I have not yet developed.

**Acceptance criteria**

- The listening pathway offers concrete picture or sound choices before requiring recognition of printed letters.
- Letter-based sound matching is available for children ready to connect phonemes with graphemes.
- An incorrect choice receives gentle feedback and another opportunity, without a penalty or failure screen.
- Hints are clearly treated as help rather than independent evidence of a correct answer.

### US-06: Take an active turn in blending

**Delivery note (16 November 2026):** Sound Train keeps individual grapheme sound controls, prompts the child to have a go before hearing the whole word, and leaves replay/next under child or adult control. Multi-sound graphemes such as x are kept in one carriage and play their phonemes in sequence. UI and curriculum checks pass; an adult should confirm the attempt pause works as intended with children.

**As a child ready to blend**, I want to hear individual sounds, try the word myself, and then hear the whole word, so that I can practise joining sounds together.

**Acceptance criteria**

- The child can replay individual sounds and the whole word using large, clearly associated controls.
- The activity allows a pause for the child's attempt before revealing or playing the whole word; the child or adult can proceed when ready.
- Sound indicators correspond to phonemes and their graphemes, including multi-letter graphemes and letters representing more than one sound.
- Audio interruptions and replay leave the activity responsive and navigable.

## P1 — Content and adult support

### US-07: Recognise what a picture represents

**Delivery note (16 November 2026):** Added the contextual sentence to the toddler blend reveal. See `docs/reviews/early-years-content-decisions.md` for current picture decisions and review questions. Device and child review remain outstanding.

**As a child**, I want pictures and animations that clearly match the word I hear, so that I can connect the sound with its meaning.

**Acceptance criteria**

- Review early vocabulary and images for familiarity and ambiguity, including *sat*, *at*, and *sap*.
- Replace or support ambiguous images with a clear illustration, action, animation, or spoken context appropriate to the word.
- Check representative content with children and adults, including on devices where emoji render differently.
- Record content decisions and unresolved ambiguities for pedagogical review.

### US-08: Support play together

**Delivery note (16 November 2026):** Added concise, optional grown-up prompts in Listen & Talk and sound play, inviting pausing, interest-led talk, and home languages without requiring a response.

**As a parent or carer**, I want a short suggestion for talking or playing with my child, so that the activity can continue away from the screen.

**Acceptance criteria**

- An adult can find a brief, practical suggestion connected to the current activity, such as finding another object with the same initial sound.
- Guidance encourages the adult to pause, listen, and follow the child's interest; it does not require a correct spoken response.
- Guidance welcomes use of the child's home language and does not promise a learning outcome.
- Adult guidance does not obstruct the child's main activity.

### US-09: Review sounds and educational claims

**Delivery note (16 November 2026):** Replaced unsupported Oxford-authenticity and voice-quality claims in Parent Dashboard with a transparent source/review status. The specialist listening checklist is in `docs/reviews/audio-and-claims-review.md`; no specialist audio approval is claimed.

**As a parent or educator**, I want accurate audio and clear descriptions of the curriculum, so that I can trust what the app teaches and claims.

**Acceptance criteria**

- A suitably experienced phonics specialist listens to the phonemes and representative blends, recording issues and approvals before revised audio is released.
- Review covers clarity and consistency of vowels and stop sounds, as well as whether sounds blend naturally in context.
- Product and curriculum descriptions match the implemented sequence and distinguish alignment aspirations from verified status.
- Remove or substantiate claims of formal validation, accreditation, or proven learning outcomes.

## P2 — Learn from real use

### US-10: Observe and improve the experience

**Delivery note (16 November 2026):** Prepared the observation guide at `docs/research/early-years-observation-guide.md`. No children or families have been observed in this implementation pass; findings and prioritisation remain pending fieldwork.

**As a product team member**, I want to observe children and adults using the activities, so that changes respond to actual needs rather than assumptions.

**Acceptance criteria**

- Prepare an observation guide covering understanding of actions, replay, picture recognition, engagement, pacing, and adult involvement.
- Include children across the intended developmental range and record context and limitations; do not infer conclusions from age alone.
- Summarise observations, uncertainty, and proposed changes without presenting a small study as proof of effectiveness.
- Feed findings into prioritisation and retain a decision record for the next iteration.

## P1 — Mobile clarity and child control

### US-11: Listen for the answer, not its position

**Delivery note (16 November 2026):** Varied the correct answer position and distractors each round. Playwright at 320×568 verified Apple in the third position, Cat in the second, Dog in the second; a wrong choice retained the round and showed gentle retry feedback.

**As a child playing “Listen and find,”** I want the right picture to appear in different places, so that I can choose by listening rather than tapping a pattern.

**Acceptance criteria**

- The correct picture is not consistently in the same position.
- Distractors vary across rounds and the target remains available to replay.
- A wrong choice gives gentle feedback and does not advance or penalise the child.

### US-12: Keep mobile screens visible and easy to navigate

**Delivery note (16 November 2026):** App navigation resets scroll to the top. At 320×568, Sound Train now reduces the companion and action dock for short screens; the meaning sentence ends above the footer and Again/Next remain visible. At 390×844 and 320×568 there is no horizontal overflow.

**As a child using a small phone,** I want each activity to open at its beginning and keep its words and controls visible, so that I know where I am and what I can do next.

**Acceptance criteria**

- Navigating to a new activity starts at its top.
- At 320×568 and 390×844, important text is not covered by controls and all primary controls can be reached.
- Layout does not introduce horizontal scrolling.

### US-13: Find one clear place to start

**Delivery note (16 November 2026):** Toddler-focus home now leads with Listen & Talk and Let’s Play; the other activities are available under a collapsed “More games” disclosure. Child-facing star counters are hidden in toddler mode, the home prompt is more specific, and ambient bubbles/repeating button badges were removed. Playwright confirmed two primary choices, collapsed optional games, and a clean 390×844 layout; at 320×568 the home can scroll vertically without horizontal overflow.

**As a young child opening the app,** I want one or two clear activities to choose from, so that I can start without sorting through many games.

**Acceptance criteria**

- Toddler-focus home presents no more than two primary activity choices.
- Other activities remain available through a clearly named “More games” area and are not age-locked.
- The child-facing home and toddler-focus activity headers do not prominently display activity stars.
- Non-interactive decorative motion does not compete with the activity.

### US-14: Keep grown-up guidance out of the child’s way

**Delivery note (16 November 2026):** Listen & Talk grown-up suggestions and hints are now collapsed disclosures. Playwright confirmed they are closed by default and the picture cards remain the focus at 390×844 and 320×568.

**As a parent or carer,** I want practical play suggestions available when I need them, so that my child can focus on the pictures and sounds during play.

**Acceptance criteria**

- Adult guidance is available but collapsed by default.
- The child activity and its main controls remain the visual focus on phone screens.
- Guidance still welcomes the child’s home language and interest-led play.

## Suggested sequence

1. Audit and correct curriculum mappings (US-01), then clarify existing progress labels (US-02).
2. Prototype child-controlled pacing and the listening pathway (US-03–US-05), and review them with families and practitioners (US-10).
3. Refine blending, visual content, and adult guidance (US-06–US-08), informed by observation.
4. Complete specialist audio and claims review (US-09) before making stronger educational or institutional claims.
5. Address the mobile clarity stories (US-11–US-14) and check the changes at compact and standard phone sizes.
