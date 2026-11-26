import type { LettersAndSoundsReader } from '../../types/lettersAndSounds';

/**
 * Short decodable readers written for this app. Words are segmented; `*` marks
 * a tricky word. `npm run verify:curriculum` checks each reader is decodable
 * after `afterGpcId` using tricky words up to its phase. Not specialist-reviewed.
 *
 * Playback note: sound-by-sound playback uses one sound per grapheme, so "then"
 * plays th as /θ/; readers avoid short-oo words for the same reason.
 */

export const PHASE_2_READERS: readonly LettersAndSoundsReader[] = [
  {
    id: 'sam-tim-dad',
    title: 'Sam, Tim and Dad',
    afterGpcId: 'gpc.d',
    pages: [
      { words: ['S.a.m', 's.a.t'], end: '.', picture: '🧒' },
      { words: ['T.i.m', 's.a.t'], end: '.', picture: '👦' },
      { words: ['D.a.d', 'p.a.t', 'S.a.m'], end: '.', picture: '👨' },
      { words: ['T.i.m', 'p.a.t', 'D.a.d'], end: '!', picture: '🤗' },
    ],
  },
  {
    id: 'cat-and-dog',
    title: 'The cat and the dog',
    afterGpcId: 'gpc.r',
    pages: [
      { words: ['*the', 'c.a.t', 'i.s', 'o.n', '*the', 'm.a.t'], end: '.', picture: '🐱' },
      { words: ['*the', 'd.o.g', 'i.s', 'i.n', '*the', 'p.e.n'], end: '.', picture: '🐕' },
      { words: ['*the', 'c.a.t', 'r.a.n', '*to', '*the', 'd.o.g'], end: '.', picture: '🏃' },
      { words: ['*the', 'c.a.t', 'a.n.d', '*the', 'd.o.g', 'n.a.p'], end: '.', picture: '😴' },
    ],
  },
  {
    id: 'big-red-bus',
    title: 'A big red bus',
    afterGpcId: 'gpc.ss',
    pages: [
      { words: ['a', 'b.i.g', 'r.e.d', 'b.u.s'], end: '.', picture: '🚌' },
      { words: ['M.u.m', 'g.e.t.s', 'o.n'], end: '.', picture: '👩' },
      { words: ['D.a.d', 'a.n.d', 'B.e.n', 'g.e.t', 'o.n'], end: '.', picture: '👨‍👦' },
      { words: ['o.ff', '*to', '*the', 'h.i.ll'], end: '!', picture: '⛰️' },
    ],
  },
];

export const PHASE_3_READERS: readonly LettersAndSoundsReader[] = [
  {
    id: 'fish-and-chips',
    title: 'Fish and chips',
    afterGpcId: 'gpc.ng',
    pages: [
      { words: ['*the', 'f.i.sh', 'sh.o.p', 'i.s', 'b.i.g'], end: '.', picture: '🏪' },
      { words: ['*I', 'g.o.t', 'f.i.sh', 'a.n.d', 'ch.i.p.s'], end: '.', picture: '🐟' },
      { words: ['*my', 'ch.i.p.s', '*are', 'i.n', 'a', 'd.i.sh'], end: '.', picture: '🍟' },
      { words: ['*I', 'h.a.d', 'a', 'b.i.g', 'f.i.sh'], end: '!', picture: '😋' },
    ],
  },
  {
    id: 'rain-in-the-park',
    title: 'Rain in the park',
    afterGpcId: 'gpc.ar',
    pages: [
      { words: ['r.ai.n', 'h.i.t.s', '*the', 'p.ar.k'], end: '.', picture: '🌧️' },
      { words: ['*we', 's.ee', 'a', 'w.e.t', 'd.o.g'], end: '.', picture: '🐕' },
      { words: ['*the', 'd.o.g', 'h.a.s', 'a', 'r.e.d', 'c.oa.t'], end: '.', picture: '🧥' },
      { words: ['th.e.n', '*we', 's.ee', '*the', 's.u.n'], end: '!', picture: '☀️' },
    ],
  },
  {
    id: 'night-owl',
    title: 'The night owl',
    afterGpcId: 'gpc.ow',
    pages: [
      { words: ['*I', 's.ee', 'a.n', 'ow.l'], end: '!', picture: '🦉' },
      { words: ['*the', 'ow.l', 's.i.t.s', 'o.n', 'a', 'l.o.g'], end: '.', picture: '🪵' },
      { words: ['i.t', 'c.a.n', 's.ee', '*the', 'm.oo.n'], end: '.', picture: '🌕' },
      { words: ['h.oo.t', 'h.oo.t', '*the', 'm.oo.n', 'i.s', 'h.igh'], end: '!', picture: '🌙' },
    ],
  },
];
