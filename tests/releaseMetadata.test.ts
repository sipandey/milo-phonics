import { describe, expect, it } from 'vitest';
import { createReleaseMetadata, resolveReleaseChannel } from '../src/release/releaseMetadata';

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

  it('derives the deployment channel from Vercel when no explicit channel is set', () => {
    expect(resolveReleaseChannel({ VERCEL_ENV: 'production' })).toBe('production');
    expect(resolveReleaseChannel({ VERCEL_ENV: 'preview' })).toBe('preview');
  });

  it('prefers an explicit channel over hosting-provider metadata', () => {
    expect(resolveReleaseChannel({ RELEASE_CHANNEL: 'staging', VERCEL_ENV: 'production' })).toBe('staging');
  });

  it('keeps local and CI defaults when deployment metadata is absent', () => {
    expect(resolveReleaseChannel({})).toBe('local');
    expect(resolveReleaseChannel({ CI: 'true' })).toBe('ci');
  });
});
