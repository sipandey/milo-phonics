import { afterEach, describe, expect, it, vi } from 'vitest';

const CURRENT_STORAGE_KEY = 'playful_phonics_progress_v2';
const LEGACY_STORAGE_KEY = 'playful_phonics_progress_v1';

function createMemoryStorage(entries: Record<string, string> = {}): Storage {
  const values = new Map<string, string>(Object.entries(entries));

  return {
    get length(): number {
      return values.size;
    },
    clear(): void {
      values.clear();
    },
    getItem(key: string): string | null {
      return values.get(key) ?? null;
    },
    key(index: number): string | null {
      return Array.from(values.keys())[index] ?? null;
    },
    removeItem(key: string): void {
      values.delete(key);
    },
    setItem(key: string, value: string): void {
      values.set(key, value);
    },
  };
}

async function loadProgressService(storage: Storage) {
  vi.resetModules();
  vi.stubGlobal('window', { localStorage: storage });
  vi.stubGlobal('localStorage', storage);
  const module = await import('../src/services/progressService');
  return module.progressService;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('progress persistence and progression', () => {
  it('loads a valid current payload and derives unlocked levels from stars', async () => {
    const storage = createMemoryStorage({
      [CURRENT_STORAGE_KEY]: JSON.stringify({
        currentLevelId: 2,
        letterStars: { s: 3, a: 2, t: 1 },
        unlockedLevels: [1],
      }),
    });

    const service = await loadProgressService(storage);
    const progress = service.getProgress();

    expect(progress.totalStars).toBe(6);
    expect(progress.unlockedLevels).toEqual([1, 2]);
    expect(progress.currentLevelId).toBe(2);
    expect(progress.levels[2]?.unlocked).toBe(true);
  });

  it('falls back to safe defaults when current storage contains corrupt JSON', async () => {
    const service = await loadProgressService(createMemoryStorage({
      [CURRENT_STORAGE_KEY]: '{not-json',
    }));

    const progress = service.getProgress();

    expect(progress.currentLevelId).toBe(1);
    expect(progress.unlockedLevels).toEqual([1]);
    expect(progress.totalStars).toBe(0);
    expect(progress.lastLetter).toBe('s');
  });

  it('migrates legacy exploration data into the current storage key', async () => {
    const storage = createMemoryStorage({
      [LEGACY_STORAGE_KEY]: JSON.stringify({
        exploredLetters: { s: 3 },
        exploredObjects: { sun: 2 },
        totalTaps: 5,
        lastLetter: 'a',
      }),
    });

    const service = await loadProgressService(storage);
    const progress = service.getProgress();
    const migrated = JSON.parse(storage.getItem(CURRENT_STORAGE_KEY) ?? '{}') as Record<string, unknown>;

    expect(progress.exploredLetters).toEqual({ s: 3 });
    expect(progress.exploredObjects).toEqual({ sun: 2 });
    expect(progress.totalTaps).toBe(5);
    expect(progress.lastLetter).toBe('a');
    expect(migrated.exploredLetters).toEqual({ s: 3 });
  });

  it('never downgrades an existing star rating', async () => {
    const service = await loadProgressService(createMemoryStorage());

    expect(service.awardStars('s', 3).newlyEarned).toBe(3);
    expect(service.awardStars('s', 1).newlyEarned).toBe(0);
    expect(service.getProgress().letterStars.s).toBe(3);
  });

  it('unlocks level two when the configured six-star threshold is reached', async () => {
    const service = await loadProgressService(createMemoryStorage());

    expect(service.awardStars('i', 3).newlyUnlockedLevels).toEqual([]);
    expect(service.awardStars('n', 3).newlyUnlockedLevels).toContain(2);
    expect(service.getProgress().unlockedLevels).toContain(2);
  });
});
