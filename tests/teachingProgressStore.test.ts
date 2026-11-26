import { describe, expect, it, vi } from 'vitest';
import { TEACHING_PROGRESS_STORAGE_KEY, TeachingProgressStore } from '../src/services/teachingProgressStore';
import { DEFAULT_CHILD_ID, createEmptyTeachingProgress, getItemState, markItem } from '../src/services/teachingProgress';

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    values,
  };
}

const now = new Date('2026-11-26T12:00:00Z');

describe('TeachingProgressStore', () => {
  it('starts empty when nothing is stored or the stored value is corrupt', () => {
    expect(new TeachingProgressStore(memoryStorage()).get()).toEqual(createEmptyTeachingProgress());
    const corrupt = memoryStorage({ [TEACHING_PROGRESS_STORAGE_KEY]: '{not json' });
    expect(new TeachingProgressStore(corrupt).get()).toEqual(createEmptyTeachingProgress());
  });

  it('saves updates, reloads them, and notifies subscribers', () => {
    const storage = memoryStorage();
    const store = new TeachingProgressStore(storage);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.update((doc) => markItem(doc, DEFAULT_CHILD_ID, 'gpc.s', 'secure', now));
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getItemState(new TeachingProgressStore(storage).get(), DEFAULT_CHILD_ID, 'gpc.s')?.status).toBe('secure');

    unsubscribe();
    store.update((doc) => markItem(doc, DEFAULT_CHILD_ID, 'gpc.a', 'secure', now));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('tags each change as local or cloud, so screens refresh but sync does not re-upload cloud data', () => {
    const store = new TeachingProgressStore(memoryStorage());
    const listener = vi.fn();
    store.subscribe(listener);
    const cloud = markItem(createEmptyTeachingProgress(), DEFAULT_CHILD_ID, 'gpc.t', 'with-help', now);

    store.mergeFromCloud(JSON.parse(JSON.stringify(cloud)));
    expect(getItemState(store.get(), DEFAULT_CHILD_ID, 'gpc.t')?.status).toBe('with-help');
    expect(listener).toHaveBeenLastCalledWith(store.get(), 'cloud');

    store.update((doc) => markItem(doc, DEFAULT_CHILD_ID, 'gpc.s', 'secure', now));
    expect(listener).toHaveBeenLastCalledWith(store.get(), 'local');
  });

  it('keeps working when storage writes fail', () => {
    const storage = { getItem: () => null, setItem: () => { throw new Error('quota'); } };
    const store = new TeachingProgressStore(storage);
    expect(() => store.update((doc) => markItem(doc, DEFAULT_CHILD_ID, 'gpc.s', 'secure', now))).not.toThrow();
    expect(getItemState(store.get(), DEFAULT_CHILD_ID, 'gpc.s')?.status).toBe('secure');
  });
});
