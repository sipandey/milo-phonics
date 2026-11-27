import React, { useRef, useState } from 'react';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { LETTERS_AND_SOUNDS } from '../../data/lettersAndSounds';
import { buildTodayPlan, type TodayStep } from '../../curriculum/todaySession';
import { findGpc, phonemeAudioSymbols } from '../../curriculum/soundPage';
import type { PhaseOneActivityId } from '../../curriculum/phaseOneActivities';
import { useTeachingProgress } from '../../hooks/useTeachingProgress';
import { teachingProgressStore } from '../../services/teachingProgressStore';
import { DEFAULT_CHILD_ID, getItemState } from '../../services/teachingProgress';
import { StatusButtons, playSymbols, playWordSoundBySound, recordMark } from '../curriculum/teachingUi';
import { GraphemeWord } from '../curriculum/GraphemeWord';
import { LetterOnLines } from '../curriculum/LetterOnLines';
import { SoundPictures } from '../curriculum/SoundPictures';
import { PictureChoiceActivity } from '../phase1/PictureChoiceActivity';
import { SoundBoxesActivity } from '../phase1/SoundBoxesActivity';

const STEP_TITLES: Record<TodayStep['kind'], string> = { revisit: 'Revisit', teach: 'Teach', practise: 'Practise', apply: 'Apply' };
const GAME_TITLES: Record<PhaseOneActivityId, string> = {
  'robot-blending': '🤖 Robot Milo',
  'sound-boxes': '🟦 Sound boxes',
  'first-sounds': '🦁 First sounds',
  'odd-one-out': '🎵 Odd one out',
};

interface TodaySessionScreenProps {
  readonly onExit: () => void;
}

export const TodaySessionScreen: React.FC<TodaySessionScreenProps> = ({ onExit }) => {
  const doc = useTeachingProgress();
  const [plan] = useState(() => buildTodayPlan(teachingProgressStore.get(), DEFAULT_CHILD_ID, LETTERS_AND_SOUNDS, new Date()));
  const [stepIndex, setStepIndex] = useState(0);
  const [playingGame, setPlayingGame] = useState(false);
  const [finished, setFinished] = useState(false);
  const tokenRef = useRef(0);
  const step = plan.steps[stepIndex];
  const status = (id: string) => getItemState(doc, DEFAULT_CHILD_ID, id)?.status ?? null;

  const play = (run: (isCurrent: () => boolean) => Promise<void>) => {
    tokenRef.current += 1;
    const token = tokenRef.current;
    void run(() => tokenRef.current === token);
  };
  const playGpc = (gpcId: string) => {
    const gpc = findGpc(LETTERS_AND_SOUNDS, gpcId)?.gpc;
    if (gpc) play((isCurrent) => playSymbols(phonemeAudioSymbols(gpc.phoneme), isCurrent));
  };

  if (playingGame) {
    const exit = () => setPlayingGame(false);
    return plan.practise.gameId === 'sound-boxes' ? (
      <SoundBoxesActivity onExit={exit} exitTo="today's session" focusGpcId={plan.teach.gpcId} />
    ) : (
      <PictureChoiceActivity activityId={plan.practise.gameId} onExit={exit} exitTo="today's session" focusGpcId={plan.teach.gpcId} />
    );
  }

  const teachGpc = findGpc(LETTERS_AND_SOUNDS, plan.teach.gpcId)?.gpc;

  const renderItem = (itemId: string) => {
    const gpc = findGpc(LETTERS_AND_SOUNDS, itemId)?.gpc;
    const label = gpc ? gpc.grapheme : itemId.replace(/^tricky\./, '');
    return (
      <div key={itemId} className="rounded-3xl bg-white border-2 border-gray-200 p-4 flex items-center gap-4 flex-wrap">
        {gpc ? (
          <LetterOnLines graphemes={[gpc.grapheme]} className="h-16" />
        ) : (
          <span className="text-5xl font-black font-fun min-w-[72px] text-center">{label}</span>
        )}
        {gpc && (
          <button
            type="button"
            onClick={() => playGpc(itemId)}
            aria-label={`Hear the sound ${gpc.grapheme}`}
            className="min-h-[56px] min-w-[56px] rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center cursor-pointer"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        )}
        <div className="flex-1 min-w-[240px]">
          <StatusButtons itemLabel={gpc ? `the sound ${label}` : `the tricky word ${label}`} current={status(itemId)} onMark={(next) => recordMark(itemId, next)} compact />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-3xl mx-auto text-gray-800">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          aria-label="Leave today's session"
          className="min-h-[56px] min-w-[56px] rounded-2xl bg-white border-2 border-gray-200 flex items-center justify-center cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-black font-fun">Today with Milo</h1>
          <p className="text-xs text-gray-500">About 10 minutes. Stop whenever your child has had enough.</p>
        </div>
      </div>

      <ol className="flex gap-2 mt-4" aria-label="Session steps">
        {plan.steps.map((candidate, index) => (
          <li
            key={candidate.kind}
            aria-current={!finished && index === stepIndex ? 'step' : undefined}
            className={`flex-1 text-center rounded-2xl py-2 text-sm font-black ${
              !finished && index === stepIndex ? 'bg-sky-500 text-white' : index < stepIndex || finished ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {STEP_TITLES[candidate.kind]}
          </li>
        ))}
      </ol>

      {finished ? (
        <section className="mt-10 text-center">
          <p className="text-7xl" aria-hidden="true">🌟</p>
          <h2 className="text-2xl font-black font-fun mt-2">Well done today!</h2>
          <button type="button" onClick={onExit} className="mt-6 min-h-[72px] px-8 rounded-3xl bg-amber-400 text-amber-950 font-black cursor-pointer">
            Back home
          </button>
        </section>
      ) : (
        <section className="mt-6 space-y-4">
          {step?.kind === 'revisit' && (
            <>
              <h2 className="text-xl font-black">{step.recap ? 'Quick recap' : 'Practise again'}</h2>
              <p className="text-sm text-gray-600">
                {step.recap ? 'Sounds and words from earlier. Say each one together.' : 'These needed help a few days ago. Try them again.'}
              </p>
              {step.itemIds.length === 0 ? (
                <p className="text-sm text-gray-500">Nothing to revisit yet. On to today’s sound.</p>
              ) : (
                step.itemIds.map(renderItem)
              )}
            </>
          )}

          {step?.kind === 'teach' && teachGpc && (
            <>
              <h2 className="text-xl font-black">Today’s sound</h2>
              {step.suggested && (
                <p className="text-sm text-gray-600">Suggested next sound. To choose a different one, use “Practise this sound” in the curriculum map.</p>
              )}
              <div className="rounded-4xl border-4 border-amber-300 bg-amber-50 p-6 text-center">
                <LetterOnLines graphemes={[teachGpc.grapheme, ...(teachGpc.alternativeGraphemes ?? [])]} className="h-36 mx-auto block" />
                <button
                  type="button"
                  onClick={() => playGpc(teachGpc.id)}
                  aria-label={`Hear the sound ${teachGpc.grapheme}`}
                  className="mt-4 min-h-[88px] px-8 rounded-4xl bg-amber-400 text-amber-950 font-black text-xl shadow-lg inline-flex items-center gap-3 cursor-pointer"
                >
                  <Volume2 className="w-8 h-8" /> Hear it
                </button>
                <p className="text-sm mt-4">Say the sound together three times, then look for it in the room.</p>
                <SoundPictures gpcId={teachGpc.id} />
              </div>
              <StatusButtons itemLabel={`the sound ${teachGpc.grapheme}`} current={status(teachGpc.id)} onMark={(next) => recordMark(teachGpc.id, next)} />
            </>
          )}

          {step?.kind === 'practise' && (
            <>
              <h2 className="text-xl font-black">Practise</h2>
              {step.words.length > 0 ? (
                <>
                  <p className="text-sm text-gray-600">Tap a word to hear it sound by sound. Blend it together.</p>
                  <div className="grid gap-3 grid-cols-2">
                    {step.words.map((word) => (
                      <button
                        key={word.segmented}
                        type="button"
                        onClick={() => play((isCurrent) => playWordSoundBySound(word.segmented, word.text, isCurrent, plan.teach.gpcId))}
                        aria-label={`Hear ${word.text} sound by sound`}
                        className="min-h-[88px] rounded-3xl border-2 border-amber-200 bg-white text-3xl cursor-pointer"
                      >
                        <GraphemeWord segmented={word.segmented} />
                      </button>
                    ))}
                  </div>
                  {step.blendItemId && (
                    <StatusButtons itemLabel="blending" current={status(step.blendItemId)} onMark={(next) => recordMark(step.blendItemId!, next)} />
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-600">No blending words fit the sounds introduced so far. Today’s listening game is the practice.</p>
              )}
              <button
                type="button"
                onClick={() => setPlayingGame(true)}
                className="w-full min-h-[88px] rounded-4xl bg-sky-500 text-white text-2xl font-black shadow-lg cursor-pointer"
              >
                Play {GAME_TITLES[step.gameId]}
              </button>
            </>
          )}

          {step?.kind === 'apply' && (
            <>
              <h2 className="text-xl font-black">Away from the screen</h2>
              <div className="rounded-4xl bg-emerald-50 border-4 border-emerald-200 p-6 text-lg font-bold text-emerald-950">{step.text}</div>
            </>
          )}
        </section>
      )}

      {!finished && (
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={() => setStepIndex((index) => Math.max(0, index - 1))}
            disabled={stepIndex === 0}
            className="min-h-[64px] px-6 rounded-3xl bg-white border-2 border-gray-200 font-black cursor-pointer disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => (stepIndex === plan.steps.length - 1 ? setFinished(true) : setStepIndex((index) => index + 1))}
            className="min-h-[64px] px-8 rounded-3xl bg-emerald-500 text-white font-black cursor-pointer"
          >
            {stepIndex === plan.steps.length - 1 ? 'Finish' : 'Next step'}
          </button>
        </div>
      )}
    </div>
  );
};
