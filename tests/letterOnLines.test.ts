import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LetterOnLines, WRITING_LINES } from '../src/components/curriculum/LetterOnLines';

describe('LetterOnLines', () => {
  it('draws handwriting lines from the measured font proportions', () => {
    expect(WRITING_LINES.xHeight).toBeCloseTo(0.5, 2);
    expect(WRITING_LINES.ascender).toBeCloseTo(0.71, 2);
    const markup = renderToStaticMarkup(createElement(LetterOnLines, { graphemes: ['s'] }));
    expect(markup).toContain('data-writing-lines');
    expect(markup).toContain('data-line="baseline"');
    expect(markup).toContain('data-line="midline"');
    expect(markup).toContain('data-line="top"');
    expect(markup).toContain('>s</text>');
    expect(markup).toContain('aria-label="lowercase s"');
  });

  it('shows alternative spellings side by side', () => {
    const markup = renderToStaticMarkup(createElement(LetterOnLines, { graphemes: ['f', 'ff'] }));
    expect(markup).toContain('>f</text>');
    expect(markup).toContain('>ff</text>');
    expect(markup).toContain('>or</text>');
    expect(markup).toContain('aria-label="lowercase f or ff"');
  });
});
