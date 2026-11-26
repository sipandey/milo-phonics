/**
 * Parent-recorded teaching progress (progress format v3).
 *
 * Stored compactly because it syncs through Clerk user metadata, which is
 * limited to about 8 KB per account.
 */

export type TeachingStatus = 'not-yet' | 'with-help' | 'secure';

/** 0 = removed (kept so the removal syncs), 1 = not yet, 2 = with help, 3 = secure. */
export type TeachingStatusCode = 0 | 1 | 2 | 3;

/**
 * [status code, last practised as days since 1970-01-01 UTC (0 = never),
 *  practice count, last updated in Unix seconds]
 */
export type TeachingItemTuple = readonly [TeachingStatusCode, number, number, number];

export interface ChildTeachingRecord {
  /** Keyed by item ID: `gpc.s`, `tricky.the`, `blend.p2.set1`, `p1.alliteration`. */
  readonly items: Readonly<Record<string, TeachingItemTuple>>;
  readonly focus: { readonly ids: readonly string[]; readonly u: number };
}

export interface TeachingProgressDoc {
  readonly v: 3;
  readonly programmeVersion: string;
  readonly children: Readonly<Record<string, ChildTeachingRecord>>;
}

export interface TeachingItemState {
  readonly id: string;
  readonly status: TeachingStatus;
  /** ISO date (YYYY-MM-DD) or null when never practised. */
  readonly lastPractised: string | null;
  readonly count: number;
}
