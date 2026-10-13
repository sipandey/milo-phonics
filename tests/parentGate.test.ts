import { describe, expect, it } from 'vitest';
import { createParentGateChallenge, isParentGateAnswer } from '../src/services/parentGate';

describe('parent gate rules', () => {
  it('generates two operands and four unique positive options containing the answer', () => {
    const challenge = createParentGateChallenge();
    const answer = challenge.num1 + challenge.num2;

    expect(challenge.num1).toBeGreaterThanOrEqual(3);
    expect(challenge.num1).toBeLessThanOrEqual(7);
    expect(challenge.num2).toBeGreaterThanOrEqual(2);
    expect(challenge.num2).toBeLessThanOrEqual(6);
    expect(challenge.options).toHaveLength(4);
    expect(new Set(challenge.options).size).toBe(4);
    expect(challenge.options).toContain(answer);
    expect(challenge.options.every((option) => option > 0)).toBe(true);
  });

  it('accepts the correct answer and rejects an incorrect option', () => {
    const challenge = { num1: 3, num2: 4, options: [5, 7, 8, 9] };

    expect(isParentGateAnswer(challenge, 7)).toBe(true);
    expect(isParentGateAnswer(challenge, 8)).toBe(false);
  });
});
