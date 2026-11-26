import { describe, expect, it } from 'vitest';
import { LETTERS_AND_SOUNDS } from '../src/data/lettersAndSounds';
import { buildTodayPlan, suggestNextGpc } from '../src/curriculum/todaySession';
import {
  DEFAULT_CHILD_ID,
  createEmptyTeachingProgress,
  introduceItem,
  markItem,
  setFocus,
} from '../src/services/teachingProgress';
import type { TeachingProgressDoc } from '../src/types/teachingProgress';

const child = DEFAULT_CHILD_ID;
const day = (iso: string) => new Date(`${iso}T12:00:00Z`);
const today = day('2026-11-26');

function withIntroduced(ids: string[], at = day('2026-11-01')): TeachingProgressDoc {
  return ids.reduce((doc, id) => introduceItem(doc, child, id, at), createEmptyTeachingProgress());
}

describe('suggestNextGpc', () => {
  it('suggests the first sound not yet introduced, in teaching order', () => {
    expect(suggestNextGpc(createEmptyTeachingProgress(), child, LETTERS_AND_SOUNDS)).toBe('gpc.s');
    expect(suggestNextGpc(withIntroduced(['gpc.s', 'gpc.a']), child, LETTERS_AND_SOUNDS)).toBe('gpc.t');
  });
});

describe('buildTodayPlan', () => {
  it('always has the four steps in order', () => {
    const plan = buildTodayPlan(createEmptyTeachingProgress(), child, LETTERS_AND_SOUNDS, today);
    expect(plan.steps.map((step) => step.kind)).toEqual(['revisit', 'teach', 'practise', 'apply']);
  });

  it('teaches the first focus sound, or suggests the next sound when there is no focus', () => {
    const suggested = buildTodayPlan(withIntroduced(['gpc.s']), child, LETTERS_AND_SOUNDS, today);
    expect(suggested.teach).toEqual({ kind: 'teach', gpcId: 'gpc.a', suggested: true });

    const focused = buildTodayPlan(setFocus(withIntroduced(['gpc.s']), child, ['gpc.p', 'gpc.t'], today), child, LETTERS_AND_SOUNDS, today);
    expect(focused.teach).toEqual({ kind: 'teach', gpcId: 'gpc.p', suggested: false });
  });

  it('revisits items marked with help that were not practised recently', () => {
    let doc = withIntroduced(['gpc.s', 'gpc.a', 'gpc.t']);
    doc = markItem(doc, child, 'gpc.s', 'with-help', day('2026-11-20'));
    doc = markItem(doc, child, 'tricky.the', 'with-help', day('2026-11-19'));
    doc = markItem(doc, child, 'gpc.a', 'with-help', day('2026-11-25'));
    const plan = buildTodayPlan(doc, child, LETTERS_AND_SOUNDS, today);
    expect(plan.revisit).toEqual({ kind: 'revisit', itemIds: ['tricky.the', 'gpc.s'], recap: false });
  });

  it('falls back to a recap of the least recently practised introduced items, excluding today’s sound', () => {
    let doc = withIntroduced(['gpc.s', 'gpc.a', 'gpc.t', 'gpc.p']);
    doc = markItem(doc, child, 'gpc.s', 'secure', day('2026-11-10'));
    doc = markItem(doc, child, 'gpc.a', 'secure', day('2026-11-24'));
    doc = markItem(doc, child, 'gpc.t', 'secure', day('2026-11-15'));
    doc = setFocus(doc, child, ['gpc.p'], today);
    const plan = buildTodayPlan(doc, child, LETTERS_AND_SOUNDS, today);
    expect(plan.revisit).toEqual({ kind: 'revisit', itemIds: ['gpc.s', 'gpc.t'], recap: true });
  });

  it('practises words for today’s sound from known sounds, with that set’s blending item', () => {
    const plan = buildTodayPlan(withIntroduced(['gpc.s', 'gpc.a', 'gpc.p']), child, LETTERS_AND_SOUNDS, today);
    expect(plan.teach.gpcId).toBe('gpc.t');
    expect(plan.practise.words.map((word) => word.text)).toEqual(['at', 'sat', 'pat', 'tap']);
    expect(plan.practise.blendItemId).toBe('blend.p2.set1');
  });

  it('rotates the listening game by day', () => {
    const games = ['2026-11-26', '2026-11-27', '2026-11-28', '2026-11-29'].map(
      (iso) => buildTodayPlan(createEmptyTeachingProgress(), child, LETTERS_AND_SOUNDS, day(iso)).practise.gameId,
    );
    expect(new Set(games).size).toBe(4);
  });

  it('ends with an off-screen activity for today’s sound', () => {
    const plan = buildTodayPlan(createEmptyTeachingProgress(), child, LETTERS_AND_SOUNDS, today);
    expect(plan.apply.text).toContain('/s/');
  });
});
