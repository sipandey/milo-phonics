import type { LettersAndSoundsProgramme } from '../types/lettersAndSounds';

export type LettersAndSoundsFindingCode =
  | 'DUPLICATE_ID'
  | 'DUPLICATE_TRICKY_WORD'
  | 'MALFORMED_WORD'
  | 'UNTAUGHT_GRAPHEME'
  | 'MISSING_TARGET_GRAPHEME'
  | 'NO_ADJACENT_CONSONANTS';

export interface LettersAndSoundsFinding {
  readonly code: LettersAndSoundsFindingCode;
  readonly itemId: string;
  readonly message: string;
}

export interface ParsedWord {
  readonly text: string;
  readonly graphemes: readonly string[];
}

export interface DecodabilityOptions {
  /** Accept doubled consonants (bb, dd, nn, tt…) whose single letter is known. */
  readonly allowDoubledConsonants?: boolean;
}

const VOWEL_LETTERS = /[aeiou]/;
const SPLIT_DIGRAPH = /^[a-z]-e$/i;

/** Parse a segmented word such as `k.i.ck`, `m.a-e.k`, or `z.i.g|z.a.g`. */
export function parseSegmentedWord(segmented: string): ParsedWord {
  if (segmented.trim() === '') throw new Error('Segmented word is empty');

  const graphemes: string[] = [];
  const parts = segmented.split('|').map((part) => {
    const tokens = part.split('.');
    let text = '';
    let pendingE = '';
    tokens.forEach((token, index) => {
      if (token === '') throw new Error(`Empty grapheme in "${segmented}"`);
      if (SPLIT_DIGRAPH.test(token)) {
        if (index === tokens.length - 1) throw new Error(`Split digraph has no following grapheme in "${segmented}"`);
        text += token[0];
        pendingE = token[2] ?? 'e';
      } else {
        text += token + pendingE;
        pendingE = '';
      }
      graphemes.push(token.toLowerCase());
    });
    return text;
  });

  return { text: parts.join('-'), graphemes };
}

function isDoubledConsonant(grapheme: string): boolean {
  return grapheme.length === 2 && grapheme[0] === grapheme[1] && !VOWEL_LETTERS.test(grapheme);
}

function isConsonantGrapheme(grapheme: string): boolean {
  return grapheme === 'qu' || !VOWEL_LETTERS.test(grapheme);
}

function untaughtGraphemes(
  graphemes: readonly string[],
  known: ReadonlySet<string>,
  options: DecodabilityOptions,
): string[] {
  return graphemes.filter((grapheme) => {
    if (known.has(grapheme)) return false;
    const doubledLetter = grapheme[0] ?? '';
    return !(options.allowDoubledConsonants && isDoubledConsonant(grapheme) && known.has(doubledLetter));
  });
}

/** True when every grapheme in the word is known (used for runtime word selection). */
export function isDecodableWith(
  segmented: string,
  known: ReadonlySet<string>,
  options: DecodabilityOptions = {},
): boolean {
  return untaughtGraphemes(parseSegmentedWord(segmented).graphemes, known, options).length === 0;
}

/**
 * Walk the programme in teaching order and check that every word is decodable
 * from the correspondences taught up to and including its own.
 */
export function validateLettersAndSounds(programme: LettersAndSoundsProgramme): LettersAndSoundsFinding[] {
  const findings: LettersAndSoundsFinding[] = [];
  const add = (code: LettersAndSoundsFindingCode, itemId: string, message: string) =>
    findings.push({ code, itemId, message });

  const known = new Set<string>();
  const seenIds = new Set<string>();
  const seenTrickyWords = new Set<string>();
  let allowDoubledConsonants = false;

  const checkWord = (itemPrefix: string, segmented: string, targets: readonly string[] | null) => {
    let parsed: ParsedWord;
    try {
      parsed = parseSegmentedWord(segmented);
    } catch (error) {
      add('MALFORMED_WORD', `${itemPrefix}:${segmented}`, (error as Error).message);
      return;
    }
    const itemId = `${itemPrefix}:${parsed.text}`;
    const missing = untaughtGraphemes(parsed.graphemes, known, { allowDoubledConsonants });
    if (missing.length > 0) {
      add('UNTAUGHT_GRAPHEME', itemId, `"${parsed.text}" uses ${missing.join(', ')} before it is taught`);
    }
    if (targets && !parsed.graphemes.some((grapheme) => targets.includes(grapheme))) {
      add('MISSING_TARGET_GRAPHEME', itemId, `"${parsed.text}" does not contain ${targets.join(' or ')}`);
    }
    if (!targets && !parsed.graphemes.some((g, i) => isConsonantGrapheme(g) && isConsonantGrapheme(parsed.graphemes[i + 1] ?? 'a'))) {
      add('NO_ADJACENT_CONSONANTS', itemId, `"${parsed.text}" has no adjacent consonants`);
    }
  };

  for (const phase of programme.phases) {
    for (const set of phase.sets) {
      for (const gpc of set.gpcs) {
        if (seenIds.has(gpc.id)) add('DUPLICATE_ID', gpc.id, `Duplicate correspondence ID ${gpc.id}`);
        seenIds.add(gpc.id);

        const targets = [gpc.grapheme, ...(gpc.alternativeGraphemes ?? [])].map((g) => g.toLowerCase());
        for (const grapheme of targets) {
          known.add(grapheme);
          if (isDoubledConsonant(grapheme)) allowDoubledConsonants = true;
        }
        for (const word of gpc.words) checkWord(gpc.id, word, targets);
      }
    }

    for (const word of phase.adjacentConsonantWords ?? []) checkWord(`phase.${phase.id}`, word, null);

    for (const tricky of phase.trickyWords) {
      const key = tricky.toLowerCase();
      if (seenTrickyWords.has(key)) add('DUPLICATE_TRICKY_WORD', tricky, `Tricky word "${tricky}" is listed more than once`);
      seenTrickyWords.add(key);
    }
  }

  return findings;
}
