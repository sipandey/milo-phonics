// Scripted browser walkthrough via @playwright/mcp. Run with: npm run walkthrough
import { startSession, report } from './driver.mjs';
const url = process.argv[2];
const s = await startSession(); const r = report();
const pressed = async (label) => new RegExp(`"${label}"[^\\n]*\\[(pressed|checked)\\]`).test(await s.snapshot());

await r.step('Phase 2 lists little readers that need more sounds', async () => {
  await s.tool('browser_navigate', { url });
  await s.click(/button "Parents Dashboard"/); await s.solveParentGate(); await s.click(/button "Curriculum map/);
  if (!(await s.has(/Little readers/))) throw new Error('no readers section');
  if (!(await s.has(/Open the reader Sam, Tim and Dad, needs more sounds/))) throw new Error('reader not marked as needing sounds');
});
await r.step('introducing s a t p i n m d makes the first reader ready', async () => {
  for (const g of ['s', 'a', 't', 'p', 'i', 'n', 'm', 'd']) {
    await s.click(new RegExp(`button "Open the sound ${g},`)); await s.click(/switch "Mark sound as introduced"/); await s.click(/button "Back to curriculum map"/);
  }
  if (!(await s.has(/Open the reader Sam, Tim and Dad, ready/))) throw new Error('reader not ready');
});
await r.step('reader pages play words and turn', async () => {
  await s.click(/button "Open the reader Sam, Tim and Dad/);
  if (!(await s.has(/Page 1 of 4/))) throw new Error('no page counter');
  await s.click(/button "Hear Sam sound by sound"/);
  for (let page = 2; page <= 4; page += 1) { await s.click(/button "Next page"/); if (!(await s.has(new RegExp(`Page ${page} of 4`)))) throw new Error(`page ${page} missing`); }
  if (!(await s.has(/how did reading go/))) throw new Error('no mark on last page');
  await s.click(/button "Secure"/);
  if (!(await pressed('Secure'))) throw new Error('mark not recorded');
  await s.click(/button "Previous page"/);
  if (!(await s.has(/Page 3 of 4/))) throw new Error('previous did not work');
});
await r.step('sound buttons can be switched off and on', async () => {
  await s.click(/switch "Sound buttons on"/);
  if (!(await s.has(/switch "Sound buttons off"/))) throw new Error('toggle did not switch off');
  await s.click(/switch "Sound buttons off"/);
  await s.click(/button "Back to curriculum map"/);
  if (!(await s.has(/Open the reader Sam, Tim and Dad, ready/))) throw new Error('did not return to map');
});
await r.step('tricky words show a hint instead of sounding out', async () => {
  await s.click(/button "Open the reader The cat and the dog/);
  await s.click(/button "Tricky word the"/);
  if (!(await s.has(/is a tricky word: say it for your child/))) throw new Error('no tricky hint');
  await s.click(/button "Back to curriculum map"/);
});
await r.step('Phase 3 readers open with digraph words', async () => {
  await s.click(/button "Phase 3"/);
  for (const title of ['Fish and chips', 'Rain in the park', 'The night owl']) if (!(await s.has(new RegExp(`Open the reader ${title}`)))) throw new Error(`missing ${title}`);
  await s.click(/button "Open the reader Fish and chips/);
  await s.click(/button "Hear fish sound by sound"/);
  await s.click(/button "Next page"/);
  await s.click(/button "Hear chips sound by sound"/);
  await s.click(/button "Back to curriculum map"/);
  if (!(await s.has(/Open the reader Fish and chips/))) throw new Error('map did not stay on Phase 3');
});
await r.step('no console errors', async () => { const e = await s.errors(); if (e.count > 0) throw new Error(e.text.slice(0, 500)); });
await s.close(); process.exit(r.print() ? 0 : 1);
