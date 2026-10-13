import { describe, expect, it } from 'vitest';
import { SENTRY_PARENT_PRIVACY_NOTICE } from '../src/observability/sentryNotice';

describe('Sentry parent privacy notice', () => {
  it('contains the minimum parent-facing disclosures before privacy approval', () => {
    const noticeText = SENTRY_PARENT_PRIVACY_NOTICE.paragraphs.join(' ');

    expect(SENTRY_PARENT_PRIVACY_NOTICE.status).toBe('draft');
    expect(noticeText).toContain('off by default');
    expect(noticeText).toContain('leave this device');
    expect(noticeText).toContain('30 days');
    expect(noticeText).toContain('revoke');
    expect(noticeText).toContain('privacy review');
    expect(noticeText).toContain('approximate geography');
  });
});
