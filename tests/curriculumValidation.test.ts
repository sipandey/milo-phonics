import { describe, expect, it } from 'vitest';
import type { BlendingWord, PhonicsLevel } from '../src/types/phonics';
import { validateCurriculum } from '../scripts/curriculumValidation';

const levels: PhonicsLevel[] = [
  {
    id: 1,
    title: 'One',
    subtitle: 'One',
    badgeEmoji: '🌱',
    letterIds: ['s', 'a', 't'],
    requiredStarsToUnlock: 0,
    colorTheme: { from: '', to: '', accent: '', cardBg: '', border: '' },
    decodableWordsPreview: [],
  },
  {
    id: 2,
    title: 'Two',
    subtitle: 'Two',
    badgeEmoji: '🌱',
    letterIds: ['b'],
    requiredStarsToUnlock: 0,
    colorTheme: { from: '', to: '', accent: '', cardBg: '', border: '' },
    decodableWordsPreview: [],
  },
];

const createWord = (overrides: Partial<BlendingWord>): BlendingWord => ({
  id: 'sat',
  word: 'sat',
  levelId: 1,
  letters: ['s', 'a', 't'],
  phonemeAudioIds: ['phoneme.s', 'phoneme.a', 'phoneme.t'],
  emoji: '⭐',
  meaning: 'A star',
  cvcAudioId: 'cvc.sat',
  sentenceAudioId: 'sentence.sat',
  color: '#000000',
  ...overrides,
});

describe('curriculum validation', () => {
  it('reports duplicate IDs, non-CVC entries, prerequisite gaps, alignment gaps, and missing audio', () => {
    const findings = validateCurriculum({
      levels,
      words: [
        createWord({}),
        createWord({
          word: 'at',
          letters: ['a', 't'],
          phonemeAudioIds: ['phoneme.a', 'phoneme.t'],
          cvcAudioId: 'cvc.at',
          sentenceAudioId: 'sentence.at',
        }),
        createWord({
          letters: ['b', 'a', 't'],
          phonemeAudioIds: ['phoneme.b', 'phoneme.a'],
          cvcAudioId: 'cvc.missing',
          sentenceAudioId: 'sentence.missing',
        }),
      ],
      audioIds: new Set(['cvc.sat', 'sentence.sat', 'cvc.at', 'sentence.at']),
      localAssetPaths: new Set(['/audio/cvc/cvc.sat.mp3', '/audio/sentences/sentence.sat.mp3']),
    });

    expect(findings.map((finding) => finding.code)).toEqual(expect.arrayContaining([
      'DUPLICATE_ID',
      'NON_CVC_WORD',
      'UNTAUGHT_LETTER',
      'PHONEME_ALIGNMENT',
      'MISSING_AUDIO_ID',
      'MISSING_LOCAL_ASSET',
    ]));
  });

  it('passes a complete, correctly ordered word', () => {
    const findings = validateCurriculum({
      levels,
      words: [createWord({})],
      audioIds: new Set(['cvc.sat', 'sentence.sat']),
      localAssetPaths: new Set(['/audio/cvc/cvc.sat.mp3', '/audio/sentences/sentence.sat.mp3']),
    });

    expect(findings).toEqual([]);
  });
});
