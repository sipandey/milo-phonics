import { describe, expect, it } from 'vitest';
import {
  findClaimViolations,
  findClaimViolationsInText,
} from '../scripts/claims';

describe('claims release guard', () => {
  it('flags a paused claim in a user-facing text surface', () => {
    const violations = findClaimViolationsInText(
      '<p>Pure British Received Pronunciation phonics</p>',
      'fixture.html',
    );

    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatchObject({ ruleId: 'accent-or-pronunciation' });
  });

  it('allows the audit-approved modest product description', () => {
    const violations = findClaimViolationsInText(
      'An interactive, audio-led app with a fixed sequence of introductory letter–sound activities and simple word-blending practice.',
      'fixture.html',
    );

    expect(violations).toEqual([]);
  });

  it('passes the checked-in user-facing surfaces after claim remediation', () => {
    const violations = findClaimViolations();

    expect(violations).toEqual([]);
  });
});
