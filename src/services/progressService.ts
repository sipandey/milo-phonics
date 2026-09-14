import { ChildProgress } from '../types/phonics';

const STORAGE_KEY = 'playful_phonics_progress_v1';

const defaultProgress: ChildProgress = {
  exploredLetters: {
    m: 0,
    s: 0,
    a: 0,
  },
  exploredObjects: {},
  totalTaps: 0,
  lastPlayed: new Date().toISOString(),
  lastLetter: 'm',
};

class ProgressService {
  private progress: ChildProgress = defaultProgress;

  constructor() {
    this.loadProgress();
  }

  private loadProgress() {
    if (typeof window === 'undefined') return;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        this.progress = { ...defaultProgress, ...JSON.parse(data) };
      }
    } catch {
      this.progress = defaultProgress;
    }
  }

  private saveProgress() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
    } catch {
      // Storage quota or private mode
    }
  }

  public getProgress(): ChildProgress {
    return { ...this.progress };
  }

  public recordLetterInteraction(letterId: string) {
    const id = letterId.toLowerCase();
    this.progress.exploredLetters[id] = (this.progress.exploredLetters[id] || 0) + 1;
    this.progress.totalTaps += 1;
    this.progress.lastPlayed = new Date().toISOString();
    this.progress.lastLetter = id;
    this.saveProgress();
  }

  public recordObjectInteraction(objectId: string, letterId: string) {
    this.progress.exploredObjects[objectId] = (this.progress.exploredObjects[objectId] || 0) + 1;
    this.recordLetterInteraction(letterId);
  }

  public getMostPlayedObject(): { id: string; count: number } | null {
    const entries = Object.entries(this.progress.exploredObjects);
    if (entries.length === 0) return null;
    entries.sort((a, b) => b[1] - a[1]);
    return { id: entries[0][0], count: entries[0][1] };
  }

  public resetProgress() {
    this.progress = { ...defaultProgress, exploredLetters: { m: 0, s: 0, a: 0 } };
    this.saveProgress();
  }
}

export const progressService = new ProgressService();
