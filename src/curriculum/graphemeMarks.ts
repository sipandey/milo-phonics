import type { ReaderPage } from '../types/lettersAndSounds';
import { parseSegmentedWord } from './lettersAndSoundsValidation';

/** Sound-button notation: a dot under a one-letter sound, a line under a multi-letter sound. */
export type GraphemeMark = 'dot' | 'line' | 'split' | 'none';

export interface MarkedGrapheme {
  readonly text: string;
  readonly mark: GraphemeMark;
}

const SPLIT_DIGRAPH = /^[a-z]-e$/i;

export function graphemeMarks(segmented: string): MarkedGrapheme[] {
  const marked: MarkedGrapheme[] = [];
  segmented.split('|').forEach((part, partIndex) => {
    if (partIndex > 0) marked.push({ text: '-', mark: 'none' });
    let pendingE: MarkedGrapheme | null = null;
    for (const token of part.split('.')) {
      if (SPLIT_DIGRAPH.test(token)) {
        marked.push({ text: token[0] ?? '', mark: 'split' });
        pendingE = { text: token[2] ?? 'e', mark: 'split' };
        continue;
      }
      marked.push({ text: token, mark: token.length > 1 ? 'line' : 'dot' });
      if (pendingE) {
        marked.push(pendingE);
        pendingE = null;
      }
    }
  });
  return marked;
}

/** Plain text of one word token; a leading `*` marks a tricky word. */
export function readerWordText(token: string): string {
  return token.startsWith('*') ? token.slice(1) : parseSegmentedWord(token).text;
}

export function readerPageText(page: ReaderPage): string {
  const sentence = page.words.map(readerWordText).join(' ');
  return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}${page.end}`;
}
