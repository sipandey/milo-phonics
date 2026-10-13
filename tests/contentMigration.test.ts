import { describe, expect, it } from 'vitest';
import {
  CURRENT_CONTENT_VERSION,
  LEGACY_CONTENT_VERSION,
  migrateProgressContent,
} from '../src/services/contentMigration';

describe('content-version progress migration', () => {
  it('upgrades an unversioned snapshot while preserving stable progress', () => {
    const result = migrateProgressContent({
      letterStars: { s: 3 },
      exploredLetters: { s: 5 },
      currentLevelId: 2,
      lastLetter: 's',
    });

    expect(result.direction).toBe('upgrade');
    expect(result.fromVersion).toBe(LEGACY_CONTENT_VERSION);
    expect(result.toVersion).toBe(CURRENT_CONTENT_VERSION);
    expect(result.data.contentVersion).toBe(CURRENT_CONTENT_VERSION);
    expect(result.data.letterStars).toEqual({ s: 3 });
    expect(result.data.exploredLetters).toEqual({ s: 5 });
    expect(result.data.currentLevelId).toBe(2);
  });

  it('supports an explicit rollback mapping without dropping progress', () => {
    const result = migrateProgressContent(
      {
        contentVersion: CURRENT_CONTENT_VERSION,
        letterStars: { s: 3, a: 2 },
        exploredObjects: { sun: 4 },
        lastLetter: 'a',
      },
      LEGACY_CONTENT_VERSION,
    );

    expect(result.direction).toBe('rollback');
    expect(result.data.contentVersion).toBe(LEGACY_CONTENT_VERSION);
    expect(result.data.letterStars).toEqual({ s: 3, a: 2 });
    expect(result.data.exploredObjects).toEqual({ sun: 4 });
  });

  it('does not rewrite a snapshot already at the target content version', () => {
    const snapshot = { contentVersion: CURRENT_CONTENT_VERSION, letterStars: { s: 1 } };
    const result = migrateProgressContent(snapshot);

    expect(result.direction).toBe('none');
    expect(result.migrated).toBe(false);
    expect(result.data).toEqual(snapshot);
  });
});
