import React, { useRef } from 'react';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { LETTERS_AND_SOUNDS } from '../../data/lettersAndSounds';
import { findGpc, hasWholeWordAudio, phonemeAudioSymbols, wordSoundSymbols, wordsForGpc } from '../../curriculum/soundPage';
import { useTeachingProgress } from '../../hooks/useTeachingProgress';
import { audioService } from '../../services/audioService';
import { teachingProgressStore } from '../../services/teachingProgressStore';
import {
  DEFAULT_CHILD_ID,
  getItemState,
  introduceItem,
  knownGraphemes,
  removeItem,
  setFocus,
} from '../../services/teachingProgress';
import { GraphemeWord } from './GraphemeWord';
import { STATUS_STYLES, StatusButtons, playSymbols, recordMark } from './teachingUi';

interface SoundPageScreenProps {
  readonly gpcId: string;
  readonly onBack: () => void;
}

export const SoundPageScreen: React.FC<SoundPageScreenProps> = ({ gpcId, onBack }) => {
  const doc = useTeachingProgress();
  const playTokenRef = useRef(0);
  const location = findGpc(LETTERS_AND_SOUNDS, gpcId);

  if (!location) {
    return (
      <div className="min-h-screen p-6">
        <button type="button" onClick={onBack} className="min-h-[56px] px-4 rounded-2xl bg-gray-100 font-bold cursor-pointer">
          Back
        </button>
      </div>
    );
  }

  const { gpc, phase, set } = location;
  const state = getItemState(doc, DEFAULT_CHILD_ID, gpc.id);
  const focusIds = doc.children[DEFAULT_CHILD_ID]?.focus.ids ?? [];
  const isFocus = focusIds.includes(gpc.id);
  const known = knownGraphemes(doc, DEFAULT_CHILD_ID, LETTERS_AND_SOUNDS);
  const spellings = [gpc.grapheme, ...(gpc.alternativeGraphemes ?? [])].join(' / ');

  const startPlayback = () => {
    playTokenRef.current += 1;
    const token = playTokenRef.current;
    return () => playTokenRef.current === token;
  };

  const playSound = () => {
    const isCurrent = startPlayback();
    void playSymbols(phonemeAudioSymbols(gpc.phoneme), isCurrent);
  };

  const playWord = async (segmented: string, text: string) => {
    const isCurrent = startPlayback();
    await playSymbols(wordSoundSymbols(LETTERS_AND_SOUNDS, segmented, gpc.id).flat(), isCurrent);
    if (isCurrent() && hasWholeWordAudio(text)) await audioService.playCvcWord(text);
  };

  const toggleIntroduced = () => {
    const now = new Date();
    teachingProgressStore.update((current) =>
      state ? removeItem(current, DEFAULT_CHILD_ID, gpc.id, now) : introduceItem(current, DEFAULT_CHILD_ID, gpc.id, now),
    );
  };

  const toggleFocus = () => {
    const next = isFocus ? focusIds.filter((id) => id !== gpc.id) : [...focusIds, gpc.id];
    teachingProgressStore.update((current) => setFocus(current, DEFAULT_CHILD_ID, next, new Date()));
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-3xl mx-auto text-gray-800">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back to curriculum map"
        className="mb-4 min-h-[56px] px-4 rounded-2xl bg-white border-2 border-gray-200 font-bold flex items-center gap-2 cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" /> Curriculum map
      </button>

      <section className={`rounded-4xl border-4 p-6 text-center ${STATUS_STYLES[state?.status ?? 'none']}`}>
        <p className="text-sm font-bold">
          {phase.title} · {set.title}
        </p>
        <h1 className="text-8xl font-black font-fun my-2">{spellings}</h1>
        <p className="text-lg">/{gpc.phoneme}/</p>
        <button
          type="button"
          onClick={playSound}
          aria-label={`Hear the sound ${gpc.grapheme}`}
          className="mt-4 min-h-[88px] min-w-[88px] px-8 rounded-4xl bg-amber-400 text-amber-950 font-black text-xl shadow-lg inline-flex items-center gap-3 cursor-pointer active:scale-95 transition-transform"
        >
          <Volume2 className="w-8 h-8" /> Hear it
        </button>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          role="switch"
          aria-checked={state !== null}
          onClick={toggleIntroduced}
          className={`min-h-[56px] rounded-2xl border-2 font-bold cursor-pointer ${state ? 'bg-sky-500 text-white border-sky-600' : 'bg-white border-gray-200'}`}
        >
          {state ? '✓ Sound introduced' : 'Mark sound as introduced'}
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={isFocus}
          onClick={toggleFocus}
          className={`min-h-[56px] rounded-2xl border-2 font-bold cursor-pointer ${isFocus ? 'bg-amber-400 text-amber-950 border-amber-500' : 'bg-white border-gray-200'}`}
        >
          {isFocus ? '★ Practising this sound' : 'Practise this sound'}
        </button>
      </section>

      <section className="mt-6">
        <h2 className="font-black text-lg mb-2">After practising, how did it go?</h2>
        <StatusButtons itemLabel={`the sound ${gpc.grapheme}`} current={state?.status ?? null} onMark={(status) => recordMark(gpc.id, status)} />
        <p className="text-xs text-gray-500 mt-2">
          {state?.lastPractised
            ? `Last practised ${state.lastPractised} · ${state.count} time${state.count === 1 ? '' : 's'}`
            : 'Not practised yet.'}
        </p>
      </section>

      {(gpc.notes?.length ?? 0) > 0 && (
        <section className="mt-6 rounded-3xl bg-slate-50 border-2 border-slate-200 p-4 text-sm">
          <h2 className="font-black mb-1">Notes for you</h2>
          <ul className="list-disc pl-5">{gpc.notes?.map((note) => <li key={note}>{note}</li>)}</ul>
        </section>
      )}

      <section className="mt-6">
        <h2 className="font-black text-lg mb-2">Words to blend</h2>
        {gpc.words.length === 0 && <p className="text-sm text-gray-500">No words yet. Practise the sound on its own.</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          {wordsForGpc(gpc, known).map((word) => (
            <button
              key={word.segmented}
              type="button"
              onClick={() => void playWord(word.segmented, word.text)}
              aria-label={`Hear ${word.text} sound by sound`}
              className={`min-h-[88px] rounded-3xl border-2 p-4 text-left cursor-pointer flex items-center justify-between ${
                word.decodable ? 'bg-white border-amber-200' : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}
            >
              <span>
                <GraphemeWord segmented={word.segmented} showMarks={word.decodable} className="text-3xl" />
                {!word.decodable && <span className="block text-xs mt-1">Needs: {word.missing.join(', ')}</span>}
              </span>
              <Volume2 className="w-6 h-6 shrink-0" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
