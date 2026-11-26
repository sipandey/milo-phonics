import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { lettersData } from '../src/data/lettersData';
import { graphemeMarks } from '../src/curriculum/graphemeMarks';
import { ReaderScreen } from '../src/components/curriculum/ReaderScreen';

/** Screens a child sees; the parent area keeps ordinary English capitals. */
const CHILD_SCREEN_DIRS = ['curriculum', 'game', 'home', 'letter', 'phase1', 'play', 'sounds', 'today', 'train'];

describe('lowercase letters for the child', () => {
  it('stores every letter symbol in lowercase', () => {
    const symbols = Object.values(lettersData).map((letter) => letter.symbol);
    expect(symbols.filter((symbol) => symbol !== symbol.toLowerCase())).toEqual([]);
  });

  it('draws names in lowercase', () => {
    expect(graphemeMarks('T.i.m').map((g) => g.text).join('')).toBe('tim');
    expect(graphemeMarks('E-e.v').map((g) => g.text).join('')).toBe('eve');
  });

  it('starts reader sentences in lowercase, keeping the word I as a capital', () => {
    const page1 = renderToStaticMarkup(createElement(ReaderScreen, { readerId: 'sam-tim-dad', onBack: () => undefined }));
    expect(page1).toContain('<span>s</span>');
    expect(page1).not.toContain('<span>S</span>');
    expect(page1).toContain('sam, tim and dad</h1>');
    const fish = renderToStaticMarkup(createElement(ReaderScreen, { readerId: 'cat-and-dog', onBack: () => undefined }));
    expect(fish).toContain('>the</span>');
    expect(fish).not.toContain('>The</span>');
  });

  it('has no code in child screens that turns letters or words into capitals', () => {
    const offenders: string[] = [];
    for (const dir of CHILD_SCREEN_DIRS) {
      for (const file of readdirSync(join('src/components', dir))) {
        const source = readFileSync(join('src/components', dir, file), 'utf8');
        if (/toUpperCase\(|\buppercase\b|capitalize\b/.test(source)) offenders.push(`${dir}/${file}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
