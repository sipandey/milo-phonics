import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface ClaimRule {
  readonly ruleId: string;
  readonly label: string;
  readonly pattern: RegExp;
}

export interface ClaimViolation {
  readonly filePath: string;
  readonly line: number;
  readonly ruleId: string;
  readonly label: string;
  readonly matchedText: string;
}

export const USER_FACING_CLAIM_PATHS: readonly string[] = [
  'README.md',
  'index.html',
  'src/components/home/HomeScreen.tsx',
  'src/components/parent/ParentDashboard.tsx',
  'src/components/sounds/OxfordSoundsScreen.tsx',
];

export const PAUSED_CLAIM_RULES: readonly ClaimRule[] = [
  {
    ruleId: 'oxford-brand-or-source',
    label: 'Oxford brand, dictionary, or source claim',
    pattern: /Oxford (?:Advanced Learner|Dictionary|authentic)/i,
  },
  {
    ruleId: 'accent-or-pronunciation',
    label: 'Unreviewed British/RP/accent claim',
    pattern: /Pure British|Received Pronunciation|British RP/i,
  },
  {
    ruleId: 'curriculum-accreditation',
    label: 'Unreviewed curriculum accreditation claim',
    pattern: /Systematic Synthetic Phonics|Letters and Sounds|UK National Curriculum/i,
  },
  {
    ruleId: 'privacy-or-compliance-certification',
    label: 'Unsupported privacy or compliance certification',
    pattern: /COPPA compliant|zero child data|100% client-side privacy/i,
  },
  {
    ruleId: 'age-or-outcome-claim',
    label: 'Unreviewed age, mastery, or learning-outcome claim',
    pattern: /Ages? 2[–-]3|toddler-tested|learn to read|Curriculum Mastery/i,
  },
];

export function findClaimViolationsInText(
  text: string,
  filePath: string,
): ClaimViolation[] {
  return text.split(/\r?\n/).flatMap((lineText, index) => (
    PAUSED_CLAIM_RULES.flatMap((rule) => {
      const match = lineText.match(rule.pattern);
      if (!match || match.index === undefined) return [];
      return [{
        filePath,
        line: index + 1,
        ruleId: rule.ruleId,
        label: rule.label,
        matchedText: match[0],
      }];
    })
  ));
}

export function findClaimViolations(
  rootDirectory: string = process.cwd(),
  paths: readonly string[] = USER_FACING_CLAIM_PATHS,
): ClaimViolation[] {
  return paths.flatMap((relativePath) => {
    const filePath = resolve(rootDirectory, relativePath);
    return findClaimViolationsInText(readFileSync(filePath, 'utf8'), relativePath);
  });
}
