import React from 'react';
import { graphemeMarks } from '../../curriculum/graphemeMarks';

interface GraphemeWordProps {
  readonly segmented: string;
  /** Show sound buttons: dots under single letters, lines under multi-letter sounds. */
  readonly showMarks?: boolean;
  readonly className?: string;
}

/** A word drawn grapheme by grapheme, so sh, igh, and ll read as one sound. */
export const GraphemeWord: React.FC<GraphemeWordProps> = ({ segmented, showMarks = true, className = '' }) => (
  <span className={`inline-flex items-end font-black font-fun ${className}`}>
    {graphemeMarks(segmented).map((grapheme, index) => (
      <span key={index} className="inline-flex flex-col items-center">
        <span>{grapheme.text}</span>
        {showMarks && grapheme.mark !== 'none' && (
          <span
            data-mark={grapheme.mark}
            aria-hidden="true"
            className={
              grapheme.mark === 'dot'
                ? 'block w-2 h-2 rounded-full bg-sky-500 mt-1'
                : `block h-1.5 rounded-full mt-1.5 self-stretch mx-0.5 ${grapheme.mark === 'split' ? 'bg-rose-400' : 'bg-sky-500'}`
            }
          />
        )}
      </span>
    ))}
  </span>
);
