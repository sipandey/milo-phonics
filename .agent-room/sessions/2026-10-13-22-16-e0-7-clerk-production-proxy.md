# Session Log: Verify Clerk production proxy and update E0.7 evidence

**Date:** 2026-10-13 22:16
**Agent:** Codex GPT-5
**Classification:** Bug

## Goal
Resolve the Vercel `FUNCTION_INVOCATION_FAILED` on the Clerk production proxy, verify the live parent sign-in surface, and reconcile the AgentRoom backlog and evidence records.

## Files touched
- Read: `AGENTS.md`, `.agent-room/principles.md`, `.agent-room/coordination/session-log-format.md`, `api/clerk-proxy.ts`, `src/server/clerkProxy.ts`, `src/main.tsx`, `src/components/parent/ParentClerkSync.tsx`, `vercel.json`, `docs/plans/technical-delivery-backlog.md`, `docs/plans/2026-10-13-e0-7-production-network-review.md`, `docs/data-flow-inventory.md`, `docs/plans/2026-10-13-e1-6-vendor-review.md`, `docs/plans/current-product-and-architecture.md`, `.agent-room/decisions.md`
- Created: `.agent-room/sessions/2026-10-13-22-16-e0-7-clerk-production-proxy.md`
- Modified: `api/clerk-proxy.ts`, `src/main.tsx`, `docs/plans/technical-delivery-backlog.md`, `docs/plans/2026-10-13-e0-7-production-network-review.md`, `docs/data-flow-inventory.md`, `docs/plans/2026-10-13-e1-6-vendor-review.md`, `docs/plans/current-product-and-architecture.md`, `.agent-room/decisions.md`

## Actions taken
1. Read the Vercel deployment log and identified `ERR_MODULE_NOT_FOUND` for the extensionless ESM import `../src/server/clerkProxy` in the Node 24 function bundle.
2. Changed the serverless import to `../src/server/clerkProxy.js`, preserving TypeScript source resolution while producing a Node-resolvable ESM specifier.
3. Verified the fix locally, committed it as `e298631`, and pushed it to `main`.
4. Verified the Ready deployment’s `/api/clerk-proxy` function and Vercel logs: direct and rewritten Clerk asset requests returned `200`.
5. Loaded the production app, opened the parent gate, opened the Clerk sign-in modal, and verified the page had the modal while `hasDevelopmentMode` was false. No credentials or child data were entered.
6. Corrected `src/main.tsx` so an unset proxy URL is not forced for local `pk_test` development keys; committed and pushed as `c461ef2`.
7. Updated the backlog, E0.7 review, data-flow inventory, architecture record, vendor review, decision register, and this session log. The records now separate technical proxy verification from the still-open vendor/privacy and credentialed sync/delete gates.

## Tests run
- Command: `npm test`
- Result: Pass — 15 files, 48 tests
- Command: `npm run lint`
- Result: Pass
- Command: `npm run build`
- Result: Pass — TypeScript, claims guard, and Vite build; existing chunk-size warning only
- Command: `npx tsc --noEmit --strict --target ES2020 --module ESNext --moduleResolution bundler --lib ES2020,DOM,DOM.Iterable api/clerk-proxy.ts`
- Result: Pass
- Command: `git diff --check`
- Result: Pass

## Decisions made
- Production Clerk traffic uses a same-origin `/__clerk` rewrite to a Vercel Node 24 function; only the public publishable key is client-side, while `CLERK_SECRET_KEY` stays in Vercel Production configuration.
- The technical proxy and production-mode checks are recorded as passed, but Clerk vendor/DPA, retention, deletion, transfer, security, parent-verification, and credentialed sync/delete evidence remain open.
- Local development keeps Clerk’s direct `pk_test` behavior unless an explicit proxy URL is supplied.

## Outcome
Completed — production proxy invocation failure fixed and evidence reconciled; E0.7 remains in progress for the explicit vendor/privacy and synthetic sync/delete acceptance gates.

**Handoff note (if applicable):** Next work should take the next unblocked backlog item or obtain the remaining owner/vendor records. Do not commit or disclose the production secret; rotate it because it was shared during setup.
