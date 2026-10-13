import { describe, expect, it } from 'vitest';
import { getAudioEntry } from '../src/data/audioManifest';
import { AUDIO_RUNTIME_STATUS } from '../src/components/parent/audioRuntimeStatus';

describe('semantic audio URL resolution', () => {
  it('resolves phonemes to the local Oxford asset path', () => {
    expect(getAudioEntry('phoneme.s')).toMatchObject({
      source: 'local',
      url: '/audio/phoneme_s.mp3',
    });
  });

  it('prefers the generated local word asset over its CDN URL', () => {
    expect(getAudioEntry('word.monkey')).toMatchObject({
      source: 'local',
      url: '/audio/words/word.monkey.mp3',
    });
  });

  it('retains local URLs for known manifest entries', () => {
    expect(getAudioEntry('letter.a')).toMatchObject({
      source: 'local',
      url: '/audio/letters/letter_a.mp3',
    });
  });

  it('provides the conventional local fallback for an unlisted word ID', () => {
    expect(getAudioEntry('word.unlisted')).toMatchObject({
      source: 'local',
      url: '/audio/words/word.unlisted.mp3',
      fallbackText: 'unlisted',
    });
  });

  it('returns undefined for an unknown non-word ID', () => {
    expect(getAudioEntry('unknown.audio')).toBeUndefined();
  });
});

describe('parent audio runtime status', () => {
  it('describes bundled local playback rather than an unimplemented CDN fallback', () => {
    const statusText = Object.values(AUDIO_RUNTIME_STATUS).join(' ');

    expect(statusText).toContain('bundled local assets');
    expect(statusText).toContain('AI-generated');
    expect(statusText).toContain('OpenAI TTS');
    expect(statusText).not.toContain('Cloudinary CDN');
    expect(statusText).not.toContain('Oxford-First');
  });
});
