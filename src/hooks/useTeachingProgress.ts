import { useSyncExternalStore } from 'react';
import { teachingProgressStore } from '../services/teachingProgressStore';
import type { TeachingProgressDoc } from '../types/teachingProgress';

/** Current teaching progress; re-renders on local marks and on merged cloud data. */
export function useTeachingProgress(): TeachingProgressDoc {
  return useSyncExternalStore(
    (onChange) => teachingProgressStore.subscribe(() => onChange()),
    () => teachingProgressStore.get(),
  );
}
