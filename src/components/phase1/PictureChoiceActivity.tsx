import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Volume2 } from 'lucide-react';
import {
  buildBlendingRounds,
  buildFirstSoundRounds,
  buildOddOneOutRounds,
  choicePlayback,
  createRandom,
  type PictureChoice,
  type PictureRound,
} from '../../curriculum/phaseOneActivities';
import { useTeachingProgress } from '../../hooks/useTeachingProgress';
import { audioService } from '../../services/audioService';
import { DEFAULT_CHILD_ID, getItemState } from '../../services/teachingProgress';
import { StatusButtons, playSymbols, recordMark } from '../curriculum/teachingUi';

export type PictureChoiceActivityId = 'robot-blending' | 'first-sounds' | 'odd-one-out';

const ROUNDS = 5;

const ACTIVITIES: Record<PictureChoiceActivityId, {
  readonly title: string;
  readonly aspectId: string;
  readonly adultHint: string;
  readonly build: (count: number, random: () => number, focusGpcId?: string) => PictureRound[];
  readonly soundGapMs: number;
  /** Tapping a picture plays its first sound, then the word. */
  readonly playsSoundThenWord: boolean;
}> = {
  'robot-blending': {
    title: 'Robot Milo',
    aspectId: 'p1.oral-blending',
    adultHint: 'Milo says the sounds like a robot. Say them together, then find the picture.',
    build: buildBlendingRounds,
    soundGapMs: 450,
    playsSoundThenWord: true,
  },
  'first-sounds': {
    title: 'First sounds',
    aspectId: 'p1.alliteration',
    adultHint: 'Milo wants something that starts with this sound. Say the sound together and try each picture.',
    build: buildFirstSoundRounds,
    soundGapMs: 300,
    playsSoundThenWord: true,
  },
  'odd-one-out': {
    title: 'Odd one out',
    aspectId: 'p1.rhythm-rhyme',
    adultHint: 'Two words rhyme. Which one does not? Say all three together.',
    build: (count, random) => buildOddOneOutRounds(count, random),
    soundGapMs: 300,
    playsSoundThenWord: false,
  },
};

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Play a picture's first sound, then its word, stopping if another tap starts. */
async function playSoundThenWord(choice: PictureChoice, roundSound: readonly string[] | undefined, isCurrent: () => boolean): Promise<void> {
  for (const step of choicePlayback(choice, roundSound)) {
    if (!isCurrent()) return;
    if (step.kind === 'sound') {
      await playSymbols(step.symbols, isCurrent);
      await pause(250);
    } else if (step.kind === 'word') {
      await audioService.playVoice(step.audioId, { interrupt: true });
    } else {
      await audioService.playCvcWord(step.word);
    }
  }
}

interface PictureChoiceActivityProps {
  readonly activityId: PictureChoiceActivityId;
  readonly onExit: () => void;
  /** Where the back and finish buttons go, e.g. "curriculum map" or "today's session". */
  readonly exitTo?: string;
  /** Practise this sound in every round (e.g. the sound taught in today's session). */
  readonly focusGpcId?: string;
}

export const PictureChoiceActivity: React.FC<PictureChoiceActivityProps> = ({ activityId, onExit, exitTo = 'curriculum map', focusGpcId }) => {
  const config = ACTIVITIES[activityId];
  const doc = useTeachingProgress();
  const [rounds, setRounds] = useState(() => config.build(ROUNDS, createRandom(Date.now()), focusGpcId));
  const [index, setIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const tokenRef = useRef(0);
  const round = rounds[index];
  const done = index >= rounds.length;

  const playPrompt = useCallback(async () => {
    if (!round) return;
    tokenRef.current += 1;
    const token = tokenRef.current;
    const isCurrent = () => tokenRef.current === token;
    for (const symbol of round.promptSymbols) {
      if (!isCurrent()) return;
      await playSymbols([symbol], isCurrent);
      await pause(config.soundGapMs);
    }
    for (const word of round.promptWords) {
      if (!isCurrent()) return;
      setHighlightId(word);
      await audioService.playCvcWord(word);
      await pause(400);
    }
    if (isCurrent()) setHighlightId(null);
  }, [round, config.soundGapMs]);

  useEffect(() => {
    void playPrompt();
    return () => {
      tokenRef.current += 1;
    };
  }, [playPrompt]);

  const choose = async (choice: PictureChoice) => {
    if (!round || solved) return;
    tokenRef.current += 1;
    const token = tokenRef.current;
    const isCurrent = () => tokenRef.current === token;
    setHighlightId(null);
    const correct = choice.id === round.correctId;
    if (correct) {
      setSolved(true);
      setWrongId(null);
    } else {
      setWrongId(choice.id);
    }
    if (config.playsSoundThenWord) {
      await playSoundThenWord(choice, round.choiceSound, isCurrent);
      if (correct && isCurrent()) audioService.playChime();
    } else if (correct) {
      audioService.playChime();
    } else {
      audioService.playBoing();
    }
  };

  const next = () => {
    setSolved(false);
    setWrongId(null);
    setIndex((current) => current + 1);
  };

  const restart = () => {
    setRounds(config.build(ROUNDS, createRandom(Date.now()), focusGpcId));
    setIndex(0);
    setSolved(false);
    setWrongId(null);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-3xl mx-auto flex flex-col">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          aria-label={`Back to ${exitTo}`}
          className="min-h-[56px] min-w-[56px] rounded-2xl bg-white border-2 border-gray-200 flex items-center justify-center cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-black font-fun text-gray-800">{config.title}</h1>
        {!done && (
          <span className="ml-auto text-sm font-bold text-gray-500" aria-label={`Round ${index + 1} of ${rounds.length}`}>
            {index + 1} / {rounds.length}
          </span>
        )}
      </div>

      {!done && round && (
        <>
          <p className="text-xs text-gray-500 mt-2">{config.adultHint}</p>
          <div className="flex justify-center my-6">
            <button
              type="button"
              onClick={() => void playPrompt()}
              aria-label="Hear it again"
              className="min-h-[88px] min-w-[88px] px-8 rounded-4xl bg-amber-400 text-amber-950 font-black text-xl shadow-lg inline-flex items-center gap-3 cursor-pointer active:scale-95 transition-transform"
            >
              <span className="text-4xl" aria-hidden="true">{activityId === 'robot-blending' ? '🤖' : '🦁'}</span>
              <Volume2 className="w-8 h-8" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-5">
            {round.choices.map((choice) => {
              const isAnswer = solved && choice.id === round.correctId;
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => void choose(choice)}
                  aria-label={`Picture: ${choice.label}`}
                  className={`aspect-square min-h-[96px] rounded-4xl border-4 bg-white text-6xl sm:text-7xl flex items-center justify-center cursor-pointer transition-transform active:scale-95 ${
                    isAnswer ? 'border-emerald-400 ring-8 ring-emerald-200' : highlightId === choice.id ? 'border-amber-400 ring-4 ring-amber-200' : 'border-amber-100'
                  } ${wrongId === choice.id ? 'animate-wiggle' : ''} ${solved && !isAnswer ? 'opacity-40' : ''}`}
                >
                  <span aria-hidden="true">{choice.emoji}</span>
                </button>
              );
            })}
          </div>
          {solved && (
            <div className="flex justify-center mt-6">
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
            <p className="text-sm font-bold mb-2">For you: how did it go?</p>
            <StatusButtons
              itemLabel={config.title}
              current={getItemState(doc, DEFAULT_CHILD_ID, config.aspectId)?.status ?? null}
              onMark={(status) => recordMark(config.aspectId, status)}
            />
          </div>
          <div className="flex justify-center gap-3 mt-6">
            <button type="button" onClick={restart} className="min-h-[72px] px-6 rounded-3xl bg-amber-400 text-amber-950 font-black cursor-pointer">
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
