# Milo Phonics: Product Roadmap and Android Strategy

> **Status: strategic roadmap, not the current implementation record.** Use the [current product and architecture record](current-product-and-architecture.md) for shipped facts and the [technical delivery backlog](technical-delivery-backlog.md) for ordered engineering work. This document contains hypotheses, release gates, and future investment options.

**Decision owner:** Product

**Assessment date:** 13 October 2026

## Decision summary

Milo Phonics has the makings of a differentiated early-literacy product: calm, audio-first play; pure British sounds; a recognisable companion; short games; and an intentionally low-pressure child experience. The current application is a promising learning-play prototype, not yet a market-ready reading product or a commercial platform.

The next investment should be in evidence, a coherent learning journey, offline web quality, and a small paid beta. Do not make an Android store launch the immediate priority. First ship an installable offline PWA and prove that families return and that children progress through the first sound sets. Build an Android release through Capacitor once either Android represents a material share of active devices or schools require a managed Android app.

The recommended commercial sequence is:

1. Parent-led B2C beta for British-English families and English-as-an-additional-language (EAL) households.
2. A paid family plan once the learning journey has recurring value.
3. Three to five nursery/Reception pilots, then a school licence only after the parent and teacher workflows are validated.

No advertising, behavioural targeting, or child-facing purchasing should be part of the model.

## Product today

### What exists

The React/TypeScript application already has a good tactile core:

- 26 letter phonemes, 84 curriculum words, 38 CVC words and sentences, and local audio/video assets.
- A seven-set synthetic-phonics progression, guided "Let's Play" flow, Sound Train blending, Bubble Pop auditory discrimination, and Feed Milo initial-sound play.
- A parent gate, local progress, and optional parent cloud backup through Clerk.
- Child-friendly mechanics: large touch targets, no timers or lives, positive error recovery, and pre-recorded British-accent audio.

The product bundle is about 14 MB before the JavaScript application bundle, including 11 MB of audio and 2.6 MB of video. Core content is locally packaged, which is a good starting point for an offline product.

### Strength to keep

The best positioning is not "another alphabet app." It is:

> **A calm, British-English first-reading companion that helps children hear, say, blend, and read their first words in short daily play.**

The particular defensible combination is pure phoneme modelling, systematic sound order, zero-shame practice, and a parent-visible learning journey. Milo should remain the emotional anchor, but the curriculum and learning proof must be the reason a parent chooses and keeps the product.

### Gaps that prevent broad adoption today

| Gap | Why it matters | Release decision |
| --- | --- | --- |
| No validated outcome or user evidence | The product cannot credibly promise reading readiness or choose the right paywall without showing activation, retention, or learning progress. | Run a parent/child pilot before broad paid acquisition. |
| Incomplete reading journey | The app reaches CVC blending, but lacks a connected path through digraphs, controlled text, review, and a parent-facing next step. | Complete the beginner pathway before a subscription launch. |
| No product analytics or payment system | There is no way to measure acquisition, learning engagement, conversion, or retained revenue. | Add privacy-first, parent-consented measurement and entitlement management. |
| PWA is planned but absent | There is no web manifest or service worker, so reliable offline installation is not delivered yet. | Make offline PWA the first mobile distribution milestone. |
| Documentation drift | Earlier architecture and audio documents described browser speech-synthesis and Cloudinary-first playback, while current code uses local pre-recorded audio. | The current product and architecture record is now authoritative; keep older plans explicitly strategic or historical. |
| Rights and claims not evidenced in the repo | The app states that it uses Oxford Dictionary recordings and is COPPA compliant. Commercial distribution needs documented audio, character, image, TTS, and privacy rights; it also needs legal review of public claims. | Treat this as a hard launch gate. Do not use "Oxford," "DfE-aligned," or compliance claims externally without evidence and approval. |

## Target customer and first job to solve

### Beachhead: parent-led home use

Start with parents of children aged **3–5** who want British pronunciation and a short, low-conflict daily routine. The strongest early segment is families using British English at home, bilingual/EAL families, and parents whose child will enter a UK or British-international Reception setting.

Children aged 2–3 can enjoy sound play, but they should not determine the core curriculum promise. Their experience should be a simplified discovery mode. The measurable product outcome should be for a 3–5-year-old to recognise taught sounds, blend taught CVC words, and carry that confidence into a small decodable reader.

### Second market: British-international early-years settings

Schools are attractive because the British-sound promise travels well to international nurseries and Reception classrooms. They should be pursued after the home journey works. Schools need evidence, teacher time savings, class setup, data protections, and an easy home-school bridge; none is yet a complete product capability.

### Product promise to test

> In 10 minutes a day, Milo gives a child a playful route from hearing a sound to reading their first British-English words, while showing the parent what to practise next.

Test this with parents before treating it as a public claim. The product should describe observed progress, not guarantee literacy outcomes.

## Commercial model

### Recommended model

| Offer | Contents | Pricing hypothesis to test | Why it fits |
| --- | --- | --- | --- |
| Free starter | First sound set, one replayable game, first CVC blend, and a parent progress preview | Free | Lets a parent assess the voice, child response, and the learning style without child-facing pressure. |
| Milo Family Annual | Full beginner pathway, new practice packs/readers, offline access, up to two child profiles, parent progress summaries | £34.99–£44.99/year, with monthly only if research supports it | An annual plan maps to a reading stage and has lower churn than a content-light monthly subscription. |
| Founder lifetime option | The launch curriculum only; no promise of every future content pack | £29.99–£39.99, limited beta test | A useful acquisition and cash-flow experiment if the annual offer is not yet ready. |
| School pilot | Classroom access, teacher setup, named parent handouts, cohort report | Free or heavily discounted for 8–10 weeks | Buys structured evidence and referral potential. |
| School licence | Classroom/centre access, teacher dashboard, family continuation offer | Test £400–£1,000 per classroom or £1,500–£5,000 per small site annually | Sell a clear workflow and support outcome, not seat counts alone. |

These are pricing hypotheses, not a revenue forecast. Test willingness to pay with interviews and a real checkout before building expensive school administration.

### Illustrative revenue maths

Gross recurring revenue is simple to model before tax, payment fees, store commissions, support, and acquisition cost:

| Scenario | Assumption | Annual gross revenue |
| --- | --- | --- |
| Early B2C proof | 500 family subscribers × £40 | £20,000 |
| Meaningful niche B2C | 2,500 family subscribers × £40 | £100,000 |
| Mixed model | 2,500 families × £40 plus 25 classrooms × £600 | £115,000 |
| Established mixed model | 10,000 families × £40 plus 100 classrooms × £750 | £475,000 |

The financial question is not the list price; it is whether the first-week experience produces a weekly habit and whether paid content continues to matter through the child’s next reading stage. Track acquisition cost, free-to-paid conversion, annual-plan refund rate, weekly active family rate, and renewal intent before forecasting profits.

### Acquisition path

1. Recruit 20–30 parent beta families through local nurseries, British-parent communities, and EAL groups. Do not buy broad paid traffic first.
2. Turn confirmed parent outcomes and short child-safe testimonials into an educator/parent landing page.
3. Offer a “first sounds at home” printable or short parent guide to collect parent email consent outside the child experience.
4. Recruit three to five school pilots through early-years practitioners. Supply implementation materials and a simple observation template.
5. Use school referral codes and parent continuation offers only after the parent experience is paid and stable.

## Roadmap

### Phase 0 — Make the product sellable and measurable (0–6 weeks)

| Priority | Deliverable | Definition of done |
| --- | --- | --- |
| P0 | Rights, privacy, and claims review | Written proof for every commercial asset; privacy policy; child-data map; vendor/SDK review; approved public wording. |
| P0 | Single curriculum specification | One age band, sound order, weekly outcomes, mastery signals, CVC set, and review rules signed off by a qualified phonics adviser. |
| P0 | Parent/child research | 20 interviews and 10 observed sessions. Record where a child disengages, what a parent understands, and whether the sound model is trusted. |
| P0 | Event plan | Parent-consented, minimal event set: acquisition source, first-session activation, completed practice, replay, wrong/correct first attempt, weekly return, and paywall exposure. Avoid names, recordings, advertising IDs, and child profiling. |
| P0 | Product surface cleanup | Replace upcoming-feature teasers with only working activities; reconcile the two existing roadmap documents; correct stale audio architecture documentation. |

**Success threshold:** At least 60% of research families can complete a first guided session without help, and at least half voluntarily return for three separate days in the first week. These are starting thresholds to refine with the pilot, not claims of learning efficacy.

### Phase 1 — Finish the paid beginner journey and PWA (6–14 weeks)

| Priority | Deliverable | Why it comes now |
| --- | --- | --- |
| P0 | Guided path from first sounds through CVC | Progress should unlock by demonstrated practice and spaced review, not only taps or star count. |
| P0 | Parent weekly summary | Show sounds practised, blends attempted, suggested next play, and a plain-language caveat that it is practice data rather than a diagnostic assessment. |
| P0 | Offline installable PWA | Add manifest, icons, install prompt, versioned service-worker caching, offline update behaviour, and an offline acceptance test on phones/tablets. |
| P1 | First digraph pack and decodable micro-reader | Makes the subscription valuable after initial CVC novelty ends. Create only after the core path is observed to work. |
| P1 | Parent-gated subscription prototype | Paywall, terms, restore purchase, and entitlement state. Keep it out of the child flow. |

**Success threshold:** A weekly active family rate that is high enough to justify paid acquisition, parent comprehension of the next-step summary, and clear willingness to pay from at least five beta families. Set the numerical conversion target after seeing the free funnel.

### Phase 2 — Prove retention and pricing (3–6 months)

- Run a 100–200 family web/PWA beta with two packaging or pricing options.
- Release the first recurring content cadence: one new reader or practice pack per fortnight, with planned review content.
- Add adult-only profiles and optional parent account backup only after the privacy audit.
- Test an annual plan first. A subscription must provide recurring value; avoid a monthly subscription for a static one-time curriculum.
- Produce a public evidence page based on real parent feedback and clearly described pilot methodology.

**Decision gate:** Proceed to Android Play launch when the beta meets the agreed retention target, has a validated paid offer, and Android demand is demonstrated by device analytics or school procurement requirements.

### Phase 3 — Institutional pilot (6–12 months)

- Run three to five structured classroom pilots with written data-processing agreements.
- Build the smallest teacher workflow: class setup, no child-created accounts, assigned sound set, printable or QR home practice, and aggregate cohort view.
- Add teacher observations as teacher-entered evidence. Do not infer attainment from a child’s app taps alone.
- Defer detailed EYFS reporting, multi-touch whiteboard features, and broad language localisation until pilot teachers identify a repeated need.

## Android assessment

### Is an Android app valuable?

**Yes, conditionally.** Android is valuable when it provides a better route to the customers above: app-store discovery, simple family purchase and restore, reliable child-home-screen access, managed school tablets, and dependable offline use. It is not inherently a learning advantage over a good PWA.

An immediate native-app project is lower value than completing the learning loop and PWA. The current app is static React with local assets and standard HTML media/Web Audio, so it is technically well suited to a Capacitor wrapper later. Rewriting it in React Native would discard working UI and audio behaviour without a corresponding product benefit.

### Recommended decision rule

Build a Play release after two or more of these are true:

- At least 40% of active beta devices are Android.
- Three qualified schools ask for Android/MDM distribution.
- The PWA has proven an offline session but install conversion or return rate is materially weaker on Android browsers.
- Parent research shows Play billing and automatic restore removes a meaningful purchase barrier.

If none is true, keep investing in content, retention, and PWA distribution. A strong PWA also gives every Android user an installable app-like experience without waiting for store review.

### Engineering approach

Use **Capacitor**, retaining the React/TypeScript app as the shared codebase. Capacitor supports Android and standard web technology; the Android project is managed in Android Studio. The app’s local 14 MB content bundle makes fully offline sessions feasible. The principal engineering risk is device-specific audio lifecycle behaviour, not rendering the existing screens.

| Workstream | Work required | Estimate with one experienced mobile/web engineer |
| --- | --- | --- |
| PWA foundation | Manifest, icons, service worker, offline caching/update rules, install QA | 2–3 weeks |
| Basic Android shell | Capacitor setup, Android project, app ID, signed App Bundle, phone/tablet layout and lifecycle QA | 2–3 weeks |
| Production hardening | Audio focus/interruption, background/foreground, hardware Back, rotation, storage recovery, offline first run, low-memory and Android WebView testing | 2–3 weeks |
| Commercial layer | Parent-gated Play Billing, entitlement backend, receipt verification, restore purchase, account/linking rules | 3–5 weeks |
| Play release | privacy/data-safety declarations, store assets, content rating, closed test, release fixes | 2–4 weeks elapsed, including the required test period if applicable |

Plan **4–6 engineering weeks** for a free offline Android beta after PWA work is complete, or **8–12 weeks** for a commercial Play release. Product, curriculum, legal review, store copy, and beta recruitment run alongside that work; they are not included in the engineering estimate.

### Specific changes required in this repository

1. Add a PWA plugin and manifest; define cache versioning for the 318 local assets and a clear update prompt.
2. Add Capacitor core/Android packages, a `capacitor.config`, an Android app identity, icons, splash assets, signing, and build pipeline.
3. Keep all teaching content embedded in the app bundle so it works without network access. The audio manifest currently prefers local URLs; the current product and architecture record documents that runtime behaviour.
4. Test audio after a phone call, Bluetooth route change, mute/unmute, app backgrounding, and rapid repeated taps. Current audio guards are a good base, but they have only browser evidence.
5. Add Android-specific navigation handling and test the child cannot accidentally exit a session through hardware Back.
6. Add a native billing bridge only when the paid offer is ready. Store entitlement on a server, not solely in browser/local WebView storage.
7. Add an Android device test matrix: low-cost phone, current Pixel/Samsung-class device, 7–10 inch tablet, current Android system WebView, offline cold start, and device rotation.

### Google Play launch gates

- As of 31 August 2026, new Play submissions must target Android 16 / API 36 or higher. See the [Google Play target API requirement](https://developer.android.com/google/play/requirements/target-sdk).
- Because the app targets children, it must meet the [Google Play Families Policy](https://support.google.com/googleplay/android-developer/answer/9893335). A Play build cannot merely be a website in a webview; the embedded, offline-first learning experience and Android-specific quality work must be demonstrable.
- Audit Clerk and every future SDK for child-directed use. The optional parent sign-in must remain parent-gated, and the core child experience must work without sign-in. Google requires disclosure of data transmitted by app libraries and SDKs in the [Data safety form](https://support.google.com/googleplay/android-developer/answer/10787469).
- Do not request location, advertising ID, microphone, camera, contacts, or device identifiers for the child product. Do not add analytics or ad SDKs until they pass the Families-policy review.
- Any in-app purchase of a subscription or locked digital content must use [Google Play Billing](https://support.google.com/googleplay/android-developer/answer/10281818) unless a documented regional exception applies. Validate purchase status server-side before granting long-lived entitlements.
- A newly created personal Play developer account needs a closed test with at least 12 opted-in testers for 14 consecutive days before it can apply for production access. See [Google’s testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465).

## Product metrics and governance

Track only what is needed to improve the learning journey and commercial funnel. Collect it with parent notice/consent, retain it for a declared period, and aggregate wherever possible.

| Dimension | Metric | Decision it supports |
| --- | --- | --- |
| Activation | Child completes a guided sound session and starts a second activity | Is the first minute understandable and compelling? |
| Habit | Families active on 3 distinct days in week one; weekly active families | Does the product fit a real family routine? |
| Learning practice | First-attempt response by taught sound, CVC blends completed, review needed | What should Milo present next? |
| Parent value | Parent dashboard viewed, next-step suggestion started, qualitative confidence rating | Does the parent understand the product’s value? |
| Revenue | Trial-to-paid conversion, annual-plan selection, cancellation/refund reasons | Is packaging and recurring content credible? |
| Quality | Audio failure rate, crash-free sessions, offline completion rate | Is mobile distribution reliable enough for a child? |

Avoid leaderboards, streak pressure, public sharing, child chat, ads, and child-directed purchase prompts. They weaken the product’s calm, parent-trusted position and create unnecessary compliance exposure.

## Immediate next three decisions

1. Appoint a qualified British SSP adviser and complete the content-rights/privacy audit before external marketing claims.
2. Recruit the first 20–30 parent beta families and agree the six-week research protocol and success measures.
3. Fund the PWA and guided-beginner-path work. Hold the Android store build for the Phase 2 decision gate unless a school contract makes it necessary sooner.
