import type { LettersAndSoundsPhase } from '../../types/lettersAndSounds';

/**
 * Phase 3 follows the Letters and Sounds order and word lists supplied by the
 * maintainer. "dinner", "summer", and "letter" rely on doubled consonants,
 * which the checker accepts once ff/ll/ss have been taught in Phase 2.
 */
export const PHASE_3: LettersAndSoundsPhase = {
  id: 3,
  title: 'Phase 3',
  approxAge: '4–5 (Reception)',
  summary: 'The remaining single letters, consonant digraphs, and long vowel sounds.',
  sets: [
    {
      id: 'p3.set6',
      title: 'Set 6',
      gpcs: [
        { id: 'gpc.j', grapheme: 'j', phoneme: 'dʒ', words: ['j.e.t', 'j.a.m', 'j.o.g', 'J.a.n'] },
        { id: 'gpc.v', grapheme: 'v', phoneme: 'v', words: ['v.a.n', 'v.e.t', 'v.e.l.v.e.t'] },
        { id: 'gpc.w', grapheme: 'w', phoneme: 'w', words: ['w.i.g', 'w.i.ll', 'w.e.b'] },
        { id: 'gpc.x', grapheme: 'x', phoneme: 'ks', words: ['f.o.x', 'b.o.x', 's.i.x'] },
      ],
    },
    {
      id: 'p3.set7',
      title: 'Set 7',
      gpcs: [
        { id: 'gpc.y', grapheme: 'y', phoneme: 'j', words: ['y.e.s', 'y.e.t', 'y.e.ll'] },
        { id: 'gpc.z', grapheme: 'z', phoneme: 'z', words: ['z.i.p', 'z.i.g|z.a.g'] },
        { id: 'gpc.zz', grapheme: 'zz', phoneme: 'z', words: ['b.u.zz', 'j.a.zz'] },
        { id: 'gpc.qu', grapheme: 'qu', phoneme: 'kw', words: ['qu.i.t', 'qu.i.ck', 'l.i.qu.i.d'] },
      ],
    },
    {
      id: 'p3.consonant-digraphs',
      title: 'Consonant digraphs',
      gpcs: [
        { id: 'gpc.ch', grapheme: 'ch', phoneme: 'tʃ', words: ['ch.i.p', 'ch.a.t', 'r.i.ch'] },
        { id: 'gpc.sh', grapheme: 'sh', phoneme: 'ʃ', words: ['sh.o.p', 'sh.e.d', 'f.i.sh'] },
        {
          id: 'gpc.th',
          grapheme: 'th',
          phoneme: 'θ',
          words: ['th.i.n', 'm.o.th', 'th.a.t'],
          notes: ['th has two sounds: /θ/ as in thin and /ð/ as in that.'],
        },
        { id: 'gpc.ng', grapheme: 'ng', phoneme: 'ŋ', words: ['r.i.ng', 'th.i.ng', 's.o.ng'] },
      ],
    },
    {
      id: 'p3.vowel-digraphs',
      title: 'Vowel digraphs and trigraphs',
      gpcs: [
        { id: 'gpc.ai', grapheme: 'ai', phoneme: 'eɪ', words: ['r.ai.n', 't.ai.l', 'ai.m'] },
        { id: 'gpc.ee', grapheme: 'ee', phoneme: 'iː', words: ['b.ee', 'l.ee.k', 's.ee'] },
        { id: 'gpc.igh', grapheme: 'igh', phoneme: 'aɪ', words: ['h.igh', 's.igh', 'm.igh.t'] },
        { id: 'gpc.oa', grapheme: 'oa', phoneme: 'əʊ', words: ['b.oa.t', 't.oa.d', 'f.oa.l'] },
        { id: 'gpc.oo-long', grapheme: 'oo', phoneme: 'uː', words: ['b.oo.t', 'f.oo.d', 'm.oo.n'] },
        { id: 'gpc.oo-short', grapheme: 'oo', phoneme: 'ʊ', words: ['b.oo.k', 'w.oo.d', 'f.oo.t'] },
        { id: 'gpc.ar', grapheme: 'ar', phoneme: 'ɑː', words: ['p.ar.k', 'ar.t', 'c.ar'] },
        { id: 'gpc.or', grapheme: 'or', phoneme: 'ɔː', words: ['f.or', 't.or.n', 'f.or.k'] },
        { id: 'gpc.ur', grapheme: 'ur', phoneme: 'ɜː', words: ['h.ur.t', 'f.ur', 's.ur.f'] },
        { id: 'gpc.ow', grapheme: 'ow', phoneme: 'aʊ', words: ['c.ow', 'ow.l', 't.ow.n'] },
        { id: 'gpc.oi', grapheme: 'oi', phoneme: 'ɔɪ', words: ['c.oi.n', 'b.oi.l', 'oi.l'] },
        { id: 'gpc.ear', grapheme: 'ear', phoneme: 'ɪə', words: ['d.ear', 'sh.ear', 'y.ear'] },
        { id: 'gpc.air', grapheme: 'air', phoneme: 'eə', words: ['f.air', 'p.air', 'h.air'] },
        {
          id: 'gpc.ure',
          grapheme: 'ure',
          phoneme: 'ʊə',
          words: ['s.ure', 'p.ure', 'm.a.n.ure'],
          notes: ['"sure" uses s for /ʃ/; "pure" and "manure" add a /j/ before ure.'],
        },
        { id: 'gpc.er', grapheme: 'er', phoneme: 'ə', words: ['d.i.nn.er', 's.u.mm.er', 'l.e.tt.er'] },
      ],
    },
  ],
  trickyWords: ['he', 'she', 'we', 'me', 'be', 'was', 'you', 'they', 'all', 'are', 'my', 'her'],
};
