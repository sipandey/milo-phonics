import type { LettersAndSoundsPhase } from '../../types/lettersAndSounds';

/**
 * Phase 4 adds no new correspondences. "trap", "strong", "milk", and "crept"
 * come from the supplied description; the other adjacent-consonant words were
 * added for practice and need specialist review.
 */
export const PHASE_4: LettersAndSoundsPhase = {
  id: 4,
  title: 'Phase 4',
  approxAge: '4–5 (Reception)',
  summary: 'Consolidation: reading and spelling words with adjacent consonants.',
  sets: [],
  adjacentConsonantWords: [
    't.r.a.p', 's.t.r.o.ng', 'm.i.l.k', 'c.r.e.p.t',
    'f.r.o.g', 's.t.o.p', 's.w.i.m', 'c.l.a.p', 'd.r.u.m', 'h.e.l.p', 'j.u.m.p',
    't.e.n.t', 'h.a.n.d', 'l.a.m.p', 'b.e.s.t', 'c.r.i.s.p', 's.p.r.i.ng',
  ],
  trickyWords: ['said', 'have', 'like', 'so', 'do', 'some', 'come', 'were', 'there', 'little', 'one', 'when', 'out', 'what'],
};
