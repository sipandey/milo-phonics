import { describe, expect, it } from 'vitest';
import { LETTERS_AND_SOUNDS } from '../src/data/lettersAndSounds';
import { isDecodableWith } from '../src/curriculum/lettersAndSoundsValidation';
import {
  DEFAULT_CHILD_ID,
  buildClerkMetadata,
  createEmptyTeachingProgress,
  getItemState,
  introduceItem,
  knownGraphemes,
  listTeachingItemIds,
  markItem,
  mergeTeachingProgress,
  removeItem,
  sanitizeTeachingProgress,
  selectRevisitItems,
  setFocus,
} from '../src/services/teachingProgress';
import type { TeachingProgressDoc } from '../src/types/teachingProgress';

const day = (iso: string) => new Date(`${iso}T12:00:00Z`);
const child = DEFAULT_CHILD_ID;

describe('teaching progress records', () => {
  it('introduces an item as not yet practised', () => {
    const doc = introduceItem(createEmptyTeachingProgress(), child, 'gpc.s', day('2026-11-26'));
    expect(getItemState(doc, child, 'gpc.s')).toEqual({ id: 'gpc.s', status: 'not-yet', lastPractised: null, count: 0 });
  });

  it('records a mark with the date and a practice count', () => {
    let doc = introduceItem(createEmptyTeachingProgress(), child, 'gpc.t', day('2026-11-20'));
    doc = markItem(doc, child, 'gpc.t', 'with-help', day('2026-11-24'));
    doc = markItem(doc, child, 'gpc.t', 'secure', day('2026-11-26'));
    expect(getItemState(doc, child, 'gpc.t')).toEqual({ id: 'gpc.t', status: 'secure', lastPractised: '2026-11-26', count: 2 });
  });

  it('removes an item but keeps a record so the removal syncs', () => {
    let doc = markItem(createEmptyTeachingProgress(), child, 'gpc.p', 'with-help', day('2026-11-25'));
    doc = removeItem(doc, child, 'gpc.p', day('2026-11-26'));
    expect(getItemState(doc, child, 'gpc.p')).toBeNull();
    expect(doc.children[child]?.items['gpc.p']?.[0]).toBe(0);
  });

  it('does not change the input document', () => {
    const empty = createEmptyTeachingProgress();
    markItem(empty, child, 'gpc.s', 'secure', day('2026-11-26'));
    expect(empty.children[child]?.items).toEqual({});
  });
});

describe('mergeTeachingProgress', () => {
  it('keeps the newest change for each item and the newest focus', () => {
    let local = markItem(createEmptyTeachingProgress(), child, 'gpc.s', 'secure', day('2026-11-26'));
    local = setFocus(local, child, ['gpc.t'], day('2026-11-20'));
    let cloud = markItem(createEmptyTeachingProgress(), child, 'gpc.s', 'with-help', day('2026-11-25'));
    cloud = markItem(cloud, child, 'gpc.a', 'with-help', day('2026-11-25'));
    cloud = setFocus(cloud, child, ['gpc.p'], day('2026-11-25'));

    const merged = mergeTeachingProgress(local, cloud);
    expect(getItemState(merged, child, 'gpc.s')?.status).toBe('secure');
    expect(getItemState(merged, child, 'gpc.a')?.status).toBe('with-help');
    expect(merged.children[child]?.focus.ids).toEqual(['gpc.p']);
  });

  it('applies a newer removal from another device', () => {
    const local = markItem(createEmptyTeachingProgress(), child, 'gpc.s', 'secure', day('2026-11-24'));
    const cloud = removeItem(local, child, 'gpc.s', day('2026-11-26'));
    expect(getItemState(mergeTeachingProgress(local, cloud), child, 'gpc.s')).toBeNull();
  });

  it('keeps children that exist on only one side', () => {
    const local = markItem(createEmptyTeachingProgress(), 'child-2', 'gpc.s', 'secure', day('2026-11-26'));
    const merged = mergeTeachingProgress(local, createEmptyTeachingProgress());
    expect(getItemState(merged, 'child-2', 'gpc.s')?.status).toBe('secure');
  });
});

describe('sanitizeTeachingProgress', () => {
  it('returns an empty document for missing or unknown formats', () => {
    expect(sanitizeTeachingProgress(undefined)).toEqual(createEmptyTeachingProgress());
    expect(sanitizeTeachingProgress({ v: 2 })).toEqual(createEmptyTeachingProgress());
    expect(sanitizeTeachingProgress('nonsense')).toEqual(createEmptyTeachingProgress());
  });

  it('drops malformed entries and keeps valid unknown IDs for later content versions', () => {
    const raw = {
      v: 3,
      programmeVersion: 'old',
      children: {
        [child]: {
          items: {
            'gpc.s': [3, 20418, 2, 1795000000],
            'gpc.retired': [2, 20410, 1, 1794000000],
            'gpc.bad-status': [7, 1, 1, 1],
            'gpc.bad-shape': 'secure',
            'gpc.negative': [2, -1, 1, 1],
          },
          focus: { ids: ['gpc.s', 42], u: 1 },
        },
      },
    };
    const doc = sanitizeTeachingProgress(raw);
    expect(Object.keys(doc.children[child]?.items ?? {})).toEqual(['gpc.s', 'gpc.retired']);
    expect(doc.children[child]?.focus.ids).toEqual(['gpc.s']);
  });
});

describe('selectRevisitItems', () => {
  it('picks known items marked with help that were not practised recently, oldest first', () => {
    let doc = createEmptyTeachingProgress();
    doc = markItem(doc, child, 'gpc.s', 'with-help', day('2026-11-20'));
    doc = markItem(doc, child, 'gpc.a', 'with-help', day('2026-11-18'));
    doc = markItem(doc, child, 'gpc.t', 'with-help', day('2026-11-25'));
    doc = markItem(doc, child, 'gpc.p', 'secure', day('2026-11-10'));
    doc = markItem(doc, child, 'gpc.retired', 'with-help', day('2026-11-01'));

    const ids = selectRevisitItems(doc, child, LETTERS_AND_SOUNDS, day('2026-11-26'), { minDaysSince: 3, max: 3 });
    expect(ids).toEqual(['gpc.a', 'gpc.s']);
  });
});

describe('programme integration', () => {
  it('lists sounds, tricky words, blending sets, and Phase 1 aspects as items', () => {
    const ids = listTeachingItemIds(LETTERS_AND_SOUNDS);
    expect(ids).toContain('gpc.s');
    expect(ids).toContain('gpc.oo-short');
    expect(ids).toContain('tricky.the');
    expect(ids).toContain('blend.p2.set1');
    expect(ids).toContain('p1.alliteration');
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('derives known graphemes, including alternative spellings, for word selection', () => {
    let doc = createEmptyTeachingProgress();
    for (const id of ['gpc.s', 'gpc.a', 'gpc.t', 'gpc.f']) doc = introduceItem(doc, child, id, day('2026-11-26'));
    const known = knownGraphemes(doc, child, LETTERS_AND_SOUNDS);
    expect([...known].sort()).toEqual(['a', 'f', 'ff', 's', 't']);
    expect(isDecodableWith('s.a.t', known)).toBe(true);
    expect(isDecodableWith('t.a.p', known)).toBe(false);
  });

  it('fits a fully marked record within the Clerk sync budget', () => {
    let doc: TeachingProgressDoc = createEmptyTeachingProgress();
    const ids = listTeachingItemIds(LETTERS_AND_SOUNDS);
    for (const id of ids) {
      for (let i = 0; i < 3; i += 1) doc = markItem(doc, child, id, 'secure', day('2030-12-31'));
    }
    doc = setFocus(doc, child, ids.slice(0, 10), day('2030-12-31'));
    // A fully marked record must leave at least 3 KB of Clerk's ~8 KB metadata limit.
    expect(new TextEncoder().encode(JSON.stringify(doc)).length).toBeLessThan(5000);
  });
});

describe('buildClerkMetadata', () => {
  const teaching = markItem(createEmptyTeachingProgress(), child, 'gpc.s', 'secure', day('2026-11-26'));

  it('keeps other metadata and adds both progress records when they fit', () => {
    const result = buildClerkMetadata({ theme: 'calm' }, { totalTaps: 3 }, teaching);
    expect(result.droppedLegacyProgress).toBe(false);
    expect(result.metadata).toEqual({ theme: 'calm', phonicsProgress: { totalTaps: 3 }, teachingProgress: teaching });
  });

  it('drops the legacy record first when both would exceed the limit', () => {
    const legacy = { exploredObjects: { big: 'x'.repeat(8000) } };
    const result = buildClerkMetadata({ phonicsProgress: { old: true } }, legacy, teaching);
    expect(result.droppedLegacyProgress).toBe(true);
    expect(result.metadata).toEqual({ teachingProgress: teaching });
    expect(result.fits).toBe(true);
  });

  it('reports when even the teaching record does not fit', () => {
    const result = buildClerkMetadata({ notes: 'x'.repeat(9000) }, {}, teaching);
    expect(result.fits).toBe(false);
  });
});
