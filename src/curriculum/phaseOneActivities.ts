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
  /** The word's first sound, played before the word when the picture is tapped. */
  readonly soundSymbols: readonly string[];
}

export type PlaybackStep =
  | { readonly kind: 'sound'; readonly symbols: readonly string[] }
  | { readonly kind: 'word'; readonly audioId: string }
  | { readonly kind: 'cvc'; readonly word: string };

/** What a tapped picture plays: a sound (the round's, or its own first sound), then the whole word. */
export function choicePlayback(choice: PictureChoice, roundSound?: readonly string[]): PlaybackStep[] {
  return [
    { kind: 'sound', symbols: roundSound ?? choice.soundSymbols },
    choice.audioId ? { kind: 'word', audioId: choice.audioId } : { kind: 'cvc', word: choice.id },
  ];
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
  /** When set, every picture plays this sound before its word (Robot Milo's sound for the round). */
  readonly choiceSound?: readonly string[];
}

/** Recorded CVC words whose picture clearly shows the word. */
const BLENDING_WORD_TEXTS = [
  'pan', 'pin', 'tin', 'cat', 'dog', 'pot', 'cap', 'sun', 'bed', 'cup',
  'nut', 'hat', 'bag', 'leg', 'fan', 'box', 'van', 'fox', 'six', 'red',
] as const;

/** Recorded picture words from the letter data, added so early sounds have enough words to practise. */
const EXTRA_PICTURE_WORDS: readonly { readonly segmented: string; readonly audioId: string }[] = [
  { segmented: 's.o.ck', audioId: 'word.sock' },
  { segmented: 's.t.ar', audioId: 'word.star' },
  { segmented: 's.n.a-e.k', audioId: 'word.snake' },
  { segmented: 'a.n.t', audioId: 'word.ant' },
  { segmented: 't.ie', audioId: 'word.t-tie' },
  { segmented: 't.r.ai.n', audioId: 'word.t-train' },
  { segmented: 'p.e.n', audioId: 'word.p-pen' },
  { segmented: 'p.i.g', audioId: 'word.p-pig' },
  { segmented: 'n.e.s.t', audioId: 'word.n-nest' },
  { segmented: 'n.o-e.s=z', audioId: 'word.n-nose' },
  { segmented: 'm.i.l.k', audioId: 'word.milk' },
  { segmented: 'm.oo.n', audioId: 'word.moon' },
  { segmented: 'd.u.ck', audioId: 'word.d-duck' },
  { segmented: 'd.r.u.m', audioId: 'word.d-drum' },
];

export interface BlendingPictureWord {
  readonly text: string;
  readonly segmented: string;
  readonly emoji: string;
  /** Word recording; absent means the CVC whole-word file named by `text`. */
  readonly audioId?: string;
}

const allLetterObjects = Object.values(lettersData).flatMap((letter) => letter.objects);

export const BLENDING_PICTURE_WORDS: readonly BlendingPictureWord[] = [
  ...BLENDING_WORD_TEXTS.map((text) => {
    const source = BLENDING_WORDS.find((word) => word.word === text);
    if (!source) throw new Error(`Missing blending word ${text}`);
    return { text, segmented: source.letters.join('.'), emoji: source.emoji };
  }),
  ...EXTRA_PICTURE_WORDS.map(({ segmented, audioId }) => {
    const source = allLetterObjects.find((object) => object.wordAudioId === audioId);
    if (!source) throw new Error(`Missing picture word ${audioId}`);
    return { text: source.name.toLowerCase(), segmented, emoji: source.emoji, audioId };
  }),
];

export const RHYME_GROUPS: readonly (readonly string[])[] = [
  ['cat', 'hat'],
  ['pan', 'fan', 'van'],
  ['box', 'fox'],
  ['pin', 'tin'],
  ['bed', 'red'],
];

/** Pictures that do not start with their letter's sound, or are hard to picture. */
const NOT_STARTING_WITH_LETTER_SOUND = new Set(['Sheep', 'Owl', 'Under', 'Up']);
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

const graphemeSounds = (segmented: string) => wordSoundSymbols(LETTERS_AND_SOUNDS, segmented);
const firstSoundKey = (segmented: string) => graphemeSounds(segmented)[0]?.join('') ?? '';

/** The sound a correspondence makes, as a comparable key (c and k both give `k`). */
function focusSoundKey(gpcId: string | undefined): string | null {
  const gpc = gpcId ? findGpc(LETTERS_AND_SOUNDS, gpcId)?.gpc : undefined;
  return gpc ? phonemeAudioSymbols(gpc.phoneme).join('') : null;
}

const wordChoice = (word: BlendingPictureWord): PictureChoice => ({
  id: word.text,
  label: word.text,
  emoji: word.emoji,
  audioId: word.audioId,
  soundSymbols: graphemeSounds(word.segmented)[0] ?? [],
});

/** Repeat shuffled items until there are `count` of them. */
function fillTo<T>(items: readonly T[], count: number, random: () => number): T[] {
  const filled: T[] = [];
  while (filled.length < count && items.length > 0) filled.push(...shuffle(items, random));
  return filled.slice(0, count);
}

/** Two pictures that differ from the target and each other, avoiding the focus sound at the start. */
function pickDistractors<T extends { readonly emoji: string }>(
  pool: readonly T[],
  target: T,
  random: () => number,
  sameStart: (candidate: T) => boolean,
): T[] {
  const chosen: T[] = [];
  for (const candidate of shuffle(pool, random)) {
    if (chosen.length === 2) break;
    if (candidate === target || sameStart(candidate) || [target, ...chosen].some((c) => c.emoji === candidate.emoji)) continue;
    chosen.push(candidate);
  }
  return chosen;
}

/**
 * Robot Milo says the sounds; the child finds the picture. With a focus sound,
 * every target starts with it (or contains it, if no picture starts with it).
 */
export function buildBlendingRounds(count: number, random: () => number, focusGpcId?: string): PictureRound[] {
  const focus = focusSoundKey(focusGpcId);
  const starting = focus ? BLENDING_PICTURE_WORDS.filter((w) => firstSoundKey(w.segmented) === focus) : [];
  const containing = focus ? BLENDING_PICTURE_WORDS.filter((w) => graphemeSounds(w.segmented).some((s) => s.join('') === focus)) : [];
  const targets = starting.length > 0 ? starting : containing.length > 0 ? containing : BLENDING_PICTURE_WORDS;
  const targetFirst = (word: BlendingPictureWord) => firstSoundKey(word.segmented);
  const focusGpc = focusGpcId ? findGpc(LETTERS_AND_SOUNDS, focusGpcId)?.gpc : undefined;
  const focusSymbols = focusGpc ? phonemeAudioSymbols(focusGpc.phoneme) : null;
  return fillTo(focus ? targets : shuffle(targets, random), count, random).map((target) => {
    const distractors = pickDistractors(BLENDING_PICTURE_WORDS, target, random, (c) => targetFirst(c) === targetFirst(target) || (focus !== null && targetFirst(c) === focus));
    return {
      correctId: target.text,
      choices: shuffle([target, ...distractors], random).map(wordChoice),
      promptSymbols: wordSoundSymbols(LETTERS_AND_SOUNDS, target.segmented).flat(),
      promptWords: [],
      answerWord: target.text,
      choiceSound: focusSymbols ?? graphemeSounds(target.segmented)[0] ?? [],
    };
  });
}

/** Milo wants something that starts with a sound; one picture does. With a focus sound, every round uses it. */
export function buildFirstSoundRounds(count: number, random: () => number, focusGpcId?: string): PictureRound[] {
  const focus = focusSoundKey(focusGpcId);
  const focused = focus ? FIRST_SOUND_PICTURES.filter((p) => p.initialSoundSymbols.join('') === focus) : [];
  const targets = focused.length > 0 ? fillTo(focused, count, random) : shuffle(FIRST_SOUND_PICTURES, random).slice(0, count);
  return targets.map((target) => {
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
      choices: shuffle([target, ...distractors], random).map((p) => ({
        id: p.id,
        label: p.name,
        emoji: p.emoji,
        audioId: p.wordAudioId,
        soundSymbols: p.initialSoundSymbols,
      })),
      promptSymbols: target.initialSoundSymbols,
      promptWords: [],
    };
  });
}

/** Two words rhyme and one does not; the child finds the odd one out. Uses CVC recordings only. */
export function buildOddOneOutRounds(count: number, random: () => number): PictureRound[] {
  const cvcWords = BLENDING_PICTURE_WORDS.filter((word) => !word.audioId);
  const byText = new Map(cvcWords.map((word) => [word.text, word]));
  return Array.from({ length: count }, () => {
    const group = RHYME_GROUPS[Math.floor(random() * RHYME_GROUPS.length)]!;
    const pair = shuffle(group, random).slice(0, 2);
    const ending = pair[0]!.slice(1);
    const odd = shuffle(cvcWords.filter((word) => word.text.slice(1) !== ending), random)[0]!;
    const choices = shuffle([...pair.map((text) => byText.get(text)!), odd], random).map(wordChoice);
    return { correctId: odd.text, choices, promptSymbols: [], promptWords: choices.map((choice) => choice.id) };
  });
}

/** Sound boxes words, preferring words that contain the focus sound. */
export function selectSoundBoxWords(count: number, random: () => number, focusGpcId?: string): BlendingPictureWord[] {
  const focus = focusSoundKey(focusGpcId);
  const containing = focus ? BLENDING_PICTURE_WORDS.filter((w) => graphemeSounds(w.segmented).some((s) => s.join('') === focus)) : [];
  return containing.length > 0 ? fillTo(containing, count, random) : shuffle(BLENDING_PICTURE_WORDS, random).slice(0, count);
}

export interface SoundPicture {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly wordAudioId: string;
}

/**
 * Pictures for a single-letter sound from the letter data (x pictures end with
 * the sound). Multi-letter sounds have no pictures until their words are recorded.
 */
export function soundPictures(gpcId: string): { position: 'start' | 'end'; pictures: SoundPicture[] } {
  const gpc = findGpc(LETTERS_AND_SOUNDS, gpcId)?.gpc;
  if (!gpc || gpc.grapheme.length !== 1) return { position: 'start', pictures: [] };
  const objects = lettersData[gpc.grapheme]?.objects ?? [];
  const position = gpc.grapheme === 'x' ? 'end' : 'start';
  return {
    position,
    pictures: objects
      .filter((object) => position === 'end' || !NOT_STARTING_WITH_LETTER_SOUND.has(object.name))
      .map((object) => ({ id: object.id, name: object.name, emoji: object.emoji, wordAudioId: object.wordAudioId })),
  };
}
