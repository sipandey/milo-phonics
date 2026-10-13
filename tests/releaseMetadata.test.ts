import { describe, expect, it } from 'vitest';
import { createReleaseMetadata } from '../src/release/releaseMetadata';

describe('release metadata', () => {
  it('creates a traceable version, commit, and channel record', () => {
    expect(createReleaseMetadata('1.0.0', 'abc123', 'preview')).toEqual({
      version: '1.0.0',
      commit: 'abc123',
      channel: 'preview',
    });
  });

  it('uses explicit local defaults when deployment metadata is absent', () => {
    expect(createReleaseMetadata('1.0.0')).toEqual({
      version: '1.0.0',
      commit: 'local',
      channel: 'local',
    });
  });
});
