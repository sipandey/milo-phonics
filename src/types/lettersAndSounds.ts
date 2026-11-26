/**
 * Letters and Sounds programme model (Phases 1–5).
 *
 * Words are written as segmented strings so each grapheme is explicit:
 * - `.` separates graphemes: `s.a.t`, `k.i.ck`
 * - a split digraph is one token: `m.a-e.k` → "make"
 * - `|` is a literal hyphen between parts: `z.i.g|z.a.g` → "zig-zag"
 * - capitals are kept in the text but ignored when matching: `T.i.m`
 */

export type LettersAndSoundsPhaseId = 1 | 2 | 3 | 4 | 5;

export interface GraphemePhonemeCorrespondence {
  /** Stable ID, unique across the programme, e.g. `gpc.s`, `gpc.oo-long`. */
  readonly id: string;
  readonly grapheme: string;
  /** Other spellings taught at the same time, e.g. `ff` with `f`. */
  readonly alternativeGraphemes?: readonly string[];
  /** IPA phoneme, e.g. `s`, `ʃ`, `eɪ`. */
  readonly phoneme: string;
  /** Segmented practice words, decodable once this correspondence is taught. */
  readonly words: readonly string[];
  /** Pronunciation or teaching notes for adult review, e.g. irregular words. */
  readonly notes?: readonly string[];
}

export interface LettersAndSoundsSet {
  readonly id: string;
  readonly title: string;
  readonly gpcs: readonly GraphemePhonemeCorrespondence[];
}

export interface PhaseOneAspect {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly activityIdeas: readonly string[];
}

export interface LettersAndSoundsPhase {
  readonly id: LettersAndSoundsPhaseId;
  readonly title: string;
  readonly approxAge: string;
  readonly summary: string;
  readonly sets: readonly LettersAndSoundsSet[];
  readonly trickyWords: readonly string[];
  /** Phase 1 only: listening and speaking aspects. */
  readonly aspects?: readonly PhaseOneAspect[];
  /** Phase 4 only: words with adjacent consonants, built from known correspondences. */
  readonly adjacentConsonantWords?: readonly string[];
}

export interface LettersAndSoundsProgramme {
  readonly version: string;
  readonly source: string;
  readonly phases: readonly LettersAndSoundsPhase[];
}
