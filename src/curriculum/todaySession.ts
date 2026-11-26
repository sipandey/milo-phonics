import type { LettersAndSoundsProgramme } from '../types/lettersAndSounds';
import type { TeachingProgressDoc } from '../types/teachingProgress';
import {
  getItemState,
  knownGraphemes,
  listTeachingItemIds,
  selectRevisitItems,
} from '../services/teachingProgress';
import { PHASE_ONE_ACTIVITY_IDS, type PhaseOneActivityId } from './phaseOneActivities';
import { findGpc, selectPractiseWords } from './soundPage';

/** A short daily session in the Letters and Sounds lesson shape: Revisit → Teach → Practise → Apply. */

export interface RevisitStep { readonly kind: 'revisit'; readonly itemIds: readonly string[]; readonly recap: boolean }
export interface TeachStep { readonly kind: 'teach'; readonly gpcId: string; readonly suggested: boolean }
export interface PractiseStep {
  readonly kind: 'practise';
  readonly words: readonly { readonly segmented: string; readonly text: string }[];
  readonly blendItemId: string | null;
  readonly gameId: PhaseOneActivityId;
}
export interface ApplyStep { readonly kind: 'apply'; readonly text: string }
export type TodayStep = RevisitStep | TeachStep | PractiseStep | ApplyStep;

export interface TodayPlan {
  readonly revisit: RevisitStep;
  readonly teach: TeachStep;
  readonly practise: PractiseStep;
  readonly apply: ApplyStep;
  readonly steps: readonly TodayStep[];
}

const MS_PER_DAY = 86_400_000;
const MAX_REVISIT = 3;
const MAX_RECAP = 2;
const MAX_WORDS = 4;

/** The first correspondence, in teaching order, that has not been introduced. */
export function suggestNextGpc(doc: TeachingProgressDoc, childId: string, programme: LettersAndSoundsProgramme): string | null {
  for (const phase of programme.phases) {
    for (const set of phase.sets) {
      for (const gpc of set.gpcs) if (!getItemState(doc, childId, gpc.id)) return gpc.id;
    }
  }
  return null;
}

/** Introduced sounds and tricky words, least recently practised first. */
function selectRecapItems(doc: TeachingProgressDoc, childId: string, programme: LettersAndSoundsProgramme, exclude: string) {
  return listTeachingItemIds(programme)
    .filter((id) => (id.startsWith('gpc.') || id.startsWith('tricky.')) && id !== exclude)
    .flatMap((id) => {
      const state = getItemState(doc, childId, id);
      return state ? [{ id, last: state.lastPractised ?? '' }] : [];
    })
    .sort((a, b) => a.last.localeCompare(b.last))
    .slice(0, MAX_RECAP)
    .map((item) => item.id);
}

export function buildTodayPlan(
  doc: TeachingProgressDoc,
  childId: string,
  programme: LettersAndSoundsProgramme,
  now: Date,
): TodayPlan {
  const focusId = (doc.children[childId]?.focus.ids ?? []).find((id) => findGpc(programme, id));
  const gpcId = focusId ?? suggestNextGpc(doc, childId, programme) ?? 'gpc.s';
  const teach: TeachStep = { kind: 'teach', gpcId, suggested: !focusId };

  const due = selectRevisitItems(doc, childId, programme, now, { minDaysSince: 3, max: MAX_REVISIT + 1 }).filter((id) => id !== gpcId);
  const revisit: RevisitStep =
    due.length > 0
      ? { kind: 'revisit', itemIds: due.slice(0, MAX_REVISIT), recap: false }
      : { kind: 'revisit', itemIds: selectRecapItems(doc, childId, programme, gpcId), recap: true };

  const location = findGpc(programme, gpcId);
  const known = knownGraphemes(doc, childId, programme);
  const words = selectPractiseWords(programme, known, [gpcId]).words.slice(0, MAX_WORDS).map(({ segmented, text }) => ({ segmented, text }));
  const setHasWords = location?.set.gpcs.some((gpc) => gpc.words.length > 0) ?? false;
  const dayNumber = Math.floor(now.getTime() / MS_PER_DAY);
  const practise: PractiseStep = {
    kind: 'practise',
    words,
    blendItemId: location && setHasWords ? `blend.${location.set.id}` : null,
    gameId: PHASE_ONE_ACTIVITY_IDS[dayNumber % PHASE_ONE_ACTIVITY_IDS.length] ?? 'robot-blending',
  };

  const phoneme = location?.gpc.phoneme ?? 's';
  const apply: ApplyStep = { kind: 'apply', text: `Find three things that start with /${phoneme}/ at home or on a walk.` };

  return { revisit, teach, practise, apply, steps: [revisit, teach, practise, apply] };
}
