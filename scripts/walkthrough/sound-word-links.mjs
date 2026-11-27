// Scripted browser walkthrough via @playwright/mcp. Run with: npm run walkthrough
// Checks what plays, in order, by reading the audio files the browser requests.
import { startSession, report } from './driver.mjs';
const url = process.argv[2];
const s = await startSession(); const r = report();

/** Record every audio file as it starts playing (network requests miss cached files). */
const installPlayLog = () => s.tool('browser_evaluate', { function: `() => {
  if (window.__playLog) return 'ok';
  window.__playLog = [];
  const original = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { window.__playLog.push(this.currentSrc || this.src); return original.apply(this, arguments); };
  return 'installed';
}` });
/** Audio played since the last call, as paths under /audio/. */
const newAudio = async () => {
  const out = await s.tool('browser_evaluate', { function: '() => (window.__playLog || []).splice(0).join("|")' });
  const result = (out.split('### Result')[1] ?? '').split('\n###')[0].trim().replace(/^"|"$/g, '');
  return result ? result.split('|').map((src) => decodeURIComponent(src.replace(/^.*\/audio\//, ''))) : [];
};
const wait = (time) => s.tool('browser_wait_for', { time });
const isSound = (f) => /_isolation\.mp3$/.test(f);
const isWord = (f) => /^words\/|^cvc\//.test(f);

await r.step('Teach shows pictures for the sound', async () => {
  await s.tool('browser_navigate', { url });
  await installPlayLog();
  await s.click(/button "[^"]*Today with Milo/); await s.solveParentGate(); await s.click(/button "Next step"/);
  for (const w of ['sun', 'sock', 'snake', 'star']) if (!(await s.has(new RegExp(`button "Hear s then ${w}"`)))) throw new Error(`no ${w}`);
  if (await s.has(/then sheep/)) throw new Error('sheep shown for s');
});
await r.step('a Teach picture plays the sound, then the word', async () => {
  await newAudio();
  await s.click(/button "Hear s then sun"/); await wait(4);
  const played = await newAudio();
  if (played.length < 2 || played[0] !== 's_isolation.mp3' || !/words\/word\.sun/.test(played[1])) throw new Error(`played ${played.join(' → ')}`);
});
/** Tap each picture until one is accepted; each must play a sound (optionally `sameSound`) then a word. */
const checkPicks = async (label, sameSound) => {
  const names = (await s.snapshot()).split('\n').map((l) => l.match(/button "Picture: ([^"]+)"/)?.[1]).filter(Boolean);
  if (names.length !== 3) throw new Error(`${label}: ${names.length} pictures`);
  await newAudio();
  for (const name of names) {
    await s.click(new RegExp(`button "Picture: ${name}"`)); await wait(4);
    const played = await newAudio();
    if (played.length < 2 || !isSound(played[0]) || !isWord(played[1])) throw new Error(`${label} ${name}: played ${played.join(' → ') || 'nothing'}`);
    if (sameSound && played[0] !== sameSound) throw new Error(`${label} ${name}: started with ${played[0]}, expected ${sameSound}`);
    if (await s.has(/button "Next"/)) return name;
  }
  throw new Error(`${label}: no picture accepted`);
};
let game = '';
await r.step("today's game practises the taught sound", async () => {
  await s.click(/button "With help"/); await s.click(/button "Next step"/);
  await newAudio();
  const button = await s.ref(/button "Play [^"]+"/); game = button.element;
  await s.click(/button "Play [^"]+"/); await wait(4);
  if (/Robot Milo|First sounds/.test(game)) {
    const played = await newAudio();
    if (played[0] !== 's_isolation.mp3') throw new Error(`${game}: prompt started with ${played[0]}`);
    if (/Robot Milo/.test(game)) await checkPicks('Robot Milo from Today', 's_isolation.mp3');
  } else {
    console.log(`  (today's game is ${game}; focus check runs for Robot Milo and First sounds only)`);
  }
});
await r.step("Robot Milo: every pick plays the round's sound, then its own word", async () => {
  await s.tool('browser_navigate', { url });
  await installPlayLog();
  await s.click(/button "Parents Dashboard"/); await s.solveParentGate(); await s.click(/button "Curriculum map/); await s.click(/button "Phase 1"/);
  await s.click(/button "[^"]*Robot Milo/); await wait(4);
  const prompt = await newAudio();
  const promptSound = prompt.find(isSound);
  if (!promptSound) throw new Error(`no prompt sound: ${prompt.join(' → ')}`);
  await checkPicks('Robot Milo', promptSound);
});
await r.step('First sounds: every pick plays its first sound, then its word', async () => {
  await s.click(/button "Back to curriculum map"/); await s.click(/button "Phase 1"/);
  await s.click(/button "[^"]*First sounds/); await wait(3);
  await checkPicks('First sounds');
});
await r.step('sound page shows pictures for the sound', async () => {
  await s.click(/button "Back to curriculum map"/); await s.click(/button "Phase 2"/); await s.click(/button "Open the sound m,/);
  if (!(await s.has(/button "Hear m then moon"/))) throw new Error('no m pictures');
});
await r.step('no console errors', async () => { const e = await s.errors(); if (e.count > 0) throw new Error(e.text.slice(0, 400)); });
await s.close(); process.exit(r.print() ? 0 : 1);
