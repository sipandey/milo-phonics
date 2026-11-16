import type { BlendingWord, PhonicsLevel } from '../src/types/phonics';

export type CurriculumFindingCode =
  | 'DUPLICATE_ID'
  | 'INVALID_LEVEL'
  | 'NON_CVC_WORD'
  | 'UNTAUGHT_LETTER'
  | 'PHONEME_ALIGNMENT'
  | 'MISSING_AUDIO_ID'
  | 'MISSING_LOCAL_ASSET';

export interface CurriculumFinding {
  readonly code: CurriculumFindingCode;
  readonly itemId: string;
  readonly message: string;
}

export interface CurriculumValidationInput {
  readonly levels: readonly PhonicsLevel[];
  readonly words: readonly BlendingWord[];
  readonly audioIds: ReadonlySet<string>;
  readonly localAssetPaths: ReadonlySet<string>;
}

function addFinding(
  findings: CurriculumFinding[],
  code: CurriculumFindingCode,
  itemId: string,
  message: string,
): void {
  findings.push({ code, itemId, message });
}

function localPathForAudioId(audioId: string): string {
  if (audioId.startsWith('cvc.')) return `/audio/cvc/cvc.${audioId.slice(4)}.mp3`;
  return `/audio/sentences/sentence.${audioId.slice(9)}.mp3`;
}

export function validateCurriculum(
  input: CurriculumValidationInput,
): CurriculumFinding[] {
  const findings: CurriculumFinding[] = [];
  const levelIds = new Set(input.levels.map((level) => level.id));
  const firstIntroducedLevel = new Map<string, number>();

  for (const level of input.levels) {
    for (const letter of level.letterIds) {
      if (!firstIntroducedLevel.has(letter)) firstIntroducedLevel.set(letter, level.id);
    }
  }

  const seenIds = new Set<string>();
  for (const word of input.words) {
    if (seenIds.has(word.id)) {
      addFinding(findings, 'DUPLICATE_ID', word.id, `Duplicate blending ID: ${word.id}`);
    }
    seenIds.add(word.id);

    if (!levelIds.has(word.levelId)) {
      addFinding(findings, 'INVALID_LEVEL', word.id, `Word ${word.id} references missing level ${word.levelId}`);
    }

    if (word.word.length !== 3) {
      addFinding(findings, 'NON_CVC_WORD', word.id, `Word ${word.id} is ${word.word.length === 2 ? 'VC' : 'not a simple three-letter'} but uses the CVC curriculum shape`);
    }

    for (const letter of word.letters) {
      const introducedAt = firstIntroducedLevel.get(letter);
      if (introducedAt === undefined || introducedAt > word.levelId) {
        addFinding(findings, 'UNTAUGHT_LETTER', word.id, `Word ${word.id} uses letter ${letter} before level ${introducedAt ?? 'an available curriculum level'}`);
      }
    }

    const expectedGroups = word.letters.map((letter) => (
      letter === 'x' ? ['phoneme.k', 'phoneme.s'] : [`phoneme.${letter}`]
    ));
    const actualGroups = word.phonemeAudioGroups ?? word.phonemeAudioIds.map((audioId) => [audioId]);

    if (actualGroups.length !== word.letters.length) {
      addFinding(findings, 'PHONEME_ALIGNMENT', word.id, `Word ${word.id} has ${word.letters.length} letters but ${actualGroups.length} phoneme groups`);
    }

    if (actualGroups.flat().join('|') !== word.phonemeAudioIds.join('|')) {
      addFinding(findings, 'PHONEME_ALIGNMENT', word.id, `Word ${word.id} has phoneme groups that do not match its flattened phoneme IDs`);
    }

    expectedGroups.forEach((expectedGroup, index) => {
      const actualGroup = actualGroups[index] ?? [];
      if (actualGroup.join('|') !== expectedGroup.join('|')) {
        addFinding(findings, 'PHONEME_ALIGNMENT', word.id, `Word ${word.id} expects ${expectedGroup.join(' + ')} for letter ${word.letters[index]} at position ${index + 1}`);
      }
    });

    for (const audioId of [word.cvcAudioId, word.sentenceAudioId]) {
      if (!audioId) continue;
      if (!input.audioIds.has(audioId)) {
        addFinding(findings, 'MISSING_AUDIO_ID', word.id, `Word ${word.id} references missing audio ID ${audioId}`);
        continue;
      }
      const localPath = localPathForAudioId(audioId);
      if (!input.localAssetPaths.has(localPath)) {
        addFinding(findings, 'MISSING_LOCAL_ASSET', word.id, `Word ${word.id} is missing bundled asset ${localPath}`);
      }
    }
  }

  return findings;
}
