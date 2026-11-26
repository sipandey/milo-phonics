import React from 'react';

/**
 * Letter heights as a fraction of font size, measured in Chrome for the app's
 * heavy Nunito: x 0.501, s and a 0.503, H and h 0.714, g descends 0.191.
 */
export const WRITING_LINES = { xHeight: 0.5, ascender: 0.714, descender: 0.19 } as const;

const FONT_SIZE = 100;
const BASELINE = 90;
const HEIGHT = BASELINE + WRITING_LINES.descender * FONT_SIZE + 8;
const CHAR_WIDTH = 58;
const PADDING = 24;
const SEPARATOR_WIDTH = 64;

interface LetterOnLinesProps {
  /** One grapheme, or several spellings of one sound (e.g. `f`, `ff`). */
  readonly graphemes: readonly string[];
  /** Sets the rendered height, e.g. `h-32`; width follows. */
  readonly className?: string;
}

/**
 * Draws graphemes on handwriting lines (top line, dashed middle line, baseline)
 * so a lone lowercase letter such as s cannot be mistaken for a capital.
 */
export const LetterOnLines: React.FC<LetterOnLinesProps> = ({ graphemes, className = 'h-28' }) => {
  const items: { text: string; x: number; separator: boolean }[] = [];
  let width = 0;
  graphemes.forEach((grapheme, index) => {
    if (index > 0) {
      items.push({ text: 'or', x: width + SEPARATOR_WIDTH / 2, separator: true });
      width += SEPARATOR_WIDTH;
    }
    const itemWidth = grapheme.length * CHAR_WIDTH + PADDING;
    items.push({ text: grapheme, x: width + itemWidth / 2, separator: false });
    width += itemWidth;
  });
  const line = (y: number) => ({ x1: 0, x2: width, y1: y, y2: y });

  return (
    <svg
      data-writing-lines
      role="img"
      aria-label={`lowercase ${graphemes.join(' or ')}`}
      viewBox={`0 0 ${width} ${HEIGHT}`}
      className={`w-auto font-fun font-black ${className.includes('block') ? '' : 'inline-block '}${className}`}
    >
      <line data-line="top" {...line(BASELINE - WRITING_LINES.ascender * FONT_SIZE)} stroke="#CBD5E1" strokeWidth={1.5} />
      <line data-line="midline" {...line(BASELINE - WRITING_LINES.xHeight * FONT_SIZE)} stroke="#93C5FD" strokeWidth={1.5} strokeDasharray="6 5" />
      <line data-line="baseline" {...line(BASELINE)} stroke="#64748B" strokeWidth={2.5} />
      {items.map((item, index) => (
        <text
          key={index}
          x={item.x}
          y={BASELINE}
          textAnchor="middle"
          fontSize={item.separator ? FONT_SIZE * 0.3 : FONT_SIZE}
          fontWeight={item.separator ? 700 : undefined}
          fill={item.separator ? '#94A3B8' : 'currentColor'}
        >
          {item.text}
        </text>
      ))}
    </svg>
  );
};
