import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MiloVideoCompanion, MiloVideoState } from '../common/MiloVideoCompanion';
import { triggerGentleConfetti } from '../common/ParticleEffects';
import { audioService } from '../../services/audioService';
import { progressService } from '../../services/progressService';
import { CURRICULUM_LEVELS, getLevelById } from '../../data/curriculumData';
import { getLetterById, getAllLetters } from '../../data/lettersData';
import { ChildProgress, PhonicsObject } from '../../types/phonics';
import {
  Home,
  Volume2,
  RotateCcw,
  Sparkles,
  Star,
  Sparkle,
} from 'lucide-react';

interface FeedMiloScreenProps {
  onGoHome: () => void;
}

interface FoodChoice {
  letterId: string;
  symbol: string;
  isTarget: boolean;
  object: PhonicsObject;
}

interface RoundData {
  targetLetterId: string;
  targetSymbol: string;
  targetPhonemeAudioId: string;
  choices: FoodChoice[];
}

export const FeedMiloScreen: React.FC<FeedMiloScreenProps> = ({ onGoHome }) => {
  const [progress, setProgress] = useState<ChildProgress>(progressService.getProgress());
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [roundData, setRoundData] = useState<RoundData | null>(null);
  const [miloState, setMiloState] = useState<MiloVideoState>('hungry');
  const [isAudioBusy, setIsAudioBusy] = useState<boolean>(false);
  const [fedItemId, setFedItemId] = useState<string | null>(null);
  const [wobblingItemId, setWobblingItemId] = useState<string | null>(null);
  const [isHintActive, setIsHintActive] = useState<boolean>(false);
  const [isSessionComplete, setIsSessionComplete] = useState<boolean>(false);
  const [sessionStarsEarned, setSessionStarsEarned] = useState<number>(0);
  const [isDragOverMilo, setIsDragOverMilo] = useState<boolean>(false);

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const advanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chewStartTimeRef = useRef<number>(0);
  const activeLevelId = progress.currentLevelId || 1;
  const activeLevel = getLevelById(activeLevelId) || CURRICULUM_LEVELS[0];

  // Subscribe to progress changes
  useEffect(() => {
    const unsub = progressService.subscribe((updated) => setProgress(updated));
    return unsub;
  }, []);

  // Generate round data for Feed Milo
  const generateRound = useCallback((roundIdx: number): RoundData => {
    const levelLetterIds = [...activeLevel.letterIds];
    const allLetters = getAllLetters();

    // Pick target letter
    const targetId = levelLetterIds[roundIdx % levelLetterIds.length];
    const targetLetter = getLetterById(targetId) || allLetters[0];
    const targetObject = targetLetter.objects[0] || {
      id: `${targetId}_item`,
      name: targetLetter.symbol,
      letterId: targetId,
      emoji: '🍎',
      spokenIntro: `/${targetId}/`,
      soundType: 'crunch',
      accentColor: '#EF4444',
      bgColor: '#FEF2F2',
      funReaction: 'Yummy!',
      wordAudioId: `word.${targetId}`,
      phraseAudioId: `phrase.${targetId}`,
    };

    // Distractors: strictly 1 for Level 1 (2 plates total), 2 for Levels 2+ (3 plates total)
    const isLevelOne = activeLevelId === 1;
    const distractorCount = isLevelOne ? 1 : 2;

    const availableDistractorIds = levelLetterIds.filter((id) => id !== targetId);
    if (availableDistractorIds.length < distractorCount) {
      allLetters.forEach((l) => {
        if (l.id !== targetId && !availableDistractorIds.includes(l.id)) {
          availableDistractorIds.push(l.id);
        }
      });
    }

    const shuffledDistractors = availableDistractorIds.sort(() => Math.random() - 0.5);
    const chosenDistractorIds = shuffledDistractors.slice(0, distractorCount);

    const choices: FoodChoice[] = [
      {
        letterId: targetLetter.id,
        symbol: targetLetter.symbol,
        isTarget: true,
        object: targetObject,
      },
      ...chosenDistractorIds.map((dId) => {
        const dLetter = getLetterById(dId) || allLetters[0];
        const dObject = dLetter.objects[0] || {
          id: `${dId}_item`,
          name: dLetter.symbol,
          letterId: dId,
          emoji: '☀️',
          spokenIntro: `/${dId}/`,
          soundType: 'pop',
          accentColor: '#F59E0B',
          bgColor: '#FFFBEB',
          funReaction: 'Bright!',
          wordAudioId: `word.${dId}`,
          phraseAudioId: `phrase.${dId}`,
        };
        return {
          letterId: dLetter.id,
          symbol: dLetter.symbol,
          isTarget: false,
          object: dObject,
        };
      }),
    ].sort(() => Math.random() - 0.5);

    return {
      targetLetterId: targetLetter.id,
      targetSymbol: targetLetter.symbol,
      targetPhonemeAudioId: targetLetter.phonemeAudioId,
      choices,
    };
  }, [activeLevel, activeLevelId]);

  // Reset inactivity timer (6s)
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    setIsHintActive(false);
    inactivityTimerRef.current = setTimeout(() => {
      setIsHintActive(true);
    }, 6000);
  }, []);

  // Play target phoneme sound
  const playTargetSound = useCallback((phonemeAudioId: string) => {
    setIsAudioBusy(true);
    setMiloState('hungry');
    audioService.playVoice(phonemeAudioId, { interrupt: true });
    setTimeout(() => {
      setIsAudioBusy(false);
    }, 1100);
  }, []);

  // Advance to next round or finish session
  const advanceRound = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    if (currentRound < 4) {
      setCurrentRound((prev) => prev + 1);
    } else {
      // Micro-session complete! (5 rounds done)
      setIsSessionComplete(true);
      setMiloState('full');
      audioService.playFanfare();
      triggerGentleConfetti();
    }
  }, [currentRound]);

  // Setup round
  useEffect(() => {
    if (isSessionComplete) return;

    const newRound = generateRound(currentRound);
    setRoundData(newRound);
    setFedItemId(null);
    setWobblingItemId(null);
    setMiloState('hungry');

    const introTimer = setTimeout(() => {
      playTargetSound(newRound.targetPhonemeAudioId);
      resetInactivityTimer();
    }, 450);

    return () => {
      clearTimeout(introTimer);
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [currentRound, generateRound, isSessionComplete, playTargetSound, resetInactivityTimer]);

  // Handle replaying target sound
  const handleReplay = useCallback(() => {
    if (isAudioBusy || !roundData) return;
    audioService.playPop();
    playTargetSound(roundData.targetPhonemeAudioId);
    resetInactivityTimer();
  }, [isAudioBusy, roundData, playTargetSound, resetInactivityTimer]);

  // Handle tap on Milo (or Yum button) during chewing for instant skip
  const handleMiloTap = useCallback(() => {
    if (miloState === 'chewing') {
      // If child taps Milo after 1.4s (once Oxford phoneme finishes), advance immediately!
      if (Date.now() - chewStartTimeRef.current >= 1400) {
        audioService.playPop();
        advanceRound();
        return;
      }
    }
    handleReplay();
  }, [miloState, advanceRound, handleReplay]);

  // Handle feeding item (via tap or drop)
  const handleFeed = (choice: FoodChoice) => {
    if (isAudioBusy || fedItemId) return;
    resetInactivityTimer();

    if (choice.isTarget) {
      // 🌟 Correct Food: Milo munches happily!
      setFedItemId(choice.object.id);
      setMiloState('chewing');
      chewStartTimeRef.current = Date.now();
      audioService.playPop();

      // Sound effect matching food (crunch / bite / slurp)
      setTimeout(() => {
        if (choice.object.soundType === 'slurp') {
          audioService.playSfx('slurp');
        } else {
          audioService.playSfx('crunch');
        }
      }, 150);

      // Visual reward: confetti & star increment
      triggerGentleConfetti();
      setSessionStarsEarned((prev) => prev + 1);
      progressService.awardStars(choice.letterId, 1);

      // Reiterate target phoneme in triumph
      setTimeout(() => {
        audioService.playVoice(roundData ? roundData.targetPhonemeAudioId : `phoneme.${choice.letterId}`, { interrupt: true });
        audioService.playChime();
      }, 500);

      // Extended chew window: 3.8 seconds unhurried appreciation
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = setTimeout(() => {
        advanceRound();
      }, 3800);
    } else {
      // 〰️ Wrong Food: Gentle "Hmm" (Zero-Shame design)
      setWobblingItemId(choice.object.id);
      setMiloState('curious');
      audioService.playBoing();

      // Softly whisper tapped item's sound for contrast
      setTimeout(() => {
        audioService.playVoice(`phoneme.${choice.letterId}`, { interrupt: true });
      }, 200);

      // Re-prompt target sound after 1.4s
      setTimeout(() => {
        setWobblingItemId(null);
        setMiloState('hungry');
        if (roundData) {
          playTargetSound(roundData.targetPhonemeAudioId);
        }
      }, 1400);
    }
  };

  // Play session again
  const handlePlayAgain = () => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    audioService.playPop();
    setIsSessionComplete(false);
    setCurrentRound(0);
    setSessionStarsEarned(0);
    setMiloState('hungry');
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-between p-2.5 sm:p-4 max-w-4xl mx-auto relative z-10 select-none overflow-hidden font-fun">
      {/* 1. Header Bar: Home, 5-Round Dots, Star Bank */}
      <header className="flex justify-between items-center w-full gap-2 pt-1 pb-1 shrink-0">
        <button
          onClick={() => {
            audioService.playPop();
            onGoHome();
          }}
          aria-label="Go Home"
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white shadow-[0_4px_0_#FDE68A] border-3 border-amber-200 flex items-center justify-center text-amber-700 squish-tap shrink-0 cursor-pointer hover:scale-105 active:scale-95"
        >
          <Home className="w-7 h-7 sm:w-8 sm:h-8" />
        </button>

        {/* Round Progress Indicator (5 Dots) */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-2.5 rounded-full border-3 border-amber-200 shadow-[0_4px_0_#FDE68A]">
          <span className="text-sm font-black text-amber-950 mr-1 hidden sm:inline">Round</span>
          {[0, 1, 2, 3, 4].map((dotIdx) => {
            const isCompleted = dotIdx < currentRound;
            const isCurrent = dotIdx === currentRound;
            return (
              <div
                key={dotIdx}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500 scale-110 shadow-xs'
                    : isCurrent
                    ? 'bg-amber-400 ring-4 ring-amber-200 animate-pulse scale-125'
                    : 'bg-gray-200'
                }`}
              />
            );
          })}
        </div>

        {/* Star Bank Counter */}
        <div className="flex items-center gap-1.5 bg-white/95 px-4 py-2.5 rounded-full border-3 border-amber-200 shadow-[0_4px_0_#FDE68A] shrink-0 font-black text-sm text-amber-700">
          <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
          <span>{progress.totalStars + sessionStarsEarned}</span>
        </div>
      </header>

      {/* 2. Main Game Arena */}
      {!isSessionComplete ? (
        <main className="flex-1 flex flex-col items-center justify-around my-auto min-h-0 w-full px-2">
          {/* Milo Video Companion Arena & Target Prompt */}
          <div
            className="flex flex-col items-center shrink-0"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOverMilo(true);
            }}
            onDragLeave={() => setIsDragOverMilo(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOverMilo(false);
              const dataStr = e.dataTransfer.getData('text/plain');
              if (dataStr && roundData) {
                const choice = roundData.choices.find((c) => c.object.id === dataStr);
                if (choice) handleFeed(choice);
              }
            }}
          >
            <MiloVideoCompanion
              state={miloState}
              size="lg"
              isListening={isAudioBusy}
              isTargetOver={isDragOverMilo}
              onTap={handleMiloTap}
              className="transition-transform"
            />

            {/* Chunky Replay Sound / Yum Button */}
            <button
              onClick={miloState === 'chewing' ? handleMiloTap : handleReplay}
              disabled={isAudioBusy}
              aria-label={miloState === 'chewing' ? 'Feed next sound' : 'Listen to sound again'}
              className={`mt-2 squish-tap w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-b from-amber-300 to-amber-400 text-amber-950 border-4 border-amber-200 shadow-[0_6px_0_#D97706] active:translate-y-1 active:shadow-[0_2px_0_#D97706] flex flex-col items-center justify-center cursor-pointer transition-all ${
                isAudioBusy
                  ? 'opacity-60 ring-6 ring-amber-300 scale-105'
                  : miloState === 'chewing'
                  ? 'ring-6 ring-amber-400 scale-105 animate-bounce-gentle'
                  : 'hover:scale-105 animate-bounce-gentle'
              }`}
            >
              {miloState === 'chewing' ? (
                <>
                  <span className="text-2xl animate-bounce">😋</span>
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider mt-0.5">
                    Yum!
                  </span>
                </>
              ) : (
                <>
                  <Volume2 className="w-8 h-8 sm:w-9 sm:h-9" />
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider mt-0.5">
                    {isAudioBusy ? 'Listening...' : 'Hear Sound'}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Floating Food Plates Stage */}
          <div className="w-full flex items-center justify-center gap-4 sm:gap-8 my-auto py-2">
            {roundData?.choices.map((choice) => {
              const isFed = fedItemId === choice.object.id;
              const isWobbling = wobblingItemId === choice.object.id;
              const isHinted = isHintActive && choice.isTarget;

              return (
                <div key={choice.object.id} className="relative flex flex-col items-center justify-center">
                  {/* Food Plate Button (Supports Tap and HTML5 Drag) */}
                  <button
                    onClick={() => handleFeed(choice)}
                    draggable={!isAudioBusy && !fedItemId}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', choice.object.id);
                    }}
                    disabled={isAudioBusy || !!fedItemId}
                    aria-label={`Feed ${choice.object.name}`}
                    className={`squish-tap relative w-28 h-28 sm:w-36 sm:h-36 rounded-4xl bg-white flex flex-col items-center justify-center cursor-pointer transition-all duration-300 select-none ${
                      isFed
                        ? 'scale-130 opacity-0 -translate-y-16 transition-all duration-500 pointer-events-none'
                        : isWobbling
                        ? 'animate-wiggle scale-95 ring-6 ring-rose-300'
                        : isHinted
                        ? 'ring-8 ring-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.7)] animate-bounce-gentle scale-110'
                        : 'hover:scale-106 active:scale-95 shadow-[0_8px_0_#FDE68A] border-4 border-amber-200'
                    }`}
                  >
                    {/* Giant Food Emoji / Icon */}
                    <span className="text-5xl sm:text-6xl drop-shadow-sm transition-transform hover:scale-110">
                      {choice.object.emoji}
                    </span>

                    {/* Food Object Name Label */}
                    <span className="text-xs sm:text-sm font-black text-amber-950 mt-1 capitalize tracking-wide">
                      {choice.object.name}
                    </span>

                    {/* Visual Sound Dot (Single Grapheme Sound Button) */}
                    <div className="mt-0.5 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                      <span className="text-[10px] font-extrabold text-amber-700 uppercase">
                        /{choice.letterId}/
                      </span>
                    </div>
                  </button>

                  {/* Sparkle Particle Spray on Correct Feed */}
                  {isFed && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center animate-pop-in">
                      <Sparkles className="w-16 h-16 text-amber-400 animate-wiggle" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Guidance */}
          <footer className="text-center py-1 shrink-0">
            <p className="text-amber-900/60 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5">
              <span>Drag or tap the food that begins with the sound!</span>
              <Sparkle className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            </p>
          </footer>
        </main>
      ) : (
        /* 3. Session Complete Celebration Card */
        <main className="flex-1 flex flex-col items-center justify-center my-auto min-h-0 w-full px-4 animate-pop-in">
          <div className="bg-white rounded-4xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border-4 border-amber-300 text-center flex flex-col items-center">
            {/* Celebratory Milo with Full Tummy */}
            <div className="relative mb-2">
              <span className="text-6xl animate-bounce">👨‍🍳</span>
              <MiloVideoCompanion state="full" size="md" className="mt-1" />
            </div>

            <h3 className="text-3xl font-black font-fun text-gray-900 mb-1">
              Tummy is Full! 🦁✨
            </h3>
            <p className="text-sm font-bold text-amber-800 mb-4">
              You fed Milo all 5 yummy sounds!
            </p>

            {/* Stars Earned Callout */}
            <div className="flex items-center justify-center gap-2 bg-amber-50 px-5 py-2.5 rounded-2xl border-2 border-amber-200 mb-6">
              <Star className="w-7 h-7 fill-amber-400 text-amber-500 animate-wiggle" />
              <span className="text-2xl font-black text-amber-900">
                +{sessionStarsEarned} Stars!
              </span>
            </div>

            {/* Action Buttons: Feed Again & Go Home */}
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handlePlayAgain}
                aria-label="Feed Milo Again"
                className="squish-tap w-full h-16 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xl flex items-center justify-center gap-2 border-4 border-emerald-300 shadow-[0_6px_0_#065F46] active:translate-y-1 active:shadow-[0_2px_0_#065F46] cursor-pointer"
              >
                <RotateCcw className="w-6 h-6 stroke-[3]" />
                <span>Feed Again!</span>
              </button>

              <button
                onClick={() => {
                  audioService.playPop();
                  onGoHome();
                }}
                aria-label="Return to Home Screen"
                className="squish-tap w-full h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-base flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Home className="w-5 h-5" />
                <span>Go Home</span>
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};
