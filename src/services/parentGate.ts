export interface ParentGateChallenge {
  num1: number;
  num2: number;
  options: number[];
}

export type RandomSource = () => number;

export function createParentGateChallenge(random: RandomSource = Math.random): ParentGateChallenge {
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

  return {
    num1,
    num2,
    options: Array.from(options).sort(() => random() - 0.5),
  };
}

export function isParentGateAnswer(
  challenge: Pick<ParentGateChallenge, 'num1' | 'num2'>,
  selected: number,
): boolean {
  return selected === challenge.num1 + challenge.num2;
}
