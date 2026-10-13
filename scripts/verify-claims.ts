import { findClaimViolations } from './claims.ts';

const violations = findClaimViolations();

if (violations.length > 0) {
  console.error('Paused claims found in user-facing surfaces:');
  for (const violation of violations) {
    console.error(
      `- ${violation.filePath}:${violation.line} [${violation.ruleId}] ${violation.matchedText}`,
    );
  }
  process.exitCode = 1;
} else {
  console.log('Claims release guard passed: no paused claims found in checked surfaces.');
}
