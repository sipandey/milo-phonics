import { CURRICULUM_CONTENT_VERSION } from '../data/curriculumContent';
import type { ChildProgress } from '../types/phonics';

export const CURRENT_CONTENT_VERSION = CURRICULUM_CONTENT_VERSION;
export const LEGACY_CONTENT_VERSION = 'legacy-unversioned';

export type ContentMigrationDirection = 'none' | 'upgrade' | 'rollback';

export interface ContentMigrationResult {
  readonly data: Partial<ChildProgress>;
  readonly fromVersion: string;
  readonly toVersion: string;
  readonly direction: ContentMigrationDirection;
  readonly migrated: boolean;
}

function versionRank(version: string): number {
  return version === LEGACY_CONTENT_VERSION ? 0 : version === CURRENT_CONTENT_VERSION ? 1 : 0;
}

/**
 * Maps stable progress fields between content releases. Unknown fields are
 * intentionally not copied so a newer snapshot cannot leak unsupported data
 * into an older content release during rollback.
 */
function mapStableProgressFields(raw: Partial<ChildProgress>, targetVersion: string): Partial<ChildProgress> {
  return {
    contentVersion: targetVersion,
    currentLevelId: raw.currentLevelId,
    unlockedLevels: raw.unlockedLevels,
    letterStars: raw.letterStars,
    levels: raw.levels,
    totalStars: raw.totalStars,
    exploredLetters: raw.exploredLetters,
    exploredObjects: raw.exploredObjects,
    totalTaps: raw.totalTaps,
    lastPlayed: raw.lastPlayed,
    lastLetter: raw.lastLetter,
    lastObjectIndex: raw.lastObjectIndex,
    cloudSyncedAt: raw.cloudSyncedAt,
    toddlerFocusMode: raw.toddlerFocusMode,
  };
}

export function migrateProgressContent(
  raw: Partial<ChildProgress>,
  targetVersion: string = CURRENT_CONTENT_VERSION,
): ContentMigrationResult {
  const fromVersion = raw.contentVersion?.trim() || LEGACY_CONTENT_VERSION;
  const migrated = fromVersion !== targetVersion;
  const direction: ContentMigrationDirection = migrated
    ? versionRank(targetVersion) >= versionRank(fromVersion) ? 'upgrade' : 'rollback'
    : 'none';

  return {
    data: migrated ? mapStableProgressFields(raw, targetVersion) : raw,
    fromVersion,
    toVersion: targetVersion,
    direction,
    migrated,
  };
}
