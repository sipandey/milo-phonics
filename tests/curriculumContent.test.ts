import { describe, expect, it } from 'vitest';
import {
  CURRICULUM_CONTENT,
  CURRICULUM_CONTENT_VERSION,
  getCurriculumLevelById,
  getCurriculumWordsForLevel,
} from '../src/data/curriculumContent';

describe('curriculum content manifest', () => {
  it('declares a versioned, review-state schema with the required content areas', () => {
    expect(CURRICULUM_CONTENT.schemaVersion).toBe(1);
    expect(CURRICULUM_CONTENT.contentVersion).toBe(CURRICULUM_CONTENT_VERSION);
    expect(CURRICULUM_CONTENT.status).toBe('review');
    expect(CURRICULUM_CONTENT.soundSets.length).toBeGreaterThan(0);
    expect(CURRICULUM_CONTENT.phonemes.length).toBeGreaterThan(0);
    expect(CURRICULUM_CONTENT.graphemes.length).toBeGreaterThan(0);
    expect(CURRICULUM_CONTENT.words.length).toBeGreaterThan(0);
    expect(CURRICULUM_CONTENT.digraphs.map(({ text }) => text)).toEqual(['sh', 'ch', 'th', 'ck', 'ng', 'qu']);
    expect(CURRICULUM_CONTENT.digraphs.every(({ status }) => status === 'draft')).toBe(true);
    expect(CURRICULUM_CONTENT.readerPages).toEqual([]);
    expect(CURRICULUM_CONTENT.reviewRules.length).toBeGreaterThan(0);
    expect(CURRICULUM_CONTENT.scope.summary).toContain('letter-sound');
  });

  it('derives UI-facing level and word lookups from the manifest', () => {
    expect(getCurriculumLevelById(1)?.letterIds).toEqual(['s', 'a', 't', 'p']);
    expect(getCurriculumWordsForLevel(1).map(({ id }) => id)).toContain('sat');
    expect(getCurriculumWordsForLevel(1).map(({ id }) => id)).not.toContain('pan');
  });

  it('classifies current word entries without changing their source data', () => {
    expect(CURRICULUM_CONTENT.words.find(({ id }) => id === 'at')?.shape).toBe('VC');
    expect(CURRICULUM_CONTENT.words.find(({ id }) => id === 'sat')?.shape).toBe('CVC');
    expect(CURRICULUM_CONTENT.words.find(({ id }) => id === 'sat')?.audio.word).toBe('cvc.sat');
  });
});
