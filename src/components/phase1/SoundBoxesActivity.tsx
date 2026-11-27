import React, { useRef, useState } from 'react';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { createRandom, selectSoundBoxWords } from '../../curriculum/phaseOneActivities';
import { wordSoundSymbols } from '../../curriculum/soundPage';
import { LETTERS_AND_SOUNDS } from '../../data/lettersAndSounds';
import { useTeachingProgress } from '../../hooks/useTeachingProgress';
import { audioService } from '../../services/audioService';
import { DEFAULT_CHILD_ID, getItemState } from '../../services/teachingProgress';
import { StatusButtons, playSymbols, recordMark } from '../curriculum/teachingUi';

const ROUNDS = 5;
const ASPECT_ID = 'p1.oral-blending';

const pickWords = (seed: number, focusGpcId?: string) => selectSoundBoxWords(ROUNDS, createRandom(seed), focusGpcId);

const playWholeWord = (word: { text: string; audioId?: string }) =>
  word.audioId ? audioService.playVoice(word.audioId, { interrupt: true }) : audioService.playCvcWord(word.text);

interface SoundBoxesActivityProps {
  readonly onExit: () => void;
  /** Where the back and finish buttons go, e.g. "curriculum map" or "today's session". */
  readonly exitTo?: string;
  /** Prefer words containing this sound (e.g. the sound taught in today's session). */
  readonly focusGpcId?: string;
}

/** Oral segmenting: tap one box per sound, then hear the whole word. No letters are shown. */
export const SoundBoxesActivity: React.FC<SoundBoxesActivityProps> = ({ onExit, exitTo = 'curriculum map', focusGpcId }) => {
  const doc = useTeachingProgress();
  const [words, setWords] = useState(() => pickWords(Date.now(), focusGpcId));
  const [index, setIndex] = useState(0);
  const [tapped, setTapped] = useState<ReadonlySet<number>>(new Set());
  const tokenRef = useRef(0);
  const word = words[index];
  const done = index >= words.length;
  const sounds = word ? wordSoundSymbols(LETTERS_AND_SOUNDS, word.segmented) : [];
  const allTapped = sounds.length > 0 && tapped.size === sounds.length;

  const play = (run: (isCurrent: () => boolean) => Promise<void>) => {
    tokenRef.current += 1;
    const token = tokenRef.current;
    void run(() => tokenRef.current === token);
  };

  const tapBox = (boxIndex: number) => {
    const symbols = sounds[boxIndex] ?? [];
    const nextTapped = new Set(tapped).add(boxIndex);
    setTapped(nextTapped);
    play(async (isCurrent) => {
      await playSymbols(symbols, isCurrent);
      if (isCurrent() && word && nextTapped.size === sounds.length) await playWholeWord(word);
    });
  };

  const next = () => {
    setTapped(new Set());
    setIndex((current) => current + 1);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          aria-label={`Back to ${exitTo}`}
          className="min-h-[56px] min-w-[56px] rounded-2xl bg-white border-2 border-gray-200 flex items-center justify-center cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-black font-fun text-gray-800">Sound boxes</h1>
        {!done && <span className="ml-auto text-sm font-bold text-gray-500">{index + 1} / {words.length}</span>}
      </div>

      {!done && word && (
        <>
          <p className="text-xs text-gray-500 mt-2">Say the word, then say each sound as your child taps a box.</p>
          <div className="flex flex-col items-center mt-6 gap-4">
            <span className="text-9xl" aria-hidden="true">{word.emoji}</span>
            <button
              type="button"
              onClick={() => play(() => playWholeWord(word))}
              aria-label="Hear the word"
              className="min-h-[88px] min-w-[88px] px-8 rounded-4xl bg-amber-400 text-amber-950 shadow-lg inline-flex items-center cursor-pointer active:scale-95 transition-transform"
            >
              <Volume2 className="w-9 h-9" />
            </button>
          </div>
          <div className="flex justify-center gap-4 mt-8" role="group" aria-label="Sound boxes">
            {sounds.map((_, boxIndex) => (
              <button
                key={boxIndex}
                type="button"
                onClick={() => tapBox(boxIndex)}
                aria-label={`Sound ${boxIndex + 1} of ${sounds.length}`}
                aria-pressed={tapped.has(boxIndex)}
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 cursor-pointer transition-transform active:scale-95 ${
                  tapped.has(boxIndex) ? 'bg-sky-400 border-sky-500' : 'bg-white border-sky-200'
                }`}
              >
                <span className="text-4xl" aria-hidden="true">{tapped.has(boxIndex) ? '●' : '○'}</span>
              </button>
            ))}
          </div>
          {allTapped && (
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={next}
                aria-label="Next"
                className="min-h-[88px] px-10 rounded-4xl bg-emerald-500 text-white text-4xl font-black shadow-lg cursor-pointer active:scale-95 transition-transform"
              >
                ➜
              </button>
            </div>
          )}
        </>
      )}

      {done && (
        <section className="mt-8 text-center">
          <p className="text-7xl" aria-hidden="true">🎉</p>
          <h2 className="text-2xl font-black font-fun mt-2">All done!</h2>
          <div className="mt-6 text-left rounded-3xl bg-white border-2 border-gray-200 p-4">
            <p className="text-sm font-bold mb-2">For you: how did segmenting go?</p>
            <StatusButtons
              itemLabel="Sound boxes"
              current={getItemState(doc, DEFAULT_CHILD_ID, ASPECT_ID)?.status ?? null}
              onMark={(status) => recordMark(ASPECT_ID, status)}
            />
          </div>
          <div className="flex justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => { setWords(pickWords(Date.now(), focusGpcId)); setIndex(0); setTapped(new Set()); }}
              className="min-h-[72px] px-6 rounded-3xl bg-amber-400 text-amber-950 font-black cursor-pointer"
            >
              Play again
            </button>
            <button type="button" onClick={onExit} className="min-h-[72px] px-6 rounded-3xl bg-white border-2 border-gray-200 font-black cursor-pointer">
              {exitTo === 'curriculum map' ? 'Back to map' : `Back to ${exitTo}`}
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
