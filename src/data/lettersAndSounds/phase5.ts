import type { LettersAndSoundsPhase } from '../../types/lettersAndSounds';

/**
 * Phase 5 new graphemes for reading, with the supplied word lists.
 * Alternative pronunciations (ow in blow) and alternative spellings are not
 * modelled yet. Several longer words contain unstressed vowels; see notes.
 */
export const PHASE_5: LettersAndSoundsPhase = {
  id: 5,
  title: 'Phase 5',
  approxAge: '5–6 (Year 1)',
  summary: 'New graphemes for reading, alternative pronunciations, and alternative spellings.',
  sets: [
    {
      id: 'p5.new-graphemes',
      title: 'New graphemes for reading',
      gpcs: [
        { id: 'gpc.ay', grapheme: 'ay', phoneme: 'eɪ', words: ['d.ay', 'p.l.ay', 'c.r.ay.o.n'] },
        {
          id: 'gpc.ou',
          grapheme: 'ou',
          phoneme: 'aʊ',
          words: ['c.l.ou.d', 's.ou.n.d', 'a.b.ou.t'],
          notes: ['The a in "about" is an unstressed /ə/.'],
        },
        { id: 'gpc.ie', grapheme: 'ie', phoneme: 'aɪ', words: ['p.ie', 't.ie', 'c.r.ie.d'] },
        { id: 'gpc.ea', grapheme: 'ea', phoneme: 'iː', words: ['s.ea', 'm.ea.t', 'r.ea.d'] },
        { id: 'gpc.oy', grapheme: 'oy', phoneme: 'ɔɪ', words: ['t.oy', 'e.n.j.oy', 'b.oy'] },
        { id: 'gpc.ir', grapheme: 'ir', phoneme: 'ɜː', words: ['b.ir.d', 'sh.ir.t', 'f.ir.s.t'] },
        { id: 'gpc.ue', grapheme: 'ue', phoneme: 'uː', words: ['b.l.ue', 't.r.ue', 'g.l.ue'] },
        { id: 'gpc.aw', grapheme: 'aw', phoneme: 'ɔː', words: ['p.aw', 'c.l.aw', 'y.aw.n'] },
        { id: 'gpc.wh', grapheme: 'wh', phoneme: 'w', words: ['wh.ee.l', 'wh.i.s.p.er', 'wh.e.n'] },
        {
          id: 'gpc.ph',
          grapheme: 'ph',
          phoneme: 'f',
          words: ['ph.o.t.o', 'd.o.l.ph.i.n', 'a.l.ph.a.b.e.t'],
          notes: ['"photo" ends in /əʊ/; "alphabet" has an unstressed /ə/.'],
        },
        { id: 'gpc.ew', grapheme: 'ew', phoneme: 'uː', words: ['n.ew', 'c.r.ew', 'f.l.ew'] },
        {
          id: 'gpc.oe',
          grapheme: 'oe',
          phoneme: 'əʊ',
          words: ['t.oe', 'f.oe', 't.o.m.a.t.oe.s'],
          notes: ['In "tomatoes", a is /ɑː/ and the first o is an unstressed /ə/.'],
        },
        { id: 'gpc.au', grapheme: 'au', phoneme: 'ɔː', words: ['P.au.l', 'l.au.n.ch', 'h.au.l'] },
        { id: 'gpc.a-e', grapheme: 'a-e', phoneme: 'eɪ', words: ['m.a-e.k', 'g.a-e.m', 's.n.a-e.k'] },
        { id: 'gpc.e-e', grapheme: 'e-e', phoneme: 'iː', words: ['th.e-e.s', 'E-e.v', 'e.x.t.r.e-e.m'] },
        { id: 'gpc.i-e', grapheme: 'i-e', phoneme: 'aɪ', words: ['l.i-e.k', 't.i-e.m', 's.l.i-e.d'] },
        { id: 'gpc.o-e', grapheme: 'o-e', phoneme: 'əʊ', words: ['h.o-e.m', 'b.o-e.n', 'p.o-e.l'] },
        { id: 'gpc.u-e', grapheme: 'u-e', phoneme: 'uː', words: ['r.u-e.l', 'J.u-e.n', 'f.l.u-e.t'] },
      ],
    },
  ],
  trickyWords: ['oh', 'their', 'people', 'Mr', 'Mrs', 'looked', 'called', 'asked', 'could'],
};
