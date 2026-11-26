import { describe, expect, it } from 'vitest';
import type { LettersAndSoundsPhase, LettersAndSoundsProgramme } from '../src/types/lettersAndSounds';
import {
  isDecodableWith,
  parseSegmentedWord,
  validateLettersAndSounds,
} from '../src/curriculum/lettersAndSoundsValidation';
import { LETTERS_AND_SOUNDS } from '../src/data/lettersAndSounds';

const programme = (phases: LettersAndSoundsPhase[]): LettersAndSoundsProgramme => ({
  version: 'test',
  source: 'test',
  phases,
});

const phase = (overrides: Partial<LettersAndSoundsPhase>): LettersAndSoundsPhase => ({
  id: 2,
  title: 'Phase 2',
  approxAge: '4–5',
  summary: '',
  sets: [],
  trickyWords: [],
  ...overrides,
});

const gpc = (grapheme: string, words: string[] = [], extra: Record<string, unknown> = {}) => ({
  id: `gpc.${grapheme}`,
  grapheme,
  phoneme: grapheme,
  words,
  ...extra,
});

const codes = (p: LettersAndSoundsProgramme) => validateLettersAndSounds(p).map((f) => `${f.code}:${f.itemId}`);

describe('parseSegmentedWord', () => {
  it('builds text and graphemes from a segmented word', () => {
    expect(parseSegmentedWord('k.i.ck')).toEqual({ text: 'kick', graphemes: ['k', 'i', 'ck'] });
  });

  it('places the e of a split digraph after the next grapheme', () => {
    expect(parseSegmentedWord('m.a-e.k')).toEqual({ text: 'make', graphemes: ['m', 'a-e', 'k'] });
    expect(parseSegmentedWord('E-e.v')).toEqual({ text: 'Eve', graphemes: ['e-e', 'v'] });
  });

  it('keeps hyphenated words and lower-cases graphemes', () => {
    expect(parseSegmentedWord('z.i.g|z.a.g')).toEqual({ text: 'zig-zag', graphemes: ['z', 'i', 'g', 'z', 'a', 'g'] });
    expect(parseSegmentedWord('T.i.m').graphemes).toEqual(['t', 'i', 'm']);
  });

  it('rejects empty graphemes', () => {
    expect(() => parseSegmentedWord('s..t')).toThrow();
    expect(() => parseSegmentedWord('')).toThrow();
  });
});

describe('isDecodableWith', () => {
  it('accepts words built only from known graphemes', () => {
    expect(isDecodableWith('s.a.t', new Set(['s', 'a', 't']))).toBe(true);
    expect(isDecodableWith('t.a.p', new Set(['s', 'a', 't']))).toBe(false);
  });

  it('accepts a doubled consonant only when doubling is allowed and the letter is known', () => {
    const known = new Set(['d', 'i', 'n', 'er']);
    expect(isDecodableWith('d.i.nn.er', known)).toBe(false);
    expect(isDecodableWith('d.i.nn.er', known, { allowDoubledConsonants: true })).toBe(true);
    expect(isDecodableWith('d.i.mm.er', known, { allowDoubledConsonants: true })).toBe(false);
  });
});

describe('validateLettersAndSounds', () => {
  it('passes a well-formed programme', () => {
    const p = programme([
      phase({ sets: [{ id: 'set.1', title: 'Set 1', gpcs: [gpc('s'), gpc('a', ['a.s']), gpc('t', ['s.a.t'])] }] }),
    ]);
    expect(codes(p)).toEqual([]);
  });

  it('flags a word that uses a grapheme taught later', () => {
    const p = programme([
      phase({ sets: [{ id: 'set.1', title: 'Set 1', gpcs: [gpc('s', ['s.a.t']), gpc('a'), gpc('t')] }] }),
    ]);
    expect(codes(p)).toContain('UNTAUGHT_GRAPHEME:gpc.s:sat');
  });

  it('flags a word that does not contain its own grapheme', () => {
    const p = programme([
      phase({ sets: [{ id: 'set.1', title: 'Set 1', gpcs: [gpc('s'), gpc('a', ['a.s']), gpc('t', ['a.s'])] }] }),
    ]);
    expect(codes(p)).toContain('MISSING_TARGET_GRAPHEME:gpc.t:as');
  });

  it('counts alternative graphemes as taught and as the target', () => {
    const p = programme([
      phase({
        sets: [{ id: 'set.1', title: 'Set 1', gpcs: [gpc('o'), gpc('p'), gpc('u'), gpc('f', ['p.u.ff', 'o.ff'], { alternativeGraphemes: ['ff'] })] }],
      }),
    ]);
    expect(codes(p)).toEqual([]);
  });

  it('allows doubled consonants only after a doubled grapheme has been taught', () => {
    const early = programme([
      phase({ sets: [{ id: 'set.1', title: 'Set 1', gpcs: [gpc('t'), gpc('o'), gpc('p'), gpc('e', ['p.o.tt.e'])] }] }),
    ]);
    expect(codes(early)).toContain('UNTAUGHT_GRAPHEME:gpc.e:potte');

    const later = programme([
      phase({
        sets: [{ id: 'set.1', title: 'Set 1', gpcs: [gpc('t'), gpc('o'), gpc('p'), gpc('ss'), gpc('e', ['p.o.tt.e'])] }],
      }),
    ]);
    expect(codes(later)).toEqual([]);
  });

  it('flags duplicate correspondence IDs, duplicate tricky words, and malformed words', () => {
    const p = programme([
      phase({
        sets: [{ id: 'set.1', title: 'Set 1', gpcs: [gpc('s', ['s..s']), gpc('s')] }],
        trickyWords: ['the', 'to', 'the'],
      }),
    ]);
    const found = codes(p);
    expect(found).toContain('DUPLICATE_ID:gpc.s');
    expect(found).toContain('DUPLICATE_TRICKY_WORD:the');
    expect(found).toContain('MALFORMED_WORD:gpc.s:s..s');
  });

  it('requires Phase 4 words to have adjacent consonants and known graphemes', () => {
    const p = programme([
      phase({ sets: [{ id: 'set.1', title: 'Set 1', gpcs: [gpc('t'), gpc('r'), gpc('a'), gpc('p')] }] }),
      phase({ id: 4, adjacentConsonantWords: ['t.r.a.p', 't.a.p', 's.t.o.p'] }),
    ]);
    const found = codes(p);
    expect(found).not.toContain('NO_ADJACENT_CONSONANTS:phase.4:trap');
    expect(found).toContain('NO_ADJACENT_CONSONANTS:phase.4:tap');
    expect(found).toContain('UNTAUGHT_GRAPHEME:phase.4:stop');
  });
});

describe('Letters and Sounds programme data', () => {
  it('has no validation findings', () => {
    expect(validateLettersAndSounds(LETTERS_AND_SOUNDS)).toEqual([]);
  });

  it('follows the Phase 2 set order exactly', () => {
    const phase2 = LETTERS_AND_SOUNDS.phases.find((p) => p.id === 2);
    expect(phase2?.sets.map((set) => set.gpcs.map((g) => [g.grapheme, ...(g.alternativeGraphemes ?? [])].join('/')))).toEqual([
      ['s', 'a', 't', 'p'],
      ['i', 'n', 'm', 'd'],
      ['g', 'o', 'c', 'k'],
      ['ck', 'e', 'u', 'r'],
      ['h', 'b', 'f/ff', 'l/ll', 'ss'],
    ]);
    expect(phase2?.trickyWords).toEqual(['the', 'to', 'no', 'go', 'I', 'into']);
  });
});
