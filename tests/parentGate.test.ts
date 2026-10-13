import { describe, expect, it } from 'vitest';
import {
  createParentGateAttemptTracker,
  createParentGateChallenge,
  isParentGateAnswer,
} from '../src/services/parentGate';

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

  it('rate-limits repeated wrong answers and unlocks after the cooldown', () => {
    const tracker = createParentGateAttemptTracker({
      maxAttempts: 2,
      windowMs: 1_000,
      lockoutMs: 5_000,
    });

    expect(tracker.getStatus(100)).toMatchObject({ allowed: true, remainingAttempts: 2 });
    expect(tracker.recordFailure(100)).toMatchObject({ allowed: true, remainingAttempts: 1 });
    expect(tracker.recordFailure(200)).toMatchObject({
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: 5_200,
    });
    expect(tracker.getStatus(5_199).allowed).toBe(false);
    expect(tracker.getStatus(5_201)).toMatchObject({ allowed: true, remainingAttempts: 2 });
  });

  it('clears failures after a correct answer', () => {
    const tracker = createParentGateAttemptTracker({
      maxAttempts: 2,
      windowMs: 1_000,
      lockoutMs: 5_000,
    });

    tracker.recordFailure(100);
    tracker.recordSuccess();

    expect(tracker.getStatus(200)).toMatchObject({ allowed: true, remainingAttempts: 2 });
  });
});
