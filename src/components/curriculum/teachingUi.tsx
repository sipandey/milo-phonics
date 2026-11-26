import React from 'react';
import { audioService } from '../../services/audioService';
import { teachingProgressStore } from '../../services/teachingProgressStore';
import { DEFAULT_CHILD_ID, markItem } from '../../services/teachingProgress';
import type { TeachingStatus } from '../../types/teachingProgress';

export const STATUS_LABELS: Record<TeachingStatus, string> = {
  'not-yet': 'Not yet',
  'with-help': 'With help',
  secure: 'Secure',
};

/** Tile colours: not introduced, then each status. */
export const STATUS_STYLES: Record<TeachingStatus | 'none', string> = {
  none: 'bg-white border-dashed border-gray-300 text-gray-400',
  'not-yet': 'bg-sky-50 border-sky-300 text-sky-900',
  'with-help': 'bg-amber-50 border-amber-400 text-amber-900',
  secure: 'bg-emerald-50 border-emerald-400 text-emerald-900',
};

export function recordMark(itemId: string, status: TeachingStatus): void {
  teachingProgressStore.update((doc) => markItem(doc, DEFAULT_CHILD_ID, itemId, status, new Date()));
}

interface StatusButtonsProps {
  readonly itemLabel: string;
  readonly current: TeachingStatus | null;
  readonly onMark: (status: TeachingStatus) => void;
  readonly compact?: boolean;
}

/** One tap records the adult's judgement after practising an item. */
export const StatusButtons: React.FC<StatusButtonsProps> = ({ itemLabel, current, onMark, compact = false }) => (
  <div className="flex gap-2" role="group" aria-label={`How did ${itemLabel} go?`}>
    {(Object.keys(STATUS_LABELS) as TeachingStatus[]).map((status) => (
      <button
        key={status}
        type="button"
        aria-pressed={current === status}
        onClick={() => {
          audioService.playPop();
          onMark(status);
        }}
        className={`rounded-2xl border-2 font-bold cursor-pointer transition-transform active:scale-95 ${
          compact ? 'px-3 py-2 text-xs min-h-[44px]' : 'px-4 py-3 text-sm min-h-[56px] flex-1'
        } ${current === status ? STATUS_STYLES[status] : 'bg-white border-gray-200 text-gray-600'}`}
      >
        {STATUS_LABELS[status]}
      </button>
    ))}
  </div>
);

/** Play sound-library symbols in order; stops early when `isCurrent` turns false. */
export async function playSymbols(symbols: readonly string[], isCurrent: () => boolean): Promise<void> {
  for (const symbol of symbols) {
    if (!isCurrent()) return;
    await audioService.playOxfordSound(symbol, 'isolation', { interrupt: true });
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
}
