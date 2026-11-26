// Scripted browser walkthrough via @playwright/mcp. Run with: npm run walkthrough
import { startSession, report } from './driver.mjs';
const url = process.argv[2];
const s = await startSession(); const r = report();
await r.step('home loads', async () => { await s.tool('browser_navigate', { url }); if (!(await s.has(/Parents Dashboard/))) throw new Error('no parent button'); });
await r.step('parent gate opens dashboard', async () => { await s.click(/button "Parents Dashboard"/); await s.solveParentGate(); if (!(await s.has(/Curriculum map/))) throw new Error('dashboard missing map button'); });
await r.step('curriculum map opens on Phase 2', async () => { await s.click(/button "Curriculum map/); if (!(await s.has(/Open the sound s, not introduced/))) throw new Error('no s tile'); if (!(await s.has(/Open the sound ck/))) throw new Error('no ck tile'); });
await r.step('phase tabs switch to Phase 1 aspects', async () => { await s.click(/button "Phase 1"/); if (!(await s.has(/Oral blending and segmenting/))) throw new Error('no Phase 1 aspects'); await s.click(/button "Phase 2"/); });
await r.step('sound page for t opens', async () => { await s.click(/button "Open the sound t,/); if (!(await s.has(/Hear the sound t/))) throw new Error('no hear button'); if (!(await s.has(/Needs: s, a/))) throw new Error('no needs hint'); });
await r.step('hear the sound plays without errors', async () => { await s.click(/button "Hear the sound t"/); await s.tool('browser_wait_for', { time: 1 }); });
await r.step('mark introduced and practise', async () => { await s.click(/switch "Mark sound as introduced"/); await s.click(/switch "Practise this sound"/); if (!(await s.has(/Sound introduced/))) throw new Error('introduced not shown'); if (!(await s.has(/Practising this sound/))) throw new Error('focus not shown'); });
await r.step('record With help', async () => { await s.click(/button "With help"/); if (!(await s.has(/Last practised \d{4}-\d\d-\d\d · 1 time/))) throw new Error('practice date/count missing'); });
await r.step('word plays sound by sound', async () => { await s.click(/button "Hear at sound by sound"/); await s.tool('browser_wait_for', { time: 2 }); });
await r.step('back to map shows status and a hint when too few words fit', async () => { await s.click(/button "Back to curriculum map"/); if (!(await s.has(/Open the sound t, with-help/))) throw new Error('tile status not updated'); if (!(await s.has(/Fewer than three words fit/))) throw new Error('no too-few hint'); });
await r.step('introducing s and a fills practice words', async () => {
  for (const g of ['s', 'a']) { await s.click(new RegExp(`button "Open the sound ${g},`)); await s.click(/switch "Mark sound as introduced"/); await s.click(/button "Back to curriculum map"/); }
  if (!(await s.has(/Words: at, sat/))) throw new Error((await s.snapshot()).split('\n').filter((l) => /Words/.test(l)).join(' ') || 'no words line');
});
await r.step('progress survives reload', async () => { await s.tool('browser_navigate', { url }); await s.click(/button "Parents Dashboard"/); await s.solveParentGate(); await s.click(/button "Curriculum map/); if (!(await s.has(/Open the sound t, with-help/))) throw new Error('status lost after reload'); });
await r.step('no console errors', async () => { const e = await s.errors(); if (e.count > 0) throw new Error(e.text.slice(0, 400)); });
await s.close(); process.exit(r.print() ? 0 : 1);
