import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getAudioEntry } from '../src/data/audioManifest';
import { LETTERS_AND_SOUNDS } from '../src/data/lettersAndSounds';
import { hasWholeWordAudio, wordSoundSymbols } from '../src/curriculum/soundPage';
import {
  BLENDING_PICTURE_WORDS,
  FIRST_SOUND_PICTURES,
  RHYME_GROUPS,
  buildBlendingRounds,
  buildFirstSoundRounds,
  buildOddOneOutRounds,
  createRandom,
} from '../src/curriculum/phaseOneActivities';

const random = () => createRandom(42);

describe('Phase 1 content', () => {
  it('uses blending words with a recorded whole word (CVC or picture-word audio), unique pictures, and bundled sounds', () => {
    expect(BLENDING_PICTURE_WORDS.length).toBeGreaterThanOrEqual(12);
    expect(new Set(BLENDING_PICTURE_WORDS.map((w) => w.emoji)).size).toBe(BLENDING_PICTURE_WORDS.length);
    for (const word of BLENDING_PICTURE_WORDS) {
      if (word.audioId) {
        const url = getAudioEntry(word.audioId)?.url ?? '';
        expect(existsSync(resolve('public', url.slice(1))), word.text).toBe(true);
      } else {
        expect(hasWholeWordAudio(word.text), word.text).toBe(true);
      }
      for (const symbol of wordSoundSymbols(LETTERS_AND_SOUNDS, word.segmented).flat()) {
        expect(existsSync(resolve('public/audio', `${symbol}_isolation.mp3`)), `${word.text}: ${symbol}`).toBe(true);
      }
    }
  });

  it('builds rhyme groups only from blending words that share an ending', () => {
    const texts = new Set(BLENDING_PICTURE_WORDS.map((w) => w.text));
    for (const group of RHYME_GROUPS) {
      expect(group.length).toBeGreaterThanOrEqual(2);
      for (const word of group) expect(texts.has(word), word).toBe(true);
      expect(new Set(group.map((word) => word.slice(1))).size).toBe(1);
    }
  });

  it('uses first-sound pictures with recorded word audio and a sound-library file', () => {
    expect(FIRST_SOUND_PICTURES.length).toBeGreaterThanOrEqual(60);
    for (const picture of FIRST_SOUND_PICTURES) {
      const url = getAudioEntry(picture.wordAudioId)?.url;
      expect(url, picture.name).toBeTruthy();
      expect(existsSync(resolve('public', (url ?? '').slice(1))), picture.name).toBe(true);
      for (const symbol of picture.initialSoundSymbols) {
        expect(existsSync(resolve('public/audio', `${symbol}_isolation.mp3`)), `${picture.name}: ${symbol}`).toBe(true);
      }
    }
    expect(FIRST_SOUND_PICTURES.map((p) => p.name)).not.toContain('Sheep');
    expect(FIRST_SOUND_PICTURES.find((p) => p.name === 'Cat')?.initialPhoneme).toBe('k');
    expect(FIRST_SOUND_PICTURES.find((p) => p.name === 'Kite')?.initialPhoneme).toBe('k');
  });
});

describe('createRandom', () => {
  it('is repeatable for the same seed', () => {
    const a = createRandom(7);
    const b = createRandom(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});

describe('buildBlendingRounds', () => {
  it('makes rounds with three different pictures, one of them the blended word', () => {
    const rounds = buildBlendingRounds(5, random());
    expect(rounds).toHaveLength(5);
    expect(new Set(rounds.map((round) => round.correctId)).size).toBe(5);
    for (const round of rounds) {
      expect(round.choices).toHaveLength(3);
      expect(new Set(round.choices.map((c) => c.emoji)).size).toBe(3);
      expect(round.choices.map((c) => c.id)).toContain(round.correctId);
      expect(round.promptSymbols.length).toBeGreaterThanOrEqual(2);
      expect(round.answerWord).toBe(round.correctId);
    }
  });
});

describe('buildFirstSoundRounds', () => {
  it('has exactly one picture starting with the target sound', () => {
    for (const round of buildFirstSoundRounds(8, random())) {
      const byId = new Map(FIRST_SOUND_PICTURES.map((p) => [p.id, p]));
      const target = byId.get(round.correctId)!;
      const matching = round.choices.filter((c) => byId.get(c.id)?.initialPhoneme === target.initialPhoneme);
      expect(matching.map((c) => c.id)).toEqual([round.correctId]);
      expect(round.promptSymbols).toEqual(target.initialSoundSymbols);
    }
  });
});

describe('buildOddOneOutRounds', () => {
  it('plays two rhyming words and one that does not rhyme, which is the answer', () => {
    for (const round of buildOddOneOutRounds(5, random())) {
      expect(round.choices).toHaveLength(3);
      expect(round.promptWords).toEqual(round.choices.map((c) => c.id));
      const others = round.choices.filter((c) => c.id !== round.correctId).map((c) => c.id);
      expect(others[0]?.slice(1)).toBe(others[1]?.slice(1));
      expect(round.correctId.slice(1)).not.toBe(others[0]?.slice(1));
    }
  });
});
