import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LETTERS_AND_SOUNDS } from '../src/data/lettersAndSounds';
import {
  findGpc,
  hasWholeWordAudio,
  listPhaseGpcs,
  phonemeAudioSymbols,
  selectPractiseWords,
  wordSoundSymbols,
  wordsForGpc,
} from '../src/curriculum/soundPage';

const known = (...graphemes: string[]) => new Set(graphemes);

describe('phonemeAudioSymbols', () => {
  it('maps phonemes to sound-library files, splitting /kw/ into two sounds', () => {
    expect(phonemeAudioSymbols('s')).toEqual(['s']);
    expect(phonemeAudioSymbols('ks')).toEqual(['x']);
    expect(phonemeAudioSymbols('kw')).toEqual(['k', 'w']);
  });

  it('has a bundled isolation file for every correspondence in the programme', () => {
    const missing = LETTERS_AND_SOUNDS.phases
      .flatMap((phase) => phase.sets.flatMap((set) => set.gpcs))
      .flatMap((gpc) => phonemeAudioSymbols(gpc.phoneme))
      .filter((symbol) => !existsSync(resolve('public/audio', `${symbol}_isolation.mp3`)));
    expect(missing).toEqual([]);
  });
});

describe('findGpc and listPhaseGpcs', () => {
  it('finds a correspondence with its phase and set', () => {
    const found = findGpc(LETTERS_AND_SOUNDS, 'gpc.ck');
    expect(found?.gpc.grapheme).toBe('ck');
    expect(found?.phase.id).toBe(2);
    expect(found?.set.title).toBe('Set 4');
    expect(findGpc(LETTERS_AND_SOUNDS, 'gpc.nope')).toBeNull();
  });

  it('lists a phase’s correspondences in teaching order', () => {
    expect(listPhaseGpcs(LETTERS_AND_SOUNDS, 2).slice(0, 5).map((gpc) => gpc.id)).toEqual([
      'gpc.s', 'gpc.a', 'gpc.t', 'gpc.p', 'gpc.i',
    ]);
  });
});

describe('wordSoundSymbols', () => {
  it('plays each grapheme as its taught sound, including digraphs and doubled letters', () => {
    expect(wordSoundSymbols(LETTERS_AND_SOUNDS, 'sh.o.p')).toEqual([['ʃ'], ['ɒ'], ['p']]);
    expect(wordSoundSymbols(LETTERS_AND_SOUNDS, 'd.i.nn.er')).toEqual([['d'], ['ɪ'], ['n'], ['ə']]);
    expect(wordSoundSymbols(LETTERS_AND_SOUNDS, 'qu.i.t')).toEqual([['k', 'w'], ['ɪ'], ['t']]);
  });

  it('uses the preferred correspondence when a grapheme has two sounds', () => {
    expect(wordSoundSymbols(LETTERS_AND_SOUNDS, 'b.oo.k', 'gpc.oo-short')[1]).toEqual(['ʊ']);
    expect(wordSoundSymbols(LETTERS_AND_SOUNDS, 'm.oo.n', 'gpc.oo-long')[1]).toEqual(['uː']);
  });
});

describe('wordsForGpc', () => {
  it('marks which listed words are decodable from the known sounds and names what is missing', () => {
    const gpc = findGpc(LETTERS_AND_SOUNDS, 'gpc.t')!.gpc;
    expect(wordsForGpc(gpc, known('s', 'a', 't'))).toEqual([
      { segmented: 'a.t', text: 'at', decodable: true, missing: [] },
      { segmented: 's.a.t', text: 'sat', decodable: true, missing: [] },
    ]);
    expect(wordsForGpc(gpc, known('t'))[1]).toEqual({ segmented: 's.a.t', text: 'sat', decodable: false, missing: ['s', 'a'] });
  });
});

describe('selectPractiseWords', () => {
  it('chooses words that contain a focus sound and use only known or focus sounds', () => {
    const result = selectPractiseWords(LETTERS_AND_SOUNDS, known('s', 'a', 'p'), ['gpc.t']);
    expect(result.words.map((word) => word.text)).toEqual(['at', 'sat', 'pat', 'tap']);
    expect(result.needsMoreSounds).toBe(false);
  });

  it('asks for more sounds when fewer than three words fit', () => {
    const result = selectPractiseWords(LETTERS_AND_SOUNDS, known('a'), ['gpc.t']);
    expect(result.words.map((word) => word.text)).toEqual(['at']);
    expect(result.needsMoreSounds).toBe(true);
  });

  it('returns nothing without a focus sound', () => {
    expect(selectPractiseWords(LETTERS_AND_SOUNDS, known('s', 'a', 't'), []).words).toEqual([]);
  });
});

describe('hasWholeWordAudio', () => {
  it('knows which words have a recorded whole-word file', () => {
    expect(hasWholeWordAudio('sat')).toBe(true);
    expect(hasWholeWordAudio('velvet')).toBe(false);
  });
});
