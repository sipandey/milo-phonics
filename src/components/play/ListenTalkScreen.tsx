import React, { useState } from 'react';
import { Home, Volume2 } from 'lucide-react';
import { audioService } from '../../services/audioService';

interface ListenTalkScreenProps {
  onGoHome: () => void;
}

const FAMILIAR_WORDS = [
  { id: 'apple', name: 'Apple', emoji: '🍎', audioId: 'word.apple', color: '#FEE2E2' },
  { id: 'cat', name: 'Cat', emoji: '🐱', audioId: 'word.c-cat', color: '#FEF3C7' },
  { id: 'dog', name: 'Dog', emoji: '🐶', audioId: 'word.d-dog', color: '#DCFCE7' },
  { id: 'moon', name: 'Moon', emoji: '🌙', audioId: 'word.moon', color: '#EEF2FF' },
  { id: 'milk', name: 'Milk', emoji: '🥛', audioId: 'word.milk', color: '#E0F2FE' },
  { id: 'sun', name: 'Sun', emoji: '☀️', audioId: 'word.sun', color: '#FEF3C7' },
];

const getChoicesForTarget = (targetIndex: number) => {
  const target = FAMILIAR_WORDS[targetIndex];
  const distractors = FAMILIAR_WORDS.filter((word) => word.id !== target.id);
  for (let index = distractors.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [distractors[index], distractors[swapIndex]] = [distractors[swapIndex], distractors[index]];
  }

  const choices = [target, ...distractors.slice(0, 2)];
  for (let index = choices.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [choices[index], choices[swapIndex]] = [choices[swapIndex], choices[index]];
  }
  return choices;
};

export const ListenTalkScreen: React.FC<ListenTalkScreenProps> = ({ onGoHome }) => {
  const [playingWordId, setPlayingWordId] = useState<string | null>(null);
  const [activity, setActivity] = useState<'explore' | 'find'>('explore');
  const [targetIndex, setTargetIndex] = useState(0);
  const [choices, setChoices] = useState(() => getChoicesForTarget(0));
  const [feedback, setFeedback] = useState<string>('');

  const playTarget = () => {
    const target = FAMILIAR_WORDS[targetIndex];
    void handleHearWord(target.id, target.audioId);
  };

  const handleFindWord = (wordId: string) => {
    if (wordId === FAMILIAR_WORDS[targetIndex].id) {
      setFeedback(`You found ${FAMILIAR_WORDS[targetIndex].name}! Have another listen, or find the next picture.`);
    } else {
      setFeedback('That is all right. Let us listen again, or ask your grown-up for a hint.');
    }
  };

  const handleHearWord = async (wordId: string, audioId: string) => {
    if (playingWordId) return;
    setPlayingWordId(wordId);
    try {
      await audioService.playVoice(audioId, { interrupt: true });
    } finally {
      setPlayingWordId(null);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] max-w-4xl mx-auto p-4 sm:p-6 flex flex-col relative z-10">
      <header className="flex items-center justify-between gap-3 mb-4">
        <button
          onClick={() => {
            audioService.playPop();
            onGoHome();
          }}
          aria-label="Go Home"
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white shadow-md border-3 border-amber-200 flex items-center justify-center text-amber-700 squish-tap"
        >
          <Home className="w-7 h-7" />
        </button>
        <div className="text-center">
          <h1 className="text-2xl sm:text-4xl font-black text-amber-950">Listen &amp; Talk</h1>
          <p className="text-sm font-bold text-amber-800">Choose a familiar picture and listen together</p>
        </div>
        <div className="w-14 sm:w-16" aria-hidden="true" />
      </header>

      <nav aria-label="Listening activity" className="flex justify-center gap-2 mb-4">
        <button type="button" onClick={() => { setActivity('explore'); setFeedback(''); }} aria-pressed={activity === 'explore'} className={`rounded-full px-5 py-3 font-black ${activity === 'explore' ? 'bg-amber-500 text-white' : 'bg-white text-amber-900'}`}>Explore pictures</button>
        <button type="button" onClick={() => { setActivity('find'); setFeedback(''); }} aria-pressed={activity === 'find'} className={`rounded-full px-5 py-3 font-black ${activity === 'find' ? 'bg-amber-500 text-white' : 'bg-white text-amber-900'}`}>Listen and find</button>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center gap-4">
        {activity === 'find' && (
          <section className="w-full max-w-xl text-center bg-white/90 rounded-3xl p-4 shadow-md" aria-label="Listen and find a picture">
            <p className="font-black text-amber-950 text-lg">Listen to the word, then find its picture.</p>
            <button type="button" onClick={playTarget} className="mt-2 min-h-14 px-6 rounded-2xl bg-sky-100 text-sky-950 font-black border-2 border-sky-300">Hear it again 🔊</button>
            <details className="mt-2 text-left">
              <summary className="text-sm font-bold text-amber-800 cursor-pointer">Grown-up hint</summary>
              <p className="mt-1 text-sm text-amber-800">A hint is help, not a test. Follow the child’s interest and do not require a spoken answer.</p>
            </details>
          </section>
        )}
        <div className={`grid w-full ${activity === 'find' ? 'grid-cols-3 gap-2' : 'grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4'}`}>
          {(activity === 'find' ? choices : FAMILIAR_WORDS).map((word) => {
            const isPlaying = playingWordId === word.id;
            return (
              <button
                key={word.id}
                type="button"
                aria-label={activity === 'find' ? `Choose ${word.name}` : `Hear ${word.name}`}
                aria-pressed={isPlaying}
                onClick={() => activity === 'find' ? handleFindWord(word.id) : void handleHearWord(word.id, word.audioId)}
                className={`${activity === 'find' ? 'min-h-28 sm:min-h-36' : 'min-h-36 sm:min-h-44'} rounded-3xl border-4 border-white shadow-[0_6px_0_rgba(146,64,14,0.18)] flex flex-col items-center justify-center gap-2 squish-tap transition-transform ${isPlaying ? 'scale-95 ring-4 ring-amber-400' : 'hover:scale-[1.02]'}`}
                style={{ backgroundColor: word.color }}
              >
                <span className={activity === 'find' ? 'text-5xl sm:text-6xl' : 'text-6xl sm:text-7xl'} aria-hidden="true">{word.emoji}</span>
                {activity === 'explore' && <Volume2 className={`w-7 h-7 text-amber-800 ${isPlaying ? 'animate-pulse' : ''}`} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
        {activity === 'find' && <p role="status" aria-live="polite" className="min-h-6 text-center font-bold text-amber-900">{feedback}</p>}
        {activity === 'find' && feedback.startsWith('You found') && (
          <div className="flex gap-3">
            <button type="button" onClick={playTarget} className="min-h-14 px-6 rounded-2xl bg-white text-amber-900 font-black border-2 border-amber-200">Hear again</button>
            <button type="button" onClick={() => { const nextIndex = (targetIndex + 1) % FAMILIAR_WORDS.length; setTargetIndex(nextIndex); setChoices(getChoicesForTarget(nextIndex)); setFeedback(''); }} className="min-h-14 px-6 rounded-2xl bg-bubble-yellow text-amber-950 font-black border-2 border-amber-300">Next sound</button>
          </div>
        )}
      </main>

      <details className="text-center text-xs sm:text-sm text-amber-900 py-2">
        <summary className="cursor-pointer font-bold underline decoration-dotted">Grown-up idea</summary>
        <p className="mt-2">Find another thing nearby that sounds like “sun” or “sock”. Pause and follow your child’s interest; use any language you speak at home.</p>
      </details>
    </div>
  );
};
