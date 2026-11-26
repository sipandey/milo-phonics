import type { LettersAndSoundsProgramme } from '../../types/lettersAndSounds';
import { PHASE_1 } from './phase1';
import { PHASE_2 } from './phase2';
import { PHASE_3 } from './phase3';
import { PHASE_4 } from './phase4';
import { PHASE_5 } from './phase5';

export const LETTERS_AND_SOUNDS_VERSION = '2026.11.26.1';

/**
 * Letters and Sounds Phases 1–5 for parent-led home teaching. Sequence and
 * word lists follow Letters and Sounds (DfE, 2007) as supplied by the
 * maintainer; changes for decodability are noted in each phase file.
 * Not yet reviewed by a phonics specialist.
 */
export const LETTERS_AND_SOUNDS: LettersAndSoundsProgramme = {
  version: LETTERS_AND_SOUNDS_VERSION,
  source: 'Letters and Sounds (DfE, 2007), supplied by the maintainer; not specialist-reviewed.',
  phases: [PHASE_1, PHASE_2, PHASE_3, PHASE_4, PHASE_5],
};
