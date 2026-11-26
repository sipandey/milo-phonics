import React, { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { LETTERS_AND_SOUNDS } from '../../data/lettersAndSounds';
import { readerPageText } from '../../curriculum/graphemeMarks';
import { parseSegmentedWord } from '../../curriculum/lettersAndSoundsValidation';
import { useTeachingProgress } from '../../hooks/useTeachingProgress';
import { DEFAULT_CHILD_ID, getItemState } from '../../services/teachingProgress';
import { GraphemeWord } from './GraphemeWord';
import { StatusButtons, playWordSoundBySound, recordMark } from './teachingUi';

interface ReaderScreenProps {
  readonly readerId: string;
  readonly onBack: () => void;
}

export const ReaderScreen: React.FC<ReaderScreenProps> = ({ readerId, onBack }) => {
  const doc = useTeachingProgress();
  const [pageIndex, setPageIndex] = useState(0);
  const [showMarks, setShowMarks] = useState(true);
  const [trickyHint, setTrickyHint] = useState<string | null>(null);
  const tokenRef = useRef(0);
  const reader = LETTERS_AND_SOUNDS.phases.flatMap((phase) => phase.readers ?? []).find((candidate) => candidate.id === readerId);

  if (!reader) {
    return (
      <div className="min-h-screen p-6">
        <button type="button" onClick={onBack} className="min-h-[56px] px-4 rounded-2xl bg-gray-100 font-bold cursor-pointer">
          Back
        </button>
      </div>
    );
  }

  const page = reader.pages[pageIndex];
  const isLastPage = pageIndex === reader.pages.length - 1;
  const itemId = `reader.${reader.id}`;

  const tapWord = (token: string) => {
    tokenRef.current += 1;
    const playToken = tokenRef.current;
    if (token.startsWith('*')) {
      setTrickyHint(token.slice(1));
      return;
    }
    setTrickyHint(null);
    const text = parseSegmentedWord(token).text;
    void playWordSoundBySound(token, text, () => tokenRef.current === playToken);
  };

  const goTo = (next: number) => {
    setTrickyHint(null);
    setPageIndex(next);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-3xl mx-auto text-gray-800">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to curriculum map"
          className="min-h-[56px] min-w-[56px] rounded-2xl bg-white border-2 border-gray-200 flex items-center justify-center cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-black font-fun">{reader.title.toLowerCase()}</h1>
        <span className="ml-auto text-sm font-bold text-gray-500" aria-label={`Page ${pageIndex + 1} of ${reader.pages.length}`}>
          {pageIndex + 1} / {reader.pages.length}
        </span>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Point to each word. Your child sounds it out and blends it; tap a word to hear it sound by sound. Pink words are tricky words: say them for your child.
      </p>

      {page && (
        <section className="mt-6 rounded-4xl bg-white border-4 border-amber-200 p-6 text-center" aria-label={readerPageText(page)}>
          <p className="text-8xl" aria-hidden="true">{page.picture}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-4 text-5xl">
            {page.words.map((token, index) => (
              <span key={`${token}-${index}`} className="inline-flex items-start">
                <button
                  type="button"
                  onClick={() => tapWord(token)}
                  aria-label={token.startsWith('*') ? `Tricky word ${token.slice(1)}` : `Hear ${parseSegmentedWord(token).text} sound by sound`}
                  className="min-h-[72px] px-2 rounded-2xl cursor-pointer hover:bg-amber-50"
                >
                  {token.startsWith('*') ? (
                    <span className="font-black font-fun text-rose-600">
                      {token.slice(1)}
                    </span>
                  ) : (
                    <GraphemeWord segmented={token} showMarks={showMarks} />
                  )}
                </button>
                {index === page.words.length - 1 && (
                  <span className="font-black font-fun -ml-2" aria-hidden="true">{page.end}</span>
                )}
              </span>
            ))}
          </div>
          {trickyHint && <p className="mt-4 text-sm text-rose-700">“{trickyHint}” is a tricky word: say it for your child, then read on.</p>}
        </section>
      )}

      <div className="flex items-center justify-between mt-6">
        <button
          type="button"
          onClick={() => goTo(Math.max(0, pageIndex - 1))}
          disabled={pageIndex === 0}
          aria-label="Previous page"
          className="min-h-[88px] min-w-[88px] rounded-4xl bg-white border-2 border-gray-200 flex items-center justify-center cursor-pointer disabled:opacity-30"
        >
          <ArrowLeft className="w-9 h-9" />
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={showMarks}
          onClick={() => setShowMarks((current) => !current)}
          className="min-h-[56px] px-4 rounded-2xl bg-white border-2 border-gray-200 text-sm font-bold cursor-pointer"
        >
          Sound buttons {showMarks ? 'on' : 'off'}
        </button>
        <button
          type="button"
          onClick={() => goTo(Math.min(reader.pages.length - 1, pageIndex + 1))}
          disabled={isLastPage}
          aria-label="Next page"
          className="min-h-[88px] min-w-[88px] rounded-4xl bg-emerald-500 text-white flex items-center justify-center cursor-pointer disabled:opacity-30"
        >
          <ArrowRight className="w-9 h-9" />
        </button>
      </div>

      {isLastPage && (
        <section className="mt-6 rounded-3xl bg-white border-2 border-gray-200 p-4">
          <p className="text-sm font-bold mb-2">For you: how did reading go?</p>
          <StatusButtons itemLabel={`reading ${reader.title}`} current={getItemState(doc, DEFAULT_CHILD_ID, itemId)?.status ?? null} onMark={(status) => recordMark(itemId, status)} />
        </section>
      )}
    </div>
  );
};
