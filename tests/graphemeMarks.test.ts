import { describe, expect, it } from 'vitest';
import { graphemeMarks, readerPageText } from '../src/curriculum/graphemeMarks';

describe('graphemeMarks', () => {
  it('puts a dot under single letters and a line under multi-letter sounds', () => {
    expect(graphemeMarks('sh.o.p')).toEqual([
      { text: 'sh', mark: 'line' },
      { text: 'o', mark: 'dot' },
      { text: 'p', mark: 'dot' },
    ]);
    expect(graphemeMarks('h.igh')[1]).toEqual({ text: 'igh', mark: 'line' });
    expect(graphemeMarks('b.e.ll')[2]).toEqual({ text: 'll', mark: 'line' });
  });

  it('marks both letters of a split digraph and keeps their places', () => {
    expect(graphemeMarks('m.a-e.k')).toEqual([
      { text: 'm', mark: 'dot' },
      { text: 'a', mark: 'split' },
      { text: 'k', mark: 'dot' },
      { text: 'e', mark: 'split' },
    ]);
  });

  it('hides pronunciation marks', () => {
    expect(graphemeMarks('a.s=z')).toEqual([{ text: 'a', mark: 'dot' }, { text: 's', mark: 'dot' }]);
    expect(readerPageText({ words: ['th=ð.e.n', '*we', 's.ee'], end: '!', picture: '☀️' })).toBe('Then we see!');
  });

  it('shows names in lowercase and keeps hyphens', () => {
    expect(graphemeMarks('S.a.m')[0]).toEqual({ text: 's', mark: 'dot' });
    expect(graphemeMarks('z.i.g|z.a.g').map((g) => g.text).join('')).toBe('zig-zag');
    expect(graphemeMarks('z.i.g|z.a.g')[3]).toEqual({ text: '-', mark: 'none' });
  });
});

describe('readerPageText', () => {
  it('builds a sentence with a capital letter, tricky words, and end punctuation', () => {
    expect(readerPageText({ words: ['*the', 'c.a.t', 'i.s', 'o.n', '*the', 'm.a.t'], end: '.', picture: '🐱' })).toBe('The cat is on the mat.');
    expect(readerPageText({ words: ['*I', 's.ee', 'a.n', 'ow.l'], end: '!', picture: '🦉' })).toBe('I see an owl!');
  });
});
