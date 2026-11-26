import type { TeachingProgressDoc } from '../types/teachingProgress';
import { mergeTeachingProgress, sanitizeTeachingProgress } from './teachingProgress';

export const TEACHING_PROGRESS_STORAGE_KEY = 'milo_teaching_progress_v3';

interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export type TeachingProgressChangeSource = 'local' | 'cloud';

type Listener = (doc: TeachingProgressDoc, source: TeachingProgressChangeSource) => void;

/** Keeps teaching progress on this device and tells subscribers about every change and its source. */
export class TeachingProgressStore {
  private doc: TeachingProgressDoc;
  private readonly listeners = new Set<Listener>();

  constructor(private readonly storage: KeyValueStorage | null) {
    this.doc = sanitizeTeachingProgress(this.read());
  }

  private read(): unknown {
    try {
      const raw = this.storage?.getItem(TEACHING_PROGRESS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : undefined;
    } catch {
      return undefined;
    }
  }

  private write(): void {
    try {
      this.storage?.setItem(TEACHING_PROGRESS_STORAGE_KEY, JSON.stringify(this.doc));
    } catch {
      // Storage full or unavailable: keep the in-memory copy.
    }
  }

  public get(): TeachingProgressDoc {
    return this.doc;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(source: TeachingProgressChangeSource): void {
    this.listeners.forEach((listener) => listener(this.doc, source));
  }

  /** Apply a local change (a parent mark), save it, and notify subscribers. */
  public update(change: (doc: TeachingProgressDoc) => TeachingProgressDoc): void {
    this.doc = change(this.doc);
    this.write();
    this.notify('local');
  }

  /** Merge data from Clerk and save it. Sync listeners should ignore `cloud` changes to avoid re-uploading. */
  public mergeFromCloud(raw: unknown): void {
    this.doc = mergeTeachingProgress(this.doc, sanitizeTeachingProgress(raw));
    this.write();
    this.notify('cloud');
  }
}

export const teachingProgressStore = new TeachingProgressStore(
  typeof window !== 'undefined' ? window.localStorage : null,
);
