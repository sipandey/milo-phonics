import { describe, expect, it } from 'vitest';
import { LETTERS_AND_SOUNDS } from '../src/data/lettersAndSounds';
import { wordSoundSymbols } from '../src/curriculum/soundPage';
import {
  BLENDING_PICTURE_WORDS,
  FIRST_SOUND_PICTURES,
  buildBlendingRounds,
  buildFirstSoundRounds,
  choicePlayback,
  createRandom,
  soundPictures,
} from '../src/curriculum/phaseOneActivities';

const random = () => createRandom(11);
const firstSound = (segmented: string) => wordSoundSymbols(LETTERS_AND_SOUNDS, segmented)[0]?.join('');
const byText = new Map(BLENDING_PICTURE_WORDS.map((w) => [w.text, w]));

describe('Robot Milo practises the taught sound', () => {
  it('has recorded picture words for the early sounds', () => {
    for (const text of ['sun', 'sock', 'star', 'snake', 'ant', 'tie', 'train', 'pen', 'pig', 'nest', 'nose', 'milk', 'moon', 'duck', 'drum']) {
      expect(byText.has(text), text).toBe(true);
    }
    expect(new Set(BLENDING_PICTURE_WORDS.map((w) => w.text)).size).toBe(BLENDING_PICTURE_WORDS.length);
  });

  it('uses only targets that start with the focus sound, with distractors that do not', () => {
    const rounds = buildBlendingRounds(5, random(), 'gpc.s');
    expect(rounds).toHaveLength(5);
    for (const round of rounds) {
      expect(firstSound(byText.get(round.correctId)!.segmented)).toBe('s');
      for (const choice of round.choices.filter((c) => c.id !== round.correctId)) {
        expect(firstSound(byText.get(choice.id)!.segmented), choice.id).not.toBe('s');
      }
    }
  });

  it('treats c and k as the same sound and falls back to words containing the sound', () => {
    for (const round of buildBlendingRounds(5, random(), 'gpc.k')) expect(firstSound(byText.get(round.correctId)!.segmented)).toBe('k');
    for (const round of buildBlendingRounds(5, random(), 'gpc.i')) {
      expect(wordSoundSymbols(LETTERS_AND_SOUNDS, byText.get(round.correctId)!.segmented).flat()).toContain('ɪ');
    }
  });

  it('builds unfocused rounds when no sound is given', () => {
    expect(buildBlendingRounds(5, random())).toHaveLength(5);
  });
});

describe('First sounds practises the taught sound', () => {
  it('uses targets with the focus sound only', () => {
    const rounds = buildFirstSoundRounds(5, random(), 'gpc.s');
    expect(rounds).toHaveLength(5);
    const byId = new Map(FIRST_SOUND_PICTURES.map((p) => [p.id, p]));
    for (const round of rounds) expect(byId.get(round.correctId)?.initialPhoneme).toBe('s');
  });
});

describe('Robot Milo picks all say the round’s sound, then their own word', () => {
  it('plays the focus sound before every picture’s word, right or wrong', () => {
    for (const round of buildBlendingRounds(5, random(), 'gpc.s')) {
      for (const choice of round.choices) {
        const word = byText.get(choice.id)!;
        expect(choicePlayback(choice, round.choiceSound)).toEqual([
          { kind: 'sound', symbols: ['s'] },
          word.audioId ? { kind: 'word', audioId: word.audioId } : { kind: 'cvc', word: choice.id },
        ]);
      }
    }
  });

  it('without a focus, uses the target word’s first sound for every picture', () => {
    for (const round of buildBlendingRounds(5, random())) {
      const targetSound = wordSoundSymbols(LETTERS_AND_SOUNDS, byText.get(round.correctId)!.segmented)[0];
      expect(round.choiceSound).toEqual(targetSound);
      for (const choice of round.choices) expect(choicePlayback(choice, round.choiceSound)[0]).toEqual({ kind: 'sound', symbols: targetSound });
    }
  });
});

describe('First sounds picks say their own first sound', () => {
  it('keeps each picture’s own first sound', () => {
    const round = buildFirstSoundRounds(1, random())[0]!;
    expect(round.choiceSound).toBeUndefined();
    const byId = new Map(FIRST_SOUND_PICTURES.map((p) => [p.id, p]));
    for (const choice of round.choices) {
      expect(choicePlayback(choice, round.choiceSound)[0]).toEqual({ kind: 'sound', symbols: byId.get(choice.id)!.initialSoundSymbols });
    }
  });
});

describe('soundPictures', () => {
  it('lists pictures that start with a single-letter sound', () => {
    const s = soundPictures('gpc.s');
    expect(s.position).toBe('start');
    expect(s.pictures.map((p) => p.name)).toEqual(expect.arrayContaining(['Sun', 'Sock', 'Snake', 'Star']));
    expect(s.pictures.map((p) => p.name)).not.toContain('Sheep');
  });

  it('lists x pictures as ending with the sound, and none for sounds without pictures yet', () => {
    const x = soundPictures('gpc.x');
    expect(x.position).toBe('end');
    expect(x.pictures.map((p) => p.name)).toEqual(['Box', 'Fox', 'Six']);
    expect(soundPictures('gpc.sh').pictures).toEqual([]);
  });
});
