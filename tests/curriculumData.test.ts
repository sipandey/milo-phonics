import { describe, expect, it } from 'vitest';
import { CURRICULUM_LEVELS } from '../src/data/curriculumData';

describe('curriculum contract', () => {
  it('publishes seven ordered levels with the first sound set', () => {
    expect(CURRICULUM_LEVELS).toHaveLength(7);
    expect(CURRICULUM_LEVELS.map(({ id }) => id)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(CURRICULUM_LEVELS[0]?.letterIds).toEqual(['s', 'a', 't', 'p']);
  });
});
