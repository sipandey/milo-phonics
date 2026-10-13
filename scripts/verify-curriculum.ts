import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { BLENDING_WORDS } from '../src/data/blendingData.ts';
import { cvcAudioManifest } from '../src/data/cvcAudioManifest.ts';
import { CURRICULUM_LEVELS } from '../src/data/curriculumData.ts';
import { validateCurriculum } from './curriculumValidation.ts';

const audioIds = new Set<string>();
const localAssetPaths = new Set<string>();

for (const [wordId, entry] of Object.entries(cvcAudioManifest)) {
  const wordAudioId = `cvc.${wordId}`;
  const sentenceAudioId = `sentence.${wordId}`;
  audioIds.add(wordAudioId);
  audioIds.add(sentenceAudioId);
  if (existsSync(resolve('public', entry.localWordUrl.slice(1)))) localAssetPaths.add(entry.localWordUrl);
  if (existsSync(resolve('public', entry.localSentenceUrl.slice(1)))) localAssetPaths.add(entry.localSentenceUrl);
}

const findings = validateCurriculum({
  levels: CURRICULUM_LEVELS,
  words: BLENDING_WORDS,
  audioIds,
  localAssetPaths,
});

if (findings.length > 0) {
  console.error(`Curriculum validation found ${findings.length} release-blocking finding(s):`);
  for (const finding of findings) {
    console.error(`- [${finding.code}] ${finding.itemId}: ${finding.message}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Curriculum validation passed for ${BLENDING_WORDS.length} blending entries.`);
}
