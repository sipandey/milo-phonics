import type { LettersAndSoundsPhase } from '../../types/lettersAndSounds';
import { PHASE_2_READERS } from './readers';

/**
 * Phase 2 follows the Letters and Sounds set order and word lists supplied by
 * the maintainer. Four source words were moved so every word is decodable
 * when offered: "Ken" and "pocket" sit under e (e is taught after k and ck),
 * "run" sits under r (r is taught after u), and "carrot" is left out because
 * rr is not taught in Phase 2.
 */
export const PHASE_2: LettersAndSoundsPhase = {
  id: 2,
  title: 'Phase 2',
  approxAge: '4–5 (first term of Reception)',
  summary: 'Simple letter-sound correspondences, used straight away to sound out and blend words.',
  sets: [
    {
      id: 'p2.set1',
      title: 'Set 1',
      gpcs: [
        { id: 'gpc.s', grapheme: 's', phoneme: 's', words: [], notes: ['"as", "is", and "his" use s for /z/; their words play /z/.'] },
        { id: 'gpc.a', grapheme: 'a', phoneme: 'æ', words: ['a', 'a.s=z'] },
        { id: 'gpc.t', grapheme: 't', phoneme: 't', words: ['a.t', 's.a.t'] },
        { id: 'gpc.p', grapheme: 'p', phoneme: 'p', words: ['p.a.t', 't.a.p', 's.a.p'] },
      ],
    },
    {
      id: 'p2.set2',
      title: 'Set 2',
      gpcs: [
        { id: 'gpc.i', grapheme: 'i', phoneme: 'ɪ', words: ['i.t', 'i.s=z', 's.i.t', 'p.i.t', 't.i.p'] },
        { id: 'gpc.n', grapheme: 'n', phoneme: 'n', words: ['a.n', 'i.n', 'n.i.p', 'p.a.n', 'n.a.p'] },
        { id: 'gpc.m', grapheme: 'm', phoneme: 'm', words: ['a.m', 'm.a.n', 'm.a.t', 'm.a.p', 'T.i.m'] },
        { id: 'gpc.d', grapheme: 'd', phoneme: 'd', words: ['d.a.d', 'a.n.d', 's.a.d', 'd.i.m', 'S.i.d'] },
      ],
    },
    {
      id: 'p2.set3',
      title: 'Set 3',
      gpcs: [
        { id: 'gpc.g', grapheme: 'g', phoneme: 'g', words: ['t.a.g', 'g.a.g', 's.a.g', 'g.a.s', 'p.i.g'] },
        { id: 'gpc.o', grapheme: 'o', phoneme: 'ɒ', words: ['g.o.t', 'o.n', 'n.o.t', 't.o.p', 'd.o.g'] },
        { id: 'gpc.c', grapheme: 'c', phoneme: 'k', words: ['c.a.n', 'c.o.t', 'c.o.p', 'c.a.p', 'c.o.d'] },
        { id: 'gpc.k', grapheme: 'k', phoneme: 'k', words: ['k.i.d', 'k.i.t', 'K.i.m'] },
      ],
    },
    {
      id: 'p2.set4',
      title: 'Set 4',
      gpcs: [
        { id: 'gpc.ck', grapheme: 'ck', phoneme: 'k', words: ['k.i.ck', 's.a.ck', 'd.o.ck', 's.i.ck'] },
        { id: 'gpc.e', grapheme: 'e', phoneme: 'e', words: ['g.e.t', 'p.e.t', 't.e.n', 'n.e.t', 'p.e.n', 'K.e.n', 'p.o.ck.e.t'] },
        { id: 'gpc.u', grapheme: 'u', phoneme: 'ʌ', words: ['u.p', 'm.u.m', 'm.u.g', 'c.u.p'] },
        { id: 'gpc.r', grapheme: 'r', phoneme: 'r', words: ['r.u.n', 'r.i.p', 'r.a.m', 'r.a.t', 'r.o.ck.e.t'] },
      ],
    },
    {
      id: 'p2.set5',
      title: 'Set 5',
      gpcs: [
        { id: 'gpc.h', grapheme: 'h', phoneme: 'h', words: ['h.a.d', 'h.i.m', 'h.i.s=z', 'h.o.t', 'h.u.t'] },
        { id: 'gpc.b', grapheme: 'b', phoneme: 'b', words: ['b.u.t', 'b.i.g', 'b.a.ck', 'b.e.d', 'b.u.s'] },
        {
          id: 'gpc.f',
          grapheme: 'f',
          alternativeGraphemes: ['ff'],
          phoneme: 'f',
          words: ['o.f=v', 'i.f', 'o.ff', 'f.i.t', 'f.o.g', 'p.u.ff'],
          notes: ['"of" uses f for /v/ and plays it that way; it can also be taught as a tricky word.'],
        },
        { id: 'gpc.l', grapheme: 'l', alternativeGraphemes: ['ll'], phoneme: 'l', words: ['l.e.t', 'l.e.g', 'l.o.t', 'b.e.ll', 'd.o.ll'] },
        { id: 'gpc.ss', grapheme: 'ss', phoneme: 's', words: ['l.e.ss', 'h.i.ss', 'm.a.ss', 'm.e.ss', 'b.o.ss'] },
      ],
    },
  ],
  trickyWords: ['the', 'to', 'no', 'go', 'I', 'into'],
  readers: PHASE_2_READERS,
};
