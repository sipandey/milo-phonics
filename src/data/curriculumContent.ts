import { BLENDING_WORDS as SOURCE_BLENDING_WORDS } from './blendingData';
import { CURRICULUM_LEVELS as SOURCE_CURRICULUM_LEVELS } from './curriculumData';
import { lettersData } from './lettersData';
import type {
  CurriculumContentManifest,
  CurriculumDigraph,
  CurriculumGrapheme,
  CurriculumPhoneme,
  CurriculumSoundSet,
  CurriculumWord,
  CurriculumWordShape,
} from '../types/curriculum';
import type { BlendingWord } from '../types/phonics';

export const CURRICULUM_CONTENT_VERSION = '2026.10.13.1';

const CONTENT_STATUS = 'review' as const;

function getLetterData(letterId: string) {
  const letter = lettersData[letterId];
  if (!letter) {
    throw new Error(`Curriculum references missing letter data: ${letterId}`);
  }
  return letter;
}

function getWordShape(word: BlendingWord): CurriculumWordShape {
  if (word.letters.length === 2) return 'VC';
  if (word.letters.length === 3) return 'CVC';
  if (word.letters.some((letter) => letter.length > 1)) return 'DIGRAPH';
  return 'OTHER';
}

const phonemes: CurriculumPhoneme[] = [];
const graphemes: CurriculumGrapheme[] = [];
const seenGraphemes = new Set<string>();

for (const soundSet of SOURCE_CURRICULUM_LEVELS) {
  for (const letterId of soundSet.letterIds) {
    if (seenGraphemes.has(letterId)) continue;

    const letter = getLetterData(letterId);
    const phonemeId = `phoneme.${letterId}`;
    phonemes.push({
      id: phonemeId,
      grapheme: letterId,
      phoneme: letter.phoneme,
      audioAssetId: letter.phonemeAudioId,
      introducedInLevelId: soundSet.id,
      status: CONTENT_STATUS,
    });
    graphemes.push({
      id: `grapheme.${letterId}`,
      text: letterId,
      phonemeIds: [phonemeId],
      audioAssetId: letter.letterAudioId,
      introducedInLevelId: soundSet.id,
      status: CONTENT_STATUS,
    });
    seenGraphemes.add(letterId);
  }
}

const soundSets: CurriculumSoundSet[] = SOURCE_CURRICULUM_LEVELS.map((soundSet, index) => ({
  ...soundSet,
  status: CONTENT_STATUS,
  prerequisiteLevelIds: index === 0 ? [] : [SOURCE_CURRICULUM_LEVELS[index - 1]?.id ?? soundSet.id],
  reviewRuleIds: ['review.default'],
  audioAssetIds: soundSet.letterIds.flatMap((letterId) => {
    const letter = getLetterData(letterId);
    return [letter.letterAudioId, letter.phonemeAudioId];
  }),
}));

const words: CurriculumWord[] = SOURCE_BLENDING_WORDS.map((word) => ({
  id: word.id,
  text: word.word,
  shape: getWordShape(word),
  levelId: word.levelId,
  graphemeIds: word.letters.map((letter) => `grapheme.${letter}`),
  phonemeIds: word.phonemeAudioIds,
  audio: {
    word: word.cvcAudioId ?? word.wordAudioId,
    sentence: word.sentenceAudioId,
  },
  status: CONTENT_STATUS,
  source: word,
}));

const digraphs: readonly CurriculumDigraph[] = ['sh', 'ch', 'th', 'ck', 'ng', 'qu'].map((text) => ({
  id: `digraph.${text}`,
  text,
  phonemeIds: [],
  introducedInLevelId: null,
  audioAssetIds: [],
  status: 'draft',
}));

export const CURRICULUM_CONTENT: CurriculumContentManifest = {
  schemaVersion: 1,
  contentVersion: CURRICULUM_CONTENT_VERSION,
  status: CONTENT_STATUS,
  scope: {
    summary: 'Introductory letter-sound and short-word blending activities.',
    included: [
      'Single-letter phonemes and graphemes in the current sound-set order.',
      'VC and CVC word records with reviewable audio references.',
      'Draft extension points for digraphs, readers, and review scheduling.',
    ],
    excludedClaims: [
      'Formal curriculum or SSP alignment.',
      'Diagnostic, mastery, age-suitability, or learning-outcome claims.',
    ],
  },
  soundSets,
  phonemes,
  graphemes,
  words,
  digraphs,
  readerPages: [],
  reviewRules: [
    {
      id: 'review.default',
      description: 'Revisit a recently practised item in a later short session.',
      maxItemsPerSession: 5,
      revisitAfterSessions: 1,
      status: CONTENT_STATUS,
    },
  ],
  blendingWords: SOURCE_BLENDING_WORDS,
};

export const CURRICULUM_LEVELS = CURRICULUM_CONTENT.soundSets;
export const BLENDING_WORDS = CURRICULUM_CONTENT.blendingWords;

export function getCurriculumLevelById(levelId: number): CurriculumSoundSet | undefined {
  return CURRICULUM_CONTENT.soundSets.find((soundSet) => soundSet.id === levelId);
}

export function getCurriculumLevelForLetter(letterId: string): CurriculumSoundSet | undefined {
  const cleanId = letterId.toLowerCase();
  return CURRICULUM_CONTENT.soundSets.find((soundSet) => soundSet.letterIds.includes(cleanId));
}

export function getCurriculumWordsForLevel(levelId: number): readonly BlendingWord[] {
  return CURRICULUM_CONTENT.blendingWords.filter((word) => word.levelId <= levelId);
}

export function getStrictCurriculumWordsForLevel(levelId: number): readonly BlendingWord[] {
  return CURRICULUM_CONTENT.blendingWords.filter((word) => word.levelId === levelId);
}

export const getLevelById = getCurriculumLevelById;
export const getLevelForLetter = getCurriculumLevelForLetter;
export const getWordsForLevel = getCurriculumWordsForLevel;
export const getStrictWordsForLevel = getStrictCurriculumWordsForLevel;
