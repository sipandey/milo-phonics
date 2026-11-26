import { cvcAudioManifest } from '../data/cvcAudioManifest';
import type {
  GraphemePhonemeCorrespondence,
  LettersAndSoundsPhase,
  LettersAndSoundsPhaseId,
  LettersAndSoundsProgramme,
  LettersAndSoundsSet,
} from '../types/lettersAndSounds';
import { parsePronunciations, parseSegmentedWord } from './lettersAndSoundsValidation';

/** Phonemes whose sound-library file differs from the IPA, or that play as two sounds. */
const AUDIO_SYMBOL_OVERRIDES: Record<string, readonly string[]> = { ks: ['x'], kw: ['k', 'w'] };

/** Sound-library file symbols for a phoneme (`/audio/<symbol>_isolation.mp3`). */
export function phonemeAudioSymbols(phoneme: string): string[] {
  return [...(AUDIO_SYMBOL_OVERRIDES[phoneme] ?? [phoneme])];
}

export interface GpcLocation {
  readonly phase: LettersAndSoundsPhase;
  readonly set: LettersAndSoundsSet;
  readonly gpc: GraphemePhonemeCorrespondence;
}

function* eachGpc(programme: LettersAndSoundsProgramme): Generator<GpcLocation> {
  for (const phase of programme.phases) {
    for (const set of phase.sets) {
      for (const gpc of set.gpcs) yield { phase, set, gpc };
    }
  }
}

export function findGpc(programme: LettersAndSoundsProgramme, gpcId: string): GpcLocation | null {
  for (const location of eachGpc(programme)) if (location.gpc.id === gpcId) return location;
  return null;
}

export function listPhaseGpcs(
  programme: LettersAndSoundsProgramme,
  phaseId: LettersAndSoundsPhaseId,
): GraphemePhonemeCorrespondence[] {
  return [...eachGpc(programme)].filter((location) => location.phase.id === phaseId).map((location) => location.gpc);
}

const spellings = (gpc: GraphemePhonemeCorrespondence) =>
  [gpc.grapheme, ...(gpc.alternativeGraphemes ?? [])].map((grapheme) => grapheme.toLowerCase());

const isDoubledConsonant = (grapheme: string) =>
  grapheme.length === 2 && grapheme[0] === grapheme[1] && !/[aeiou]/.test(grapheme);

/** The sounds to play for each grapheme of a word, in order. */
export function wordSoundSymbols(
  programme: LettersAndSoundsProgramme,
  segmented: string,
  preferredGpcId?: string,
): string[][] {
  const preferred = preferredGpcId ? findGpc(programme, preferredGpcId)?.gpc : undefined;
  const all = [...eachGpc(programme)].map((location) => location.gpc);
  const lookup = (grapheme: string) =>
    (preferred && spellings(preferred).includes(grapheme) ? preferred : undefined) ??
    all.find((gpc) => spellings(gpc).includes(grapheme));

  const pronunciations = parsePronunciations(segmented);
  return parseSegmentedWord(segmented).graphemes.map((grapheme, index) => {
    const pronunciation = pronunciations[index];
    if (pronunciation) return phonemeAudioSymbols(pronunciation);
    const gpc = lookup(grapheme) ?? (isDoubledConsonant(grapheme) ? lookup(grapheme[0] ?? '') : undefined);
    return gpc ? phonemeAudioSymbols(gpc.phoneme) : [grapheme];
  });
}

function missingGraphemes(graphemes: readonly string[], known: ReadonlySet<string>): string[] {
  const allowDoubled = [...known].some(isDoubledConsonant);
  const missing = graphemes.filter(
    (grapheme) => !known.has(grapheme) && !(allowDoubled && isDoubledConsonant(grapheme) && known.has(grapheme[0] ?? '')),
  );
  return [...new Set(missing)];
}

export interface SoundPageWord {
  readonly segmented: string;
  readonly text: string;
  readonly decodable: boolean;
  /** Graphemes not yet known, in the order they appear. */
  readonly missing: readonly string[];
}

/** A correspondence's listed words, marked decodable or not from the known graphemes. */
export function wordsForGpc(gpc: GraphemePhonemeCorrespondence, known: ReadonlySet<string>): SoundPageWord[] {
  return gpc.words.map((segmented) => {
    const { text, graphemes } = parseSegmentedWord(segmented);
    const missing = missingGraphemes(graphemes, known);
    return { segmented, text, decodable: missing.length === 0, missing };
  });
}

export interface PractiseWordsResult {
  readonly words: readonly { readonly segmented: string; readonly text: string; readonly gpcId: string }[];
  /** True when fewer than the minimum fit: introduce another sound or use listening-only blending. */
  readonly needsMoreSounds: boolean;
}

/**
 * Words that contain at least one focus sound and use only known or focus
 * sounds, in teaching order.
 */
export function selectPractiseWords(
  programme: LettersAndSoundsProgramme,
  known: ReadonlySet<string>,
  focusGpcIds: readonly string[],
  minimum = 3,
): PractiseWordsResult {
  const focusGraphemes = new Set(
    focusGpcIds.flatMap((id) => {
      const gpc = findGpc(programme, id)?.gpc;
      return gpc ? spellings(gpc) : [];
    }),
  );
  if (focusGraphemes.size === 0) return { words: [], needsMoreSounds: false };

  const available = new Set([...known, ...focusGraphemes]);
  const seen = new Set<string>();
  const words: { segmented: string; text: string; gpcId: string }[] = [];
  const consider = (segmented: string, gpcId: string) => {
    const { text, graphemes } = parseSegmentedWord(segmented);
    const key = text.toLowerCase();
    if (seen.has(key) || !graphemes.some((g) => focusGraphemes.has(g))) return;
    if (missingGraphemes(graphemes, available).length > 0) return;
    seen.add(key);
    words.push({ segmented, text, gpcId });
  };

  for (const phase of programme.phases) {
    for (const set of phase.sets) for (const gpc of set.gpcs) for (const word of gpc.words) consider(word, gpc.id);
    for (const word of phase.adjacentConsonantWords ?? []) consider(word, `phase.${phase.id}`);
  }
  return { words, needsMoreSounds: words.length < minimum };
}

/** True when a recorded whole-word file exists (currently the CVC catalogue). */
export function hasWholeWordAudio(text: string): boolean {
  return Object.prototype.hasOwnProperty.call(cvcAudioManifest, text.toLowerCase());
}
