// Scripted browser walkthrough via @playwright/mcp. Run with: npm run walkthrough
import { startSession, report } from './driver.mjs';
const url = process.argv[2];
const s = await startSession(); const r = report();
const openMapPhase1 = async () => {
  await s.tool('browser_navigate', { url });
  await s.click(/button "Parents Dashboard"/); await s.solveParentGate(); await s.click(/button "Curriculum map/); await s.click(/button "Phase 1"/);
};
const playPictureRounds = async () => {
  for (let round = 1; round <= 5; round += 1) {
    if (!(await s.has(new RegExp(`Round ${round} of 5`)))) throw new Error(`round ${round} not shown`);
    const names = (await s.snapshot()).split('\n').map((l) => l.match(/button "Picture: ([^"]+)"/)?.[1]).filter(Boolean);
    if (names.length !== 3) throw new Error(`round ${round}: ${names.length} pictures`);
    let solved = false;
    for (const name of names) { await s.click(new RegExp(`button "Picture: ${name}"`)); if (await s.has(/button "Next"/)) { solved = true; break; } }
    if (!solved) throw new Error(`round ${round}: no picture was accepted`);
    await s.click(/button "Next"/);
  }
  if (!(await s.has(/All done!/))) throw new Error('no All done screen');
};
await r.step('Phase 1 card shows the four games', async () => { await openMapPhase1(); for (const g of ['Robot Milo', 'Sound boxes', 'First sounds', 'Odd one out']) if (!(await s.has(new RegExp(`button "[^"]*${g}`)))) throw new Error(`missing ${g}`); });
for (const [label, title] of [['Robot Milo', 'Robot Milo'], ['First sounds', 'First sounds'], ['Odd one out', 'Odd one out']]) {
  await r.step(`${title}: 5 rounds, wrong and right picks, child-led Next`, async () => {
    await s.click(new RegExp(`button "[^"]*${label}`));
    await s.click(/button "Hear it again"/);
    await playPictureRounds();
  });
  await r.step(`${title}: adult mark is recorded`, async () => {
    await s.click(/button "With help"/);
    if (!/button "With help"[^\n]*\[pressed\]/.test(await s.snapshot())) throw new Error('With help not pressed');
    await s.click(/button "Back to map"/); await s.click(/button "Phase 1"/);
  });
}
await r.step('Sound boxes: tap each box, then Next, for 5 words', async () => {
  await s.click(/button "[^"]*Sound boxes/);
  for (let round = 1; round <= 5; round += 1) {
    await s.click(/button "Hear the word"/);
    const boxes = (await s.snapshot()).split('\n').map((l) => l.match(/button "Sound (\d+) of (\d+)"/)).filter(Boolean);
    if (boxes.length < 3) throw new Error(`round ${round}: ${boxes.length} boxes`);
    if (await s.has(/button "Next"/)) throw new Error('Next shown before all boxes tapped');
    for (const b of boxes) await s.click(new RegExp(`button "Sound ${b[1]} of ${b[2]}"`));
    await s.click(/button "Next"/);
  }
  if (!(await s.has(/All done!/))) throw new Error('no All done screen');
  await s.click(/button "Secure"/);
  if (!/button "Secure"[^\n]*\[pressed\]/.test(await s.snapshot())) throw new Error('Secure not pressed');
});
await r.step('no letters are shown in the games', async () => {
  await s.click(/button "Play again"/);
  const snap = await s.snapshot();
  if (/heading "[a-z]"|"[a-z]{1,2}"\s*$/m.test(snap)) throw new Error('letter-like text found');
});
await r.step('no console errors', async () => { const e = await s.errors(); if (e.count > 0) throw new Error(e.text.slice(0, 500)); });
await s.close(); process.exit(r.print() ? 0 : 1);
