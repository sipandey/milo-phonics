import { LETTERS_AND_SOUNDS_VERSION } from '../data/lettersAndSounds';
import type { LettersAndSoundsProgramme } from '../types/lettersAndSounds';
import type {
  ChildTeachingRecord,
  TeachingItemState,
  TeachingItemTuple,
  TeachingProgressDoc,
  TeachingStatus,
  TeachingStatusCode,
} from '../types/teachingProgress';

/** Pure functions for parent-recorded teaching progress. Every update returns a new document. */

export const DEFAULT_CHILD_ID = 'child-1';

const MS_PER_DAY = 86_400_000;
const STATUS_CODES: Record<TeachingStatus, TeachingStatusCode> = { 'not-yet': 1, 'with-help': 2, secure: 3 };
const STATUS_BY_CODE: Record<number, TeachingStatus> = { 1: 'not-yet', 2: 'with-help', 3: 'secure' };

const toDayNumber = (date: Date) => Math.floor(date.getTime() / MS_PER_DAY);
const toUnixSeconds = (date: Date) => Math.floor(date.getTime() / 1000);
const fromDayNumber = (dayNumber: number) => new Date(dayNumber * MS_PER_DAY).toISOString().slice(0, 10);

const emptyChild = (): ChildTeachingRecord => ({ items: {}, focus: { ids: [], u: 0 } });

export function createEmptyTeachingProgress(): TeachingProgressDoc {
  return { v: 3, programmeVersion: LETTERS_AND_SOUNDS_VERSION, children: { [DEFAULT_CHILD_ID]: emptyChild() } };
}

function updateChild(
  doc: TeachingProgressDoc,
  childId: string,
  update: (record: ChildTeachingRecord) => ChildTeachingRecord,
): TeachingProgressDoc {
  const current = doc.children[childId] ?? emptyChild();
  return { ...doc, children: { ...doc.children, [childId]: update(current) } };
}

function setItem(doc: TeachingProgressDoc, childId: string, itemId: string, tuple: TeachingItemTuple) {
  return updateChild(doc, childId, (record) => ({ ...record, items: { ...record.items, [itemId]: tuple } }));
}

/** Mark an item as introduced ("he knows this sound") without recording practice. */
export function introduceItem(doc: TeachingProgressDoc, childId: string, itemId: string, now: Date): TeachingProgressDoc {
  const existing = doc.children[childId]?.items[itemId];
  if (existing && existing[0] !== 0) return doc;
  return setItem(doc, childId, itemId, [1, existing?.[1] ?? 0, existing?.[2] ?? 0, toUnixSeconds(now)]);
}

/** Record the parent's judgement after practising an item. */
export function markItem(
  doc: TeachingProgressDoc,
  childId: string,
  itemId: string,
  status: TeachingStatus,
  now: Date,
): TeachingProgressDoc {
  const count = doc.children[childId]?.items[itemId]?.[2] ?? 0;
  return setItem(doc, childId, itemId, [STATUS_CODES[status], toDayNumber(now), count + 1, toUnixSeconds(now)]);
}

/** Un-introduce an item. History is kept and the removal wins over older changes when syncing. */
export function removeItem(doc: TeachingProgressDoc, childId: string, itemId: string, now: Date): TeachingProgressDoc {
  const existing = doc.children[childId]?.items[itemId];
  if (!existing) return doc;
  return setItem(doc, childId, itemId, [0, existing[1], existing[2], toUnixSeconds(now)]);
}

export function setFocus(doc: TeachingProgressDoc, childId: string, ids: readonly string[], now: Date): TeachingProgressDoc {
  return updateChild(doc, childId, (record) => ({ ...record, focus: { ids: [...new Set(ids)], u: toUnixSeconds(now) } }));
}

export function getItemState(doc: TeachingProgressDoc, childId: string, itemId: string): TeachingItemState | null {
  const tuple = doc.children[childId]?.items[itemId];
  if (!tuple || tuple[0] === 0) return null;
  return {
    id: itemId,
    status: STATUS_BY_CODE[tuple[0]] ?? 'not-yet',
    lastPractised: tuple[1] > 0 ? fromDayNumber(tuple[1]) : null,
    count: tuple[2],
  };
}

/** Per item and for focus, the change with the later update time wins; ties keep `local`. */
export function mergeTeachingProgress(local: TeachingProgressDoc, incoming: TeachingProgressDoc): TeachingProgressDoc {
  const children: Record<string, ChildTeachingRecord> = { ...incoming.children, ...local.children };
  for (const [childId, theirs] of Object.entries(incoming.children)) {
    const ours = local.children[childId];
    if (!ours) continue;
    const items: Record<string, TeachingItemTuple> = { ...theirs.items, ...ours.items };
    for (const [itemId, tuple] of Object.entries(theirs.items)) {
      const mine = ours.items[itemId];
      if (mine && tuple[3] > mine[3]) items[itemId] = tuple;
    }
    children[childId] = { items, focus: theirs.focus.u > ours.focus.u ? theirs.focus : ours.focus };
  }
  return { v: 3, programmeVersion: local.programmeVersion, children };
}

const isWholeNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

function sanitizeTuple(raw: unknown): TeachingItemTuple | null {
  if (!Array.isArray(raw) || raw.length !== 4 || !raw.every(isWholeNumber)) return null;
  const [code, dayNumber, count, updatedAt] = raw as number[];
  if (code === undefined || code > 3) return null;
  return [code as TeachingStatusCode, dayNumber ?? 0, count ?? 0, updatedAt ?? 0];
}

/**
 * Validate stored or synced data. Unknown but well-formed item IDs are kept so
 * a later content version can map them; screens only read IDs the current
 * programme defines.
 */
export function sanitizeTeachingProgress(raw: unknown): TeachingProgressDoc {
  const empty = createEmptyTeachingProgress();
  if (!raw || typeof raw !== 'object' || (raw as { v?: unknown }).v !== 3) return empty;
  const source = raw as { programmeVersion?: unknown; children?: unknown };
  const children: Record<string, ChildTeachingRecord> = {};

  if (source.children && typeof source.children === 'object') {
    for (const [childId, rawChild] of Object.entries(source.children as Record<string, unknown>)) {
      if (!rawChild || typeof rawChild !== 'object') continue;
      const { items: rawItems, focus: rawFocus } = rawChild as { items?: unknown; focus?: unknown };
      const items: Record<string, TeachingItemTuple> = {};
      if (rawItems && typeof rawItems === 'object') {
        for (const [itemId, rawTuple] of Object.entries(rawItems as Record<string, unknown>)) {
          const tuple = sanitizeTuple(rawTuple);
          if (tuple) items[itemId] = tuple;
        }
      }
      const focusSource = (rawFocus ?? {}) as { ids?: unknown; u?: unknown };
      const ids = Array.isArray(focusSource.ids) ? focusSource.ids.filter((id): id is string => typeof id === 'string') : [];
      children[childId] = { items, focus: { ids, u: isWholeNumber(focusSource.u) ? focusSource.u : 0 } };
    }
  }

  return {
    v: 3,
    programmeVersion: typeof source.programmeVersion === 'string' ? source.programmeVersion : empty.programmeVersion,
    children: Object.keys(children).length > 0 ? children : empty.children,
  };
}

/** Every item a parent can record: sounds, tricky words, blending per set, and Phase 1 aspects. */
export function listTeachingItemIds(programme: LettersAndSoundsProgramme): string[] {
  const ids: string[] = [];
  for (const phase of programme.phases) {
    for (const aspect of phase.aspects ?? []) ids.push(aspect.id);
    for (const set of phase.sets) {
      ids.push(...set.gpcs.map((gpc) => gpc.id));
      if (set.gpcs.some((gpc) => gpc.words.length > 0)) ids.push(`blend.${set.id}`);
    }
    if ((phase.adjacentConsonantWords?.length ?? 0) > 0) ids.push(`blend.phase${phase.id}`);
    ids.push(...phase.trickyWords.map((word) => `tricky.${word.toLowerCase()}`));
  }
  return ids;
}

/** Graphemes the parent has introduced, for choosing decodable words. */
export function knownGraphemes(
  doc: TeachingProgressDoc,
  childId: string,
  programme: LettersAndSoundsProgramme,
): Set<string> {
  const known = new Set<string>();
  for (const phase of programme.phases) {
    for (const set of phase.sets) {
      for (const gpc of set.gpcs) {
        if (!getItemState(doc, childId, gpc.id)) continue;
        for (const grapheme of [gpc.grapheme, ...(gpc.alternativeGraphemes ?? [])]) known.add(grapheme.toLowerCase());
      }
    }
  }
  return known;
}

/** Items marked "with help" and not practised for `minDaysSince` days, oldest first. */
export function selectRevisitItems(
  doc: TeachingProgressDoc,
  childId: string,
  programme: LettersAndSoundsProgramme,
  now: Date,
  options: { minDaysSince: number; max: number },
): string[] {
  const validIds = new Set(listTeachingItemIds(programme));
  const today = toDayNumber(now);
  return Object.entries(doc.children[childId]?.items ?? {})
    .filter(([id, tuple]) => validIds.has(id) && tuple[0] === 2 && today - tuple[1] >= options.minDaysSince)
    .sort((a, b) => a[1][1] - b[1][1])
    .slice(0, options.max)
    .map(([id]) => id);
}

/** Clerk limits user metadata to about 8 KB; measured as UTF-8 JSON. */
export const CLERK_METADATA_LIMIT_BYTES = 8 * 1024;

const jsonByteSize = (value: unknown) => new TextEncoder().encode(JSON.stringify(value)).length;

export interface ClerkMetadataResult {
  readonly metadata: Record<string, unknown>;
  readonly droppedLegacyProgress: boolean;
  readonly fits: boolean;
}

/**
 * Build the Clerk `unsafeMetadata` update. Teaching progress has priority: if
 * both records would exceed the limit, the legacy tap-based record is left out.
 */
export function buildClerkMetadata(
  existing: Readonly<Record<string, unknown>> | undefined,
  legacyProgress: unknown,
  teachingProgress: TeachingProgressDoc,
): ClerkMetadataResult {
  const withBoth = { ...existing, phonicsProgress: legacyProgress, teachingProgress };
  if (jsonByteSize(withBoth) <= CLERK_METADATA_LIMIT_BYTES) {
    return { metadata: withBoth, droppedLegacyProgress: false, fits: true };
  }
  const withoutLegacy: Record<string, unknown> = { ...existing, teachingProgress };
  delete withoutLegacy.phonicsProgress;
  return {
    metadata: withoutLegacy,
    droppedLegacyProgress: true,
    fits: jsonByteSize(withoutLegacy) <= CLERK_METADATA_LIMIT_BYTES,
  };
}
