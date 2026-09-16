import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CharacterMilo } from '../common/CharacterMilo';
import { triggerGentleConfetti } from '../common/ParticleEffects';
import { audioService } from '../../services/audioService';
import { progressService } from '../../services/progressService';
import { CURRICULUM_LEVELS, getLevelById } from '../../data/curriculumData';
import { getLetterById, getAllLetters } from '../../data/lettersData';
import { ChildProgress, LetterData } from '../../types/phonics';
import {
  Home,
  Volume2,
  RotateCcw,
  Sparkles,
  Star,
  Sparkle,
} from 'lucide-react';

interface BubblePopScreenProps {
  onGoHome: () => void;
}

interface BubbleChoice {
  letterId: string;
  symbol: string;
  isTarget: boolean;
  colorTheme: LetterData['colorTheme'];
}

interface RoundData {
  targetLetterId: string;
  targetSymbol: string;
  targetPhonemeAudioId: string;
  choices: BubbleChoice[];
}

export const BubblePopScreen: React.FC<BubblePopScreenProps> = ({ onGoHome }) => {
  const [progress, setProgress] = useState<ChildProgress>(progressService.getProgress());
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [roundData, setRoundData] = useState<RoundData | null>(null);
  const [isAudioBusy, setIsAudioBusy] = useState<boolean>(false);
  const [poppedLetterId, setPoppedLetterId] = useState<string | null>(null);
  const [wobblingLetterId, setWobblingLetterId] = useState<string | null>(null);
  const [isHintActive, setIsHintActive] = useState<boolean>(false);
  const [isSessionComplete, setIsSessionComplete] = useState<boolean>(false);
  const [sessionStarsEarned, setSessionStarsEarned] = useState<number>(0);

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeLevelId = progress.currentLevelId || 1;
  const activeLevel = getLevelById(activeLevelId) || CURRICULUM_LEVELS[0];

  // Subscribe to progress changes
  useEffect(() => {
    const unsub = progressService.subscribe((updated) => setProgress(updated));
    return unsub;
  }, []);

  // Generate round data
  const generateRound = useCallback((roundIdx: number): RoundData => {
    const levelLetterIds = [...activeLevel.letterIds];
    
    const allLetters = getAllLetters();

    // Pick target letter (round-robin across level letters with wrap-around)
    const targetId = levelLetterIds[roundIdx % levelLetterIds.length];
    const targetLetter = getLetterById(targetId) || allLetters[0];

    // Distractors: For Level 1, strictly 1 distractor (2 bubbles total)
    // For higher levels, 2 distractors (3 bubbles total)
    const isLevelOne = activeLevelId === 1;
    const distractorCount = isLevelOne ? 1 : 2;

    const availableDistractorIds = levelLetterIds.filter((id) => id !== targetId);
    // If not enough distractors in level, pull from global letters
    if (availableDistractorIds.length < distractorCount) {
      allLetters.forEach((l) => {
        if (l.id !== targetId && !availableDistractorIds.includes(l.id)) {
          availableDistractorIds.push(l.id);
        }
      });
    }

    // Shuffle and slice distractors
    const shuffledDistractors = availableDistractorIds.sort(() => Math.random() - 0.5);
    const chosenDistractorIds = shuffledDistractors.slice(0, distractorCount);

    const choices: BubbleChoice[] = [
      {
        letterId: targetLetter.id,
        symbol: targetLetter.symbol,
        isTarget: true,
        colorTheme: targetLetter.colorTheme,
      },
      ...chosenDistractorIds.map((dId) => {
        const dLetter = getLetterById(dId) || allLetters[0];
        return {
          letterId: dLetter.id,
          symbol: dLetter.symbol,
          isTarget: false,
          colorTheme: dLetter.colorTheme,
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

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    setIsHintActive(false);
    inactivityTimerRef.current = setTimeout(() => {
      setIsHintActive(true);
    }, 6000);
  }, []);

  // Play target sound
  const playTargetSound = useCallback((phonemeAudioId: string) => {
    setIsAudioBusy(true);
    audioService.playVoice(phonemeAudioId, { interrupt: true });
    // Sound length is ~800-1100ms
    setTimeout(() => {
      setIsAudioBusy(false);
    }, 1100);
  }, []);

  // Setup round
  useEffect(() => {
    if (isSessionComplete) return;

    const newRound = generateRound(currentRound);
    setRoundData(newRound);
    setPoppedLetterId(null);
    setWobblingLetterId(null);

    // Play target sound after short stage transition
    const introTimer = setTimeout(() => {
      playTargetSound(newRound.targetPhonemeAudioId);
      resetInactivityTimer();
    }, 450);

    return () => {
      clearTimeout(introTimer);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [currentRound, generateRound, isSessionComplete, playTargetSound, resetInactivityTimer]);

  // Handle replaying sound manually
  const handleReplay = () => {
    if (isAudioBusy || !roundData) return;
    audioService.playPop();
    playTargetSound(roundData.targetPhonemeAudioId);
    resetInactivityTimer();
  };

  // Handle bubble tap
  const handleBubbleTap = (choice: BubbleChoice) => {
    if (isAudioBusy || poppedLetterId) return;
    resetInactivityTimer();

    if (choice.isTarget) {
      // 🌟 Correct Tap: POP!
      setPoppedLetterId(choice.letterId);
      audioService.playPop();

      // Immediate visual & acoustic celebration
      triggerGentleConfetti();
      setSessionStarsEarned((prev) => prev + 1);

      // Award star in progress service
      progressService.awardStars(choice.letterId, 1);

      // Repeat target sound in triumph after pop
      setTimeout(() => {
        audioService.playVoice(choice.letterId ? `phoneme_${choice.letterId}` : '', { interrupt: true });
        audioService.playChime();
      }, 250);

      // Advance after celebrating
      setTimeout(() => {
        if (currentRound < 4) {
          setCurrentRound((prev) => prev + 1);
        } else {
          // Micro-session complete! (5 rounds done)
          setIsSessionComplete(true);
          audioService.playFanfare();
          triggerGentleConfetti();
        }
      }, 1000);
    } else {
      // 〰️ Incorrect Tap: Gentle cartoon wobble (No-Shame design)
      setWobblingLetterId(choice.letterId);
      audioService.playBoing();

      // Softly whisper tapped letter's sound for acoustic comparison
      setTimeout(() => {
        audioService.playVoice(`phoneme_${choice.letterId}`, { interrupt: true });
      }, 150);

      // Clear wobble and gently re-prompt target after 1.2s
      setTimeout(() => {
        setWobblingLetterId(null);
        if (roundData) {
          playTargetSound(roundData.targetPhonemeAudioId);
        }
      }, 1200);
    }
  };

  // Play session again
  const handlePlayAgain = () => {
    audioService.playPop();
    setIsSessionComplete(false);
    setCurrentRound(0);
    setSessionStarsEarned(0);
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-between p-2.5 sm:p-4 max-w-4xl mx-auto relative z-10 select-none overflow-hidden font-fun">
      {/* 1. Header Bar: Home, Round Counter (5 dots), Star Bank */}
      <header className="flex justify-between items-center w-full gap-2 pt-1 pb-1 shrink-0">
        {/* Chunky Home Button */}
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
          {/* Milo Companion in Listening Pose */}
          <div className="flex flex-col items-center shrink-0">
            <CharacterMilo
              size="md"
              isListening={isAudioBusy}
              onTap={handleReplay}
              className="transition-transform"
            />

            {/* Chunky Replay Sound Button (80x80px squircle) */}
            <button
              onClick={handleReplay}
              disabled={isAudioBusy}
              aria-label="Listen to sound again"
              className={`mt-2 squish-tap w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-gradient-to-b from-amber-300 to-amber-400 text-amber-950 border-4 border-amber-200 shadow-[0_6px_0_#D97706] active:translate-y-1 active:shadow-[0_2px_0_#D97706] flex flex-col items-center justify-center cursor-pointer transition-all ${
                isAudioBusy
                  ? 'opacity-60 ring-6 ring-amber-300 scale-105'
                  : 'hover:scale-105 animate-bounce-gentle'
              }`}
            >
              <Volume2 className="w-8 h-8 sm:w-9 sm:h-9" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider mt-0.5">
                {isAudioBusy ? 'Listening...' : 'Hear Again'}
              </span>
            </button>
          </div>

          {/* Floating Bubble Stage */}
          <div className="w-full flex items-center justify-center gap-4 sm:gap-8 my-auto py-2">
            {roundData?.choices.map((choice) => {
              const isPopped = poppedLetterId === choice.letterId;
              const isWobbling = wobblingLetterId === choice.letterId;
              const isHinted = isHintActive && choice.isTarget;

              return (
                <div key={choice.letterId} className="relative flex items-center justify-center">
                  {/* Floating Bubble Button */}
                  <button
                    onClick={() => handleBubbleTap(choice)}
                    disabled={isAudioBusy || !!poppedLetterId}
                    aria-label={`Bubble letter ${choice.symbol}`}
                    className={`squish-tap relative w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 select-none ${
                      isPopped
                        ? 'scale-150 opacity-0 pointer-events-none transition-all duration-500'
                        : isWobbling
                        ? 'animate-wiggle scale-95 ring-6 ring-rose-300'
                        : isHinted
                        ? 'ring-8 ring-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.7)] animate-bounce-gentle scale-110'
                        : 'hover:scale-106 active:scale-95 animate-float'
                    }`}
                    style={{
                      background:
                        'radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.95), rgba(224, 242, 254, 0.65) 50%, rgba(199, 210, 254, 0.5) 80%, rgba(147, 197, 253, 0.7) 100%)',
                      boxShadow: isHinted
                        ? '0 0 35px rgba(245, 158, 11, 0.6), inset -6px -6px 14px rgba(59, 130, 246, 0.25), inset 6px 6px 14px rgba(255, 255, 255, 0.9)'
                        : '0 12px 28px rgba(37, 99, 235, 0.2), inset -6px -6px 14px rgba(59, 130, 246, 0.25), inset 6px 6px 14px rgba(255, 255, 255, 0.9)',
                      border: '4px solid rgba(255, 255, 255, 0.85)',
                    }}
                  >
                    {/* Glossy Specular Light Reflection Arc */}
                    <div className="absolute top-3 left-4 w-7 h-3.5 sm:w-9 sm:h-4 rounded-full bg-white/80 rotate-[-25deg] filter blur-[0.5px]" />
                    <div className="absolute top-4 left-3 w-2 h-2 rounded-full bg-white/90" />

                    {/* Giant Letter Symbol inside Bubble */}
                    <span
                      className={`text-5xl sm:text-6xl font-black font-fun tracking-wide capitalize transition-transform duration-300 drop-shadow-sm ${
                        isPopped ? 'scale-130 text-amber-500' : ''
                      }`}
                      style={{ color: choice.colorTheme.primary }}
                    >
                      {choice.symbol}
                    </span>
                  </button>

                  {/* Bubble Burst Particle Sprays on Pop */}
                  {isPopped && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center animate-pop-in">
                      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                        <div
                          key={deg}
                          className="absolute w-3.5 h-3.5 rounded-full bg-amber-400 transition-transform duration-500"
                          style={{
                            transform: `rotate(${deg}deg) translate(55px)`,
                            opacity: 0.85,
                          }}
                        />
                      ))}
                      <Sparkles className="w-16 h-16 text-amber-400 animate-wiggle" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Gentle Footer Hint: Audio-only encouragement */}
          <footer className="text-center py-1 shrink-0">
            <p className="text-amber-900/60 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5">
              <span>Pop the bubble that matches the sound!</span>
              <Sparkle className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            </p>
          </footer>
        </main>
      ) : (
        /* 3. Session Celebration Summary Modal */
        <main className="flex-1 flex flex-col items-center justify-center my-auto min-h-0 w-full px-4 animate-pop-in">
          <div className="bg-white rounded-4xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border-4 border-amber-300 text-center flex flex-col items-center">
            {/* Celebratory Milo & Crown */}
            <div className="relative mb-2">
              <span className="text-6xl animate-bounce">👑</span>
              <CharacterMilo size="md" className="mt-1" />
            </div>

            <h3 className="text-3xl font-black font-fun text-gray-900 mb-1">
              Brilliant Ears! 👂🌟
            </h3>
            <p className="text-sm font-bold text-amber-800 mb-4">
              You popped all 5 sound bubbles!
            </p>

            {/* Stars Earned Callout */}
            <div className="flex items-center justify-center gap-2 bg-amber-50 px-5 py-2.5 rounded-2xl border-2 border-amber-200 mb-6">
              <Star className="w-7 h-7 fill-amber-400 text-amber-500 animate-wiggle" />
              <span className="text-2xl font-black text-amber-900">
                +{sessionStarsEarned} Stars!
              </span>
            </div>

            {/* Action Buttons: Play Again & Go Home */}
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handlePlayAgain}
                aria-label="Play Bubble Pop Again"
                className="squish-tap w-full h-16 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xl flex items-center justify-center gap-2 border-4 border-emerald-300 shadow-[0_6px_0_#065F46] active:translate-y-1 active:shadow-[0_2px_0_#065F46] cursor-pointer"
              >
                <RotateCcw className="w-6 h-6 stroke-[3]" />
                <span>Play Again!</span>
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
