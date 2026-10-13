export interface ParentGateChallenge {
  num1: number;
  num2: number;
  options: number[];
}

export type RandomSource = () => number;

export interface ParentGateAttemptPolicy {
  readonly maxAttempts: number;
  readonly windowMs: number;
  readonly lockoutMs: number;
}

export interface ParentGateAttemptStatus {
  readonly allowed: boolean;
  readonly lockedUntil: number | null;
  readonly remainingAttempts: number;
}

export interface ParentGateAttemptTracker {
  getStatus: (now?: number) => ParentGateAttemptStatus;
  recordFailure: (now?: number) => ParentGateAttemptStatus;
  recordSuccess: () => void;
}

export const DEFAULT_PARENT_GATE_ATTEMPT_POLICY: ParentGateAttemptPolicy = {
  maxAttempts: 5,
  windowMs: 60_000,
  lockoutMs: 30_000,
};

export function createParentGateRandomSource(): RandomSource {
  const cryptoSource = typeof globalThis.crypto === 'undefined' ? undefined : globalThis.crypto;

  if (cryptoSource) {
    const randomValues = new Uint32Array(1);
    return () => {
      cryptoSource.getRandomValues(randomValues);
      return randomValues[0] / 0x1_0000_0000;
    };
  }

  return Math.random;
}

export function createParentGateChallenge(random: RandomSource = createParentGateRandomSource()): ParentGateChallenge {
  const num1 = Math.floor(random() * 5) + 3;
  const num2 = Math.floor(random() * 5) + 2;
  const answer = num1 + num2;
  const options = new Set<number>([answer]);

  while (options.size < 4) {
    const direction = random() > 0.5 ? 1 : -1;
    const distance = Math.floor(random() * 3) + 1;
    const decoy = answer + direction * distance;
    if (decoy > 0) {
      options.add(decoy);
    }
  }

  const optionList = Array.from(options);
  for (let index = optionList.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [optionList[index], optionList[swapIndex]] = [optionList[swapIndex], optionList[index]];
  }

  return {
    num1,
    num2,
    options: optionList,
  };
}

export function createParentGateAttemptTracker(
  policy: ParentGateAttemptPolicy = DEFAULT_PARENT_GATE_ATTEMPT_POLICY,
): ParentGateAttemptTracker {
  const failureTimestamps: number[] = [];
  let lockedUntil: number | null = null;

  const getStatus = (now = Date.now()): ParentGateAttemptStatus => {
    if (lockedUntil !== null) {
      if (now < lockedUntil) {
        return { allowed: false, lockedUntil, remainingAttempts: 0 };
      }

      lockedUntil = null;
      failureTimestamps.length = 0;
    }

    const cutoff = now - policy.windowMs;
    while (failureTimestamps.length > 0 && failureTimestamps[0] <= cutoff) {
      failureTimestamps.shift();
    }

    return {
      allowed: true,
      lockedUntil: null,
      remainingAttempts: Math.max(0, policy.maxAttempts - failureTimestamps.length),
    };
  };

  const recordFailure = (now = Date.now()): ParentGateAttemptStatus => {
    const currentStatus = getStatus(now);
    if (!currentStatus.allowed) {
      return currentStatus;
    }

    failureTimestamps.push(now);
    if (failureTimestamps.length >= policy.maxAttempts) {
      lockedUntil = now + policy.lockoutMs;
      failureTimestamps.length = 0;
      return { allowed: false, lockedUntil, remainingAttempts: 0 };
    }

    return getStatus(now);
  };

  const recordSuccess = (): void => {
    failureTimestamps.length = 0;
    lockedUntil = null;
  };

  return { getStatus, recordFailure, recordSuccess };
}

export function isParentGateAnswer(
  challenge: Pick<ParentGateChallenge, 'num1' | 'num2'>,
  selected: number,
): boolean {
  return selected === challenge.num1 + challenge.num2;
}
