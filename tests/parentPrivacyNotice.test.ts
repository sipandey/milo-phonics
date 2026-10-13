import { describe, expect, it } from 'vitest';
import { PARENT_PRIVACY_NOTICE } from '../src/observability/parentPrivacyNotice';

describe('parent privacy notice draft', () => {
  it('covers the runtime data surfaces required by E1.2 without making approval claims', () => {
    const noticeText = PARENT_PRIVACY_NOTICE.sections
      .flatMap((section) => [section.heading, ...section.paragraphs])
      .join(' ');

    expect(PARENT_PRIVACY_NOTICE.status).toBe('draft');
    expect(noticeText).toContain('LocalStorage');
    expect(noticeText).toContain('playful_phonics_progress_v2');
    expect(noticeText).toContain('Clerk');
    expect(noticeText).toContain('Google Fonts');
    expect(noticeText).toContain('Cloudinary');
    expect(noticeText).toContain('OpenAI');
    expect(noticeText).toContain('Sentry');
    expect(noticeText).toContain('30 days');
    expect(noticeText).toContain('delete');
    expect(noticeText).toContain('international');
    expect(noticeText).toContain('contact');
    expect(noticeText).not.toContain('COPPA compliant');
    expect(noticeText).not.toContain('zero child data');
  });
});
