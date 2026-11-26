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

  it('follows the Phase 3 order, with both oo sounds as separate correspondences', () => {
    const phase3 = LETTERS_AND_SOUNDS.phases.find((p) => p.id === 3);
    expect(phase3?.sets.map((set) => set.gpcs.map((g) => g.grapheme))).toEqual([
      ['j', 'v', 'w', 'x'],
      ['y', 'z', 'zz', 'qu'],
      ['ch', 'sh', 'th', 'ng'],
      ['ai', 'ee', 'igh', 'oa', 'oo', 'oo', 'ar', 'or', 'ur', 'ow', 'oi', 'ear', 'air', 'ure', 'er'],
    ]);
    expect(phase3?.trickyWords).toEqual(['he', 'she', 'we', 'me', 'be', 'was', 'you', 'they', 'all', 'are', 'my', 'her']);
  });

  it('covers all seven Phase 1 aspects without letters or tricky words', () => {
    const phase1 = LETTERS_AND_SOUNDS.phases.find((p) => p.id === 1);
    expect(phase1?.aspects?.map((aspect) => aspect.title)).toEqual([
      'Environmental sounds',
      'Instrumental sounds',
      'Body percussion',
      'Rhythm and rhyme',
      'Alliteration',
      'Voice sounds',
      'Oral blending and segmenting',
    ]);
    expect(phase1?.sets).toEqual([]);
    expect(phase1?.trickyWords).toEqual([]);
  });

  it('lists the Phase 4 and Phase 5 tricky words and Phase 5 graphemes', () => {
    const byId = (id: number) => LETTERS_AND_SOUNDS.phases.find((p) => p.id === id);
    expect(byId(4)?.trickyWords).toEqual([
      'said', 'have', 'like', 'so', 'do', 'some', 'come', 'were', 'there', 'little', 'one', 'when', 'out', 'what',
    ]);
    expect(byId(4)?.adjacentConsonantWords).toEqual(expect.arrayContaining(['t.r.a.p', 's.t.r.o.ng', 'm.i.l.k', 'c.r.e.p.t']));
    expect(byId(5)?.trickyWords).toEqual(['oh', 'their', 'people', 'Mr', 'Mrs', 'looked', 'called', 'asked', 'could']);
    expect(byId(5)?.sets.flatMap((set) => set.gpcs.map((g) => g.grapheme))).toEqual([
      'ay', 'ou', 'ie', 'ea', 'oy', 'ir', 'ue', 'aw', 'wh', 'ph', 'ew', 'oe', 'au', 'a-e', 'e-e', 'i-e', 'o-e', 'u-e',
    ]);
  });

  it('orders phases 1 to 5', () => {
    expect(LETTERS_AND_SOUNDS.phases.map((p) => p.id)).toEqual([1, 2, 3, 4, 5]);
  });
});
