// Scripted browser walkthrough via @playwright/mcp. Run with: npm run walkthrough
// Checks that letters and words a child sees are lowercase (the word "I" excepted).
import { startSession, report } from './driver.mjs';
const url = process.argv[2];
const s = await startSession(); const r = report();

const visibleText = async () => {
  const out = await s.tool('browser_evaluate', { function: '() => document.body.innerText' });
  return out.replace(/^[\s\S]*?### Result\n/, '').replace(/\n### [\s\S]*$/, '');
};
/** Lone capital letters (not I), capitals inside sound slashes, and capitalised child words. */
const capitalProblems = (text, words = []) => {
  const found = [];
  for (const m of text.matchAll(/(?<![\p{L}'’])([A-HJ-Z])(?![\p{L}'’])/gu)) found.push(`letter ${m[1]}`);
  for (const m of text.matchAll(/\/([A-Z])\//g)) found.push(`/${m[1]}/`);
  for (const w of words) if (new RegExp(`\\b${w.charAt(0).toUpperCase()}${w.slice(1)}\\b|\\b${w.toUpperCase()}\\b`).test(text)) found.push(`word ${w}`);
  return found;
};
const expectLowercase = async (words = []) => {
  const problems = capitalProblems(await visibleText(), words);
  if (problems.length) throw new Error(problems.slice(0, 6).join(', '));
};
const home = async () => { await s.tool('browser_navigate', { url }); };
/** Words on the current reader page, joined from their grapheme spans. */
const readerWords = async () => {
  const out = await s.tool('browser_evaluate', { function: '() => [...document.querySelectorAll("section button")].map((b) => b.textContent.trim()).join(" ")' });
  return out.replace(/^[\s\S]*?### Result\n/, '').replace(/\n### [\s\S]*$/, '').replace(/^"|"$/g, '');
};
const openMoreGames = async () => { if (await s.has(/More games/)) await s.click(/More games/); };

await r.step('Letters board shows lowercase letters', async () => {
  await home(); await openMoreGames(); await s.click(/button "[^"]*Letters"/);
  await expectLowercase();
});
await r.step('Letter detail shows a lowercase letter and word', async () => {
  await s.click(/button "Listen to phoneme sound for a"|button "[^"]*\ba\b[^"]*"/);
  await expectLowercase(['apple', 'ant', 'alligator']);
});
await r.step("Let's Play shows lowercase", async () => {
  await home(); await s.click(/button "[^"]*Let's Play/);
  await expectLowercase(['apple', 'monkey', 'snake', 'sun', 'sock', 'star']);
});
await r.step('Bubble Pop shows lowercase letters', async () => {
  await home(); await openMoreGames(); await s.click(/button "[^"]*Bubble Pop/);
  await expectLowercase();
});
await r.step('Feed Milo shows lowercase letters and words', async () => {
  await home(); await openMoreGames(); await s.click(/button "[^"]*Feed Milo/);
  await expectLowercase(['apple', 'ant', 'mango', 'milk', 'moon', 'snake', 'sock', 'sun', 'tiger', 'train', 'pan', 'pen', 'pig']);
});
await r.step('Sound Train shows lowercase letters and words', async () => {
  await home(); await openMoreGames(); await s.click(/button "[^"]*Sound Train/);
  await expectLowercase(['sat', 'pat', 'tap', 'sap', 'at', 'pan', 'pin', 'mat']);
});
await r.step('Sound library example words are lowercase', async () => {
  await home(); await openMoreGames(); await s.click(/button "[^"]*Sound library/);
  await expectLowercase(['pen', 'bag', 'tie', 'dog', 'egg', 'up']);
});
await r.step('readers start sentences and names in lowercase', async () => {
  await home(); await s.click(/button "Parents Dashboard"/); await s.solveParentGate(); await s.click(/button "Curriculum map/);
  await s.click(/button "Open the reader Sam, Tim and Dad/);
  const words = await readerWords();
  if (words !== 'sam sat') throw new Error(`reader words were "${words}"`);
  await expectLowercase(['sam', 'tim', 'dad']);
});
await r.step('the tricky word I stays a capital', async () => {
  await s.click(/button "Back to curriculum map"/); await s.click(/button "Phase 3"/); await s.click(/button "Open the reader Fish and chips/);
  await s.click(/button "Next page"/);
  const words = await readerWords();
  if (!words.startsWith('I got fish')) throw new Error(`reader words were "${words}"`);
});
await r.step('Today session letters are lowercase', async () => {
  await home(); await s.click(/button "[^"]*Today with Milo/); await s.solveParentGate();
  await s.click(/button "Next step"/);
  await expectLowercase();
});
await r.step('no console errors', async () => { const e = await s.errors(); if (e.count > 0) throw new Error(e.text.slice(0, 400)); });
await s.close(); process.exit(r.print() ? 0 : 1);
