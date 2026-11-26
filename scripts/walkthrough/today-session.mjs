// Scripted browser walkthrough via @playwright/mcp. Run with: npm run walkthrough
import { startSession, report } from './driver.mjs';
const url = process.argv[2];
const s = await startSession(); const r = report();
const openToday = async () => { await s.click(/button "[^"]*Today with Milo/); await s.solveParentGate(); };
const pressed = async (label) => new RegExp(`button "${label}"[^\\n]*\\[pressed\\]`).test(await s.snapshot());

await r.step('home shows Today with Milo and it opens behind the parent gate', async () => {
  await s.tool('browser_navigate', { url });
  await openToday();
  if (!(await s.has(/Today with Milo/))) throw new Error('session title missing');
  if (!(await s.has(/Revisit/)) || !(await s.has(/Apply/))) throw new Error('step list missing');
});
await r.step('revisit is empty on a fresh start', async () => { if (!(await s.has(/Nothing to revisit yet/))) throw new Error('no empty revisit message'); });
await r.step('teach suggests s and records a mark', async () => {
  await s.click(/button "Next step"/);
  if (!(await s.has(/Suggested next sound/))) throw new Error('no suggestion note');
  await s.click(/button "Hear the sound s"/);
  await s.click(/button "With help"/);
  if (!(await pressed('With help'))) throw new Error('mark not recorded');
});
await r.step('practise explains no words yet and opens the listening game', async () => {
  await s.click(/button "Next step"/);
  if (!(await s.has(/No blending words fit/))) throw new Error('no explanation for missing words');
  await s.click(/button "Play [^"]+"/);
  if (!(await s.has(/button "Back to today's session"/))) throw new Error('game did not open with a way back');
  await s.click(/button "Back to today's session"/);
  if (!(await s.has(/button "Play [^"]+"/))) throw new Error('did not return to practise');
});
await r.step('apply shows an off-screen activity for /s/, then finish', async () => {
  await s.click(/button "Next step"/);
  if (!(await s.has(/start with \/s\//))) throw new Error('no apply text');
  await s.click(/button "Finish"/);
  if (!(await s.has(/Well done today!/))) throw new Error('no finish screen');
  await s.click(/button "Back home"/);
});
await r.step('next session recaps s and suggests a', async () => {
  await openToday();
  if (!(await s.has(/Quick recap/))) throw new Error('no recap');
  if (!(await s.has(/button "Hear the sound s"/))) throw new Error('s not in recap');
  await s.click(/button "Next step"/);
  if (!(await s.has(/button "Hear the sound a"/))) throw new Error('a not suggested');
});
await r.step('back and leave work', async () => {
  await s.click(/button "Back"$|button "Back" \[/);
  if (!(await s.has(/Quick recap/))) throw new Error('back did not return to revisit');
  await s.click(/button "Leave today's session"/);
  if (!(await s.has(/button "[^"]*Today with Milo/))) throw new Error('did not return home');
});
await r.step('no console errors', async () => { const e = await s.errors(); if (e.count > 0) throw new Error(e.text.slice(0, 500)); });
await s.close(); process.exit(r.print() ? 0 : 1);
