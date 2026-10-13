import { CURRICULUM_LEVELS } from '../data/curriculumContent';
import { CURRENT_CONTENT_VERSION, migrateProgressContent } from './contentMigration';
import type {
  ChildProgress,
  LevelProgress,
  PracticeAttempt,
  PracticeEvidence,
} from '../types/phonics';

const STORAGE_KEY = 'playful_phonics_progress_v2';
const LEGACY_STORAGE_KEY = 'playful_phonics_progress_v1';

function createInitialLevels(): Record<number, LevelProgress> {
  const map: Record<number, LevelProgress> = {};
  CURRICULUM_LEVELS.forEach((lvl) => {
    map[lvl.id] = {
      levelId: lvl.id,
      unlocked: lvl.id === 1,
      starsEarned: 0,
      completed: false,
    };
  });
  return map;
}

function emptyPracticeEvidence(): PracticeEvidence {
  return {
    attempts: 0,
    correctAttempts: 0,
    correctFirstAttempts: 0,
    reviewAttempts: 0,
    correctReviewAttempts: 0,
    lastPracticed: '',
  };
}

function sanitizePracticeEvidence(
  raw: Record<string, PracticeEvidence> | undefined,
): Record<string, PracticeEvidence> {
  const sanitized: Record<string, PracticeEvidence> = {};
  Object.entries(raw || {}).forEach(([letterId, evidence]) => {
    const base = emptyPracticeEvidence();
    sanitized[letterId] = {
      attempts: Math.max(0, evidence?.attempts || base.attempts),
      correctAttempts: Math.max(0, evidence?.correctAttempts || base.correctAttempts),
      correctFirstAttempts: Math.max(0, evidence?.correctFirstAttempts || base.correctFirstAttempts),
      reviewAttempts: Math.max(0, evidence?.reviewAttempts || base.reviewAttempts),
      correctReviewAttempts: Math.max(0, evidence?.correctReviewAttempts || base.correctReviewAttempts),
      lastPracticed: evidence?.lastPracticed || base.lastPracticed,
    };
  });
  return sanitized;
}

function mergePracticeEvidence(
  local: Record<string, PracticeEvidence>,
  incoming: Record<string, PracticeEvidence> | undefined,
): Record<string, PracticeEvidence> {
  const merged = sanitizePracticeEvidence(local);
  Object.entries(sanitizePracticeEvidence(incoming)).forEach(([letterId, evidence]) => {
    const current = merged[letterId] || emptyPracticeEvidence();
    merged[letterId] = {
      attempts: Math.max(current.attempts, evidence.attempts),
      correctAttempts: Math.max(current.correctAttempts, evidence.correctAttempts),
      correctFirstAttempts: Math.max(current.correctFirstAttempts, evidence.correctFirstAttempts),
      reviewAttempts: Math.max(current.reviewAttempts, evidence.reviewAttempts),
      correctReviewAttempts: Math.max(current.correctReviewAttempts, evidence.correctReviewAttempts),
      lastPracticed: current.lastPracticed > evidence.lastPracticed ? current.lastPracticed : evidence.lastPracticed,
    };
  });
  return merged;
}

function practiceStarsForEvidence(evidence: PracticeEvidence): number {
  if (evidence.correctReviewAttempts > 0 && evidence.correctFirstAttempts > 0) return 3;
  if (evidence.correctFirstAttempts > 0) return 2;
  if (evidence.correctAttempts > 0) return 1;
  return 0;
}

const defaultProgress: ChildProgress = {
  contentVersion: CURRENT_CONTENT_VERSION,
  currentLevelId: 1,
  unlockedLevels: [1],
  letterStars: {},
  levels: createInitialLevels(),
  totalStars: 0,
  exploredLetters: {},
  exploredObjects: {},
  practiceEvidence: {},
  totalTaps: 0,
  lastPlayed: new Date().toISOString(),
  lastLetter: 's',
  lastObjectIndex: 0,
  toddlerFocusMode: true,
};

type ProgressListener = (progress: ChildProgress) => void;

class ProgressService {
  private progress: ChildProgress = defaultProgress;
  private listeners: Set<ProgressListener> = new Set();

  constructor() {
    this.loadProgress();
  }

  public subscribe(listener: ProgressListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn({ ...this.progress }));
  }

  private loadProgress() {
    if (typeof window === 'undefined') return;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as Partial<ChildProgress>;
        const migration = migrateProgressContent(parsed);
        this.progress = this.sanitizeProgress(migration.data);
        if (migration.migrated) this.saveProgress();
        return;
      }

      // Check legacy key for migration
      const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyData) {
        const legacyParsed = JSON.parse(legacyData) as Partial<ChildProgress>;
        this.progress = this.sanitizeProgress({
          ...defaultProgress,
          exploredLetters: legacyParsed.exploredLetters || {},
          exploredObjects: legacyParsed.exploredObjects || {},
          practiceEvidence: legacyParsed.practiceEvidence || {},
          totalTaps: legacyParsed.totalTaps || 0,
          lastPlayed: legacyParsed.lastPlayed || new Date().toISOString(),
          lastLetter: legacyParsed.lastLetter || 's',
        });
        this.saveProgress();
      }
    } catch {
      this.progress = { ...defaultProgress };
    }
  }

  private sanitizeProgress(raw: Partial<ChildProgress>): ChildProgress {
    const initialLevels = createInitialLevels();
    const rawLevels = raw.levels || {};
    const levels = { ...initialLevels };
    const validLevelIds = new Set(CURRICULUM_LEVELS.map((level) => level.id));

    CURRICULUM_LEVELS.forEach((level) => {
      const candidate = rawLevels[level.id];
      if (!candidate) return;
      levels[level.id] = {
        levelId: level.id,
        unlocked: candidate.unlocked === true,
        starsEarned: Math.min(3 * level.letterIds.length, Math.max(0, candidate.starsEarned || 0)),
        completed: candidate.completed === true,
      };
    });

    const letterStars = raw.letterStars || {};
    let totalStars = 0;
    Object.values(letterStars).forEach((stars) => {
      totalStars += Math.min(3, Math.max(0, stars));
    });

    // Determine unlocked levels based on total stars
    const unlockedLevels = new Set<number>(
      (raw.unlockedLevels || [1]).filter((levelId) => validLevelIds.has(levelId)),
    );
    unlockedLevels.add(1);

    CURRICULUM_LEVELS.forEach((lvl) => {
      if (totalStars >= lvl.requiredStarsToUnlock) {
        unlockedLevels.add(lvl.id);
        levels[lvl.id].unlocked = true;
      }
    });

    return {
      contentVersion: raw.contentVersion || CURRENT_CONTENT_VERSION,
      currentLevelId: raw.currentLevelId && unlockedLevels.has(raw.currentLevelId) ? raw.currentLevelId : 1,
      unlockedLevels: Array.from(unlockedLevels).sort((a, b) => a - b),
      letterStars,
      levels,
      totalStars,
      exploredLetters: raw.exploredLetters || {},
      exploredObjects: raw.exploredObjects || {},
      practiceEvidence: sanitizePracticeEvidence(raw.practiceEvidence),
      totalTaps: raw.totalTaps || 0,
      lastPlayed: raw.lastPlayed || new Date().toISOString(),
      lastLetter: raw.lastLetter || 's',
      lastObjectIndex: typeof raw.lastObjectIndex === 'number' ? Math.max(0, raw.lastObjectIndex) : 0,
      cloudSyncedAt: raw.cloudSyncedAt,
      toddlerFocusMode: raw.toddlerFocusMode !== undefined ? raw.toddlerFocusMode : true,
    };
  }

  private saveProgress() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
    } catch {
      // Storage quota or private mode
    }
    this.notify();
  }

  public getProgress(): ChildProgress {
    return { ...this.progress };
  }

  public setToddlerFocusMode(enabled: boolean) {
    this.progress.toddlerFocusMode = enabled;
    this.saveProgress();
  }

  public setLastPosition(letterId: string, objectIndex: number) {
    this.progress.lastLetter = letterId;
    this.progress.lastObjectIndex = Math.max(0, objectIndex);
    this.saveProgress();
  }

  public unlockLevel(levelId: number) {
    if (!this.progress.unlockedLevels.includes(levelId)) {
      this.progress.unlockedLevels.push(levelId);
      this.progress.unlockedLevels.sort((a, b) => a - b);
    }
    if (this.progress.levels[levelId]) {
      this.progress.levels[levelId].unlocked = true;
    }
    this.saveProgress();
  }

  public setCurrentLevel(levelId: number) {
    if (!this.progress.unlockedLevels.includes(levelId)) {
      this.unlockLevel(levelId);
    }
    this.progress.currentLevelId = levelId;
    const targetLvl = CURRICULUM_LEVELS.find((lvl) => lvl.id === levelId);
    if (targetLvl && targetLvl.letterIds.length > 0) {
      this.progress.lastLetter = targetLvl.letterIds[0];
      this.progress.lastObjectIndex = 0;
    }
    this.saveProgress();
  }

  public awardStars(letterId: string, starsEarned: number): { newlyEarned: number; newlyUnlockedLevels: number[] } {
    const id = letterId.toLowerCase();
    const currentStars = this.progress.letterStars[id] || 0;
    const newStars = Math.min(3, Math.max(currentStars, starsEarned));
    const newlyEarned = newStars - currentStars;

    if (newlyEarned > 0) {
      this.progress.letterStars[id] = newStars;
      this.recalculateTotals();
    }

    const newlyUnlockedLevels = this.checkLevelUnlocks();
    this.saveProgress();

    return { newlyEarned, newlyUnlockedLevels };
  }

  public recordLetterInteraction(letterId: string): { newlyEarned: number; newlyUnlockedLevels: number[] } {
    const id = letterId.toLowerCase();
    this.progress.exploredLetters[id] = (this.progress.exploredLetters[id] || 0) + 1;
    this.progress.totalTaps += 1;
    this.progress.lastPlayed = new Date().toISOString();
    this.progress.lastLetter = id;

    this.saveProgress();
    return { newlyEarned: 0, newlyUnlockedLevels: [] };
  }

  public recordObjectInteraction(objectId: string, letterId: string): { newlyEarned: number; newlyUnlockedLevels: number[] } {
    this.progress.exploredObjects[objectId] = (this.progress.exploredObjects[objectId] || 0) + 1;
    return this.recordLetterInteraction(letterId);
  }

  public recordPracticeAttempt(
    letterId: string,
    attempt: PracticeAttempt,
  ): { newlyEarned: number; newlyUnlockedLevels: number[] } {
    const id = letterId.toLowerCase();
    const current = this.progress.practiceEvidence[id] || emptyPracticeEvidence();
    const now = new Date().toISOString();
    const updated: PracticeEvidence = {
      attempts: current.attempts + 1,
      correctAttempts: current.correctAttempts + (attempt.correct ? 1 : 0),
      correctFirstAttempts: current.correctFirstAttempts + (attempt.correct && attempt.firstAttempt ? 1 : 0),
      reviewAttempts: current.reviewAttempts + (attempt.isReview ? 1 : 0),
      correctReviewAttempts: current.correctReviewAttempts + (attempt.correct && attempt.isReview ? 1 : 0),
      lastPracticed: now,
    };
    this.progress.practiceEvidence[id] = updated;
    this.progress.lastPlayed = now;
    this.progress.lastLetter = id;

    return this.awardStars(id, practiceStarsForEvidence(updated));
  }

  private recalculateTotals() {
    let total = 0;
    Object.values(this.progress.letterStars).forEach((stars) => {
      total += stars;
    });
    this.progress.totalStars = total;

    // Update level specific star totals
    CURRICULUM_LEVELS.forEach((lvl) => {
      let lvlStars = 0;
      lvl.letterIds.forEach((l) => {
        lvlStars += this.progress.letterStars[l] || 0;
      });
      if (this.progress.levels[lvl.id]) {
        this.progress.levels[lvl.id].starsEarned = lvlStars;
        this.progress.levels[lvl.id].completed = lvlStars >= lvl.letterIds.length * 2; // e.g. 2 stars per letter = completed
      }
    });
  }

  public checkLevelUnlocks(): number[] {
    const newlyUnlocked: number[] = [];
    CURRICULUM_LEVELS.forEach((lvl) => {
      if (
        this.progress.totalStars >= lvl.requiredStarsToUnlock &&
        !this.progress.unlockedLevels.includes(lvl.id)
      ) {
        this.progress.unlockedLevels.push(lvl.id);
        if (this.progress.levels[lvl.id]) {
          this.progress.levels[lvl.id].unlocked = true;
        }
        newlyUnlocked.push(lvl.id);
      }
    });

    this.progress.unlockedLevels.sort((a, b) => a - b);
    return newlyUnlocked;
  }

  public getMostPlayedObject(): { id: string; count: number } | null {
    const entries = Object.entries(this.progress.exploredObjects);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    return { id: entries[0][0], count: entries[0][1] };
  }

  /**
   * Two-way merge with Clerk user metadata
   */
  public syncWithClerk(cloudData?: Partial<ChildProgress>): ChildProgress {
    if (!cloudData) return this.getProgress();
    const incomingCloudData = migrateProgressContent(cloudData).data;

    // Merge letter stars (take highest star rating for each letter)
    const mergedLetterStars = { ...this.progress.letterStars };
    if (incomingCloudData.letterStars) {
      Object.entries(incomingCloudData.letterStars).forEach(([l, s]) => {
        mergedLetterStars[l] = Math.max(mergedLetterStars[l] || 0, s);
      });
    }

    // Merge explored letters & objects (take highest tap count)
    const mergedExploredLetters = { ...this.progress.exploredLetters };
    if (incomingCloudData.exploredLetters) {
      Object.entries(incomingCloudData.exploredLetters).forEach(([l, c]) => {
        mergedExploredLetters[l] = Math.max(mergedExploredLetters[l] || 0, c);
      });
    }

    const mergedExploredObjects = { ...this.progress.exploredObjects };
    if (incomingCloudData.exploredObjects) {
      Object.entries(incomingCloudData.exploredObjects).forEach(([o, c]) => {
        mergedExploredObjects[o] = Math.max(mergedExploredObjects[o] || 0, c);
      });
    }

    const mergedPracticeEvidence = mergePracticeEvidence(
      this.progress.practiceEvidence,
      incomingCloudData.practiceEvidence,
    );

    const mergedTaps = Math.max(this.progress.totalTaps, incomingCloudData.totalTaps || 0);
    const mergedUnlockedLevels = Array.from(
      new Set([...this.progress.unlockedLevels, ...(incomingCloudData.unlockedLevels || [1])])
    ).sort((a, b) => a - b);

    this.progress = this.sanitizeProgress({
      currentLevelId: Math.max(this.progress.currentLevelId, incomingCloudData.currentLevelId || 1),
      unlockedLevels: mergedUnlockedLevels,
      letterStars: mergedLetterStars,
      exploredLetters: mergedExploredLetters,
      exploredObjects: mergedExploredObjects,
      practiceEvidence: mergedPracticeEvidence,
      totalTaps: mergedTaps,
      lastPlayed: new Date().toISOString(),
      lastLetter: this.progress.lastLetter || incomingCloudData.lastLetter || 's',
      cloudSyncedAt: new Date().toISOString(),
    });

    this.saveProgress();
    return this.getProgress();
  }

  public exportForClerk(): Partial<ChildProgress> {
    return {
      contentVersion: this.progress.contentVersion,
      currentLevelId: this.progress.currentLevelId,
      unlockedLevels: this.progress.unlockedLevels,
      letterStars: this.progress.letterStars,
      totalStars: this.progress.totalStars,
      exploredLetters: this.progress.exploredLetters,
      exploredObjects: this.progress.exploredObjects,
      practiceEvidence: this.progress.practiceEvidence,
      totalTaps: this.progress.totalTaps,
      lastPlayed: this.progress.lastPlayed,
      lastLetter: this.progress.lastLetter,
      cloudSyncedAt: new Date().toISOString(),
    };
  }

  public resetProgress() {
    this.progress = {
      ...defaultProgress,
      levels: createInitialLevels(),
      unlockedLevels: [1],
      letterStars: {},
      exploredLetters: {},
      exploredObjects: {},
      practiceEvidence: {},
      totalStars: 0,
      totalTaps: 0,
      currentLevelId: 1,
      lastPlayed: new Date().toISOString(),
      lastLetter: 's',
    };
    this.saveProgress();
  }
}

export const progressService = new ProgressService();
