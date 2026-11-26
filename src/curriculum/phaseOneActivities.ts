import { BLENDING_WORDS } from '../data/blendingData';
import { LETTERS_AND_SOUNDS } from '../data/lettersAndSounds';
import { lettersData } from '../data/lettersData';
import { findGpc, phonemeAudioSymbols, wordSoundSymbols } from './soundPage';

/** Phase 1 listening games: pictures and sounds only, no letters. */

export type PhaseOneActivityId = 'robot-blending' | 'sound-boxes' | 'first-sounds' | 'odd-one-out';

export const PHASE_ONE_ACTIVITY_IDS: readonly PhaseOneActivityId[] = ['robot-blending', 'sound-boxes', 'first-sounds', 'odd-one-out'];

export interface PictureChoice {
  readonly id: string;
  readonly label: string;
  readonly emoji: string;
  /** Word recording from the audio manifest; absent means the CVC whole-word file named by `id`. */
  readonly audioId?: string;
}

export interface PictureRound {
  readonly correctId: string;
  readonly choices: readonly PictureChoice[];
  /** Sound-library symbols to play as the prompt (robot sounds or a first sound). */
  readonly promptSymbols: readonly string[];
  /** Words to play as the prompt, in order (odd one out). */
  readonly promptWords: readonly string[];
  /** CVC word to say after a correct blend. */
  readonly answerWord?: string;
}

/** Recorded CVC words whose picture clearly shows the word. */
const BLENDING_WORD_TEXTS = [
  'pan', 'pin', 'tin', 'cat', 'dog', 'pot', 'cap', 'sun', 'bed', 'cup',
  'nut', 'hat', 'bag', 'leg', 'fan', 'box', 'van', 'fox', 'six', 'red',
] as const;

export interface BlendingPictureWord {
  readonly text: string;
  readonly segmented: string;
  readonly emoji: string;
}

export const BLENDING_PICTURE_WORDS: readonly BlendingPictureWord[] = BLENDING_WORD_TEXTS.map((text) => {
  const source = BLENDING_WORDS.find((word) => word.word === text);
  if (!source) throw new Error(`Missing blending word ${text}`);
  return { text, segmented: source.letters.join('.'), emoji: source.emoji };
});

export const RHYME_GROUPS: readonly (readonly string[])[] = [
  ['cat', 'hat'],
  ['pan', 'fan', 'van'],
  ['box', 'fox'],
  ['pin', 'tin'],
  ['bed', 'red'],
];

/** Pictures that do not start with their letter's sound, or are hard to picture. */
const FIRST_SOUND_EXCLUDED = new Set(['Sheep', 'Owl', 'Under', 'Up', 'Box', 'Fox', 'Six']);

export interface FirstSoundPicture {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly wordAudioId: string;
  readonly initialPhoneme: string;
  readonly initialSoundSymbols: readonly string[];
}

export const FIRST_SOUND_PICTURES: readonly FirstSoundPicture[] = Object.values(lettersData)
  .flatMap((letter) => letter.objects)
  .filter((object) => !FIRST_SOUND_EXCLUDED.has(object.name) && object.letterId !== 'x')
  .flatMap((object) => {
    const phoneme = findGpc(LETTERS_AND_SOUNDS, `gpc.${object.letterId}`)?.gpc.phoneme;
    if (!phoneme) return [];
    return [{
      id: object.id,
      name: object.name,
      emoji: object.emoji,
      wordAudioId: object.wordAudioId,
      initialPhoneme: phoneme,
      initialSoundSymbols: phonemeAudioSymbols(phoneme),
    }];
  });

/** Small seeded generator (mulberry32) so rounds can be repeated in tests. */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy;
}

const wordChoice = (word: BlendingPictureWord): PictureChoice => ({ id: word.text, label: word.text, emoji: word.emoji });

/** Robot Milo says the sounds; the child finds the picture. */
export function buildBlendingRounds(count: number, random: () => number): PictureRound[] {
  return shuffle(BLENDING_PICTURE_WORDS, random).slice(0, count).map((target) => {
    const distractors = shuffle(BLENDING_PICTURE_WORDS.filter((w) => w.text !== target.text), random).slice(0, 2);
    return {
      correctId: target.text,
      choices: shuffle([target, ...distractors], random).map(wordChoice),
      promptSymbols: wordSoundSymbols(LETTERS_AND_SOUNDS, target.segmented).flat(),
      promptWords: [],
      answerWord: target.text,
    };
  });
}

/** Milo wants something that starts with a sound; one picture does. */
export function buildFirstSoundRounds(count: number, random: () => number): PictureRound[] {
  return shuffle(FIRST_SOUND_PICTURES, random).slice(0, count).map((target) => {
    const distractors: FirstSoundPicture[] = [];
    for (const candidate of shuffle(FIRST_SOUND_PICTURES, random)) {
      if (distractors.length === 2) break;
      const clashes = [target, ...distractors].some(
        (chosen) => chosen.initialPhoneme === candidate.initialPhoneme || chosen.emoji === candidate.emoji,
      );
      if (!clashes) distractors.push(candidate);
    }
    return {
      correctId: target.id,
      choices: shuffle([target, ...distractors], random).map((p) => ({ id: p.id, label: p.name, emoji: p.emoji, audioId: p.wordAudioId })),
      promptSymbols: target.initialSoundSymbols,
      promptWords: [],
    };
  });
}

/** Two words rhyme and one does not; the child finds the odd one out. */
export function buildOddOneOutRounds(count: number, random: () => number): PictureRound[] {
  const byText = new Map(BLENDING_PICTURE_WORDS.map((word) => [word.text, word]));
  return Array.from({ length: count }, () => {
    const group = RHYME_GROUPS[Math.floor(random() * RHYME_GROUPS.length)]!;
    const pair = shuffle(group, random).slice(0, 2);
    const ending = pair[0]!.slice(1);
    const odd = shuffle(BLENDING_PICTURE_WORDS.filter((word) => word.text.slice(1) !== ending), random)[0]!;
    const choices = shuffle([...pair.map((text) => byText.get(text)!), odd], random).map(wordChoice);
    return { correctId: odd.text, choices, promptSymbols: [], promptWords: choices.map((choice) => choice.id) };
  });
}
