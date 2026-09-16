import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CharacterMilo } from '../common/CharacterMilo';
import { triggerGentleConfetti } from '../common/ParticleEffects';
import { ListenRipple } from '../common/ListenRipple';
import { audioService } from '../../services/audioService';
import { progressService } from '../../services/progressService';
import { BLENDING_WORDS, getWordsForLevel } from '../../data/blendingData';
import { CURRICULUM_LEVELS, getLevelById } from '../../data/curriculumData';
import { BlendingWord, ChildProgress } from '../../types/phonics';
import {
  ArrowRight,
  RotateCcw,
  Home,
  Sparkles,
  Volume2,
  CheckCircle2,
  Lock,
  X,
  MapPin,
  Star,
} from 'lucide-react';

interface SoundTrainScreenProps {
  onGoHome: () => void;
}

export const SoundTrainScreen: React.FC<SoundTrainScreenProps> = ({ onGoHome }) => {
  const [progress] = useState<ChildProgress>(progressService.getProgress());
  const [selectedLevelId, setSelectedLevelId] = useState<number>(progress.currentLevelId || 1);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const isToddlerMode = progress.toddlerFocusMode !== false;

  // Available words for the active level
  const availableWords = useMemo(() => {
    const words = getWordsForLevel(selectedLevelId);
    return words.length > 0 ? words : BLENDING_WORDS.slice(0, 5);
  }, [selectedLevelId]);

  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const currentWord: BlendingWord = useMemo(() => {
    return availableWords[currentWordIndex % availableWords.length] || availableWords[0];
  }, [availableWords, currentWordIndex]);

  const activeLevel = useMemo(() => {
    return getLevelById(selectedLevelId) || CURRICULUM_LEVELS[0];
  }, [selectedLevelId]);

  const [highlightedCarriage, setHighlightedCarriage] = useState<number>(-1);
  const [isBlending, setIsBlending] = useState(false);
  const [isWordRevealed, setIsWordRevealed] = useState(false);
  const [isPlayingSentence, setIsPlayingSentence] = useState(false);
  const [isPlayingWord, setIsPlayingWord] = useState(false);
  const [isAudioBusy, setIsAudioBusy] = useState(false);
  const [justFinishedAudio, setJustFinishedAudio] = useState(false);
  const [miloSpeech, setMiloSpeech] = useState<string | null>(isToddlerMode ? null : "All aboard! Tap each sound, then blend!");
  const lastActionTime = useRef<number>(0);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isBusy = isBlending || isPlayingSentence || isPlayingWord || isAudioBusy;

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  // Listen to audio busy state
  useEffect(() => {
    const unsub = audioService.onBusyChange((busy) => {
      setIsAudioBusy(busy);
    });
    return unsub;
  }, []);

  // Debounce guard
  const canAct = () => {
    const now = Date.now();
    if (isBusy || now - lastActionTime.current < 450) {
      return false;
    }
    lastActionTime.current = now;
    return true;
  };

  // Next word
  const handleNextWord = () => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    audioService.playPop();
    setCurrentWordIndex((prev) => (prev + 1) % availableWords.length);
  };

  // When word changes, reset reveal state and stop active speech
  useEffect(() => {
    setIsWordRevealed(false);
    setHighlightedCarriage(-1);
    setIsPlayingSentence(false);
    setIsPlayingWord(false);
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    audioService.stopVoice();
    setMiloSpeech(isToddlerMode ? null : `Can you blend ${currentWord.letters.join(' - ')}? Choo-choo!`);

    // In Toddler Focus Mode: schedule gentle invitation sound if idle for 5.5s
    if (isToddlerMode) {
      idleTimerRef.current = setTimeout(() => {
        if (!isBusy && !isWordRevealed) {
          audioService.playBoing();
        }
      }, 5500);
    }
  }, [currentWord.id, isToddlerMode]);

  // Tap an individual carriage: play single Oxford sound
  const handleTapCarriage = async (index: number) => {
    if (!canAct()) return;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    setHighlightedCarriage(index);
    const phonemeAudioId = currentWord.phonemeAudioIds[index];
    if (phonemeAudioId) {
      audioService.playBoing();
      await audioService.playVoice(phonemeAudioId, { interrupt: true });
    }
    setTimeout(() => {
      setHighlightedCarriage(-1);
    }, 450);
  };

  // Play isolated blended word (Explorer Mode)
  const handlePlayWord = async () => {
    if (!canAct()) return;
    setIsPlayingWord(true);
    audioService.playPop();
    setMiloSpeech(`${currentWord.word.toUpperCase()}!`);
    await audioService.playCvcWord(currentWord.id, currentWord.word);
    setIsPlayingWord(false);
  };

  // Play slow contextual sentence (Explorer Mode)
  const handlePlaySentence = async () => {
    if (!canAct()) return;
    setIsPlayingSentence(true);
    audioService.playChime();
    setMiloSpeech(currentWord.meaning);
    await audioService.playSentence(currentWord.id, currentWord.meaning);
    setIsPlayingSentence(false);
  };

  // Full sequential train blend
  const handleBlendWord = async () => {
    if (isBusy) return;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);

    setIsBlending(true);
    setIsWordRevealed(false);
    setIsPlayingSentence(false);
    setIsPlayingWord(false);
    setMiloSpeech(isToddlerMode ? null : "Listen closely as we blend... 👂");

    // Fail-safe watchdog: advance in 5.5s if browser audio stalls
    const watchdogTimer = setTimeout(() => {
      if (isToddlerMode) {
        handleNextWord();
      }
    }, 5500);

    try {
      await audioService.playSequentialBlend(
        currentWord.phonemeAudioIds,
        currentWord.wordAudioId,
        currentWord.word,
        (idx) => {
          setHighlightedCarriage(idx);
        }
      );

      // Award star & trigger confetti
      progressService.awardStars(currentWord.letters[0] || 's', 1);
      triggerGentleConfetti();
      audioService.playChime();
      setIsWordRevealed(true);
      setMiloSpeech(isToddlerMode ? null : `Brilliant! ${currentWord.word.toUpperCase()}! 🌟`);

      setJustFinishedAudio(true);
      setTimeout(() => setJustFinishedAudio(false), 2600);

      // In Toddler Focus Mode: automatically advance smoothly after 1.5s golden celebration!
      if (isToddlerMode) {
        autoAdvanceTimerRef.current = setTimeout(() => {
          clearTimeout(watchdogTimer);
          handleNextWord();
        }, 1500);
      }
    } catch (err) {
      console.warn('[SoundTrainScreen] Error during train blend:', err);
    } finally {
      setIsBlending(false);
    }
  };

  // Switch level
  const handleSelectLevel = (levelId: number) => {
    const isUnlocked = progress.unlockedLevels.includes(levelId);
    if (isUnlocked) {
      audioService.playPop();
      setSelectedLevelId(levelId);
      setCurrentWordIndex(0);
      setIsLevelModalOpen(false);
    } else {
      audioService.playBoing();
      const targetLvl = getLevelById(levelId);
      const needed = (targetLvl?.requiredStarsToUnlock || 0) - progress.totalStars;
      setMiloSpeech(`Locked! Earn ${Math.max(1, needed)} more stars ⭐ to unlock Level ${levelId}!`);
    }
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-between p-2.5 sm:p-4 max-w-4xl mx-auto relative z-10 select-none overflow-hidden">
      {/* Non-destructive toddler listening ripple overlay */}
      <ListenRipple
        isActive={isBusy}
        hintText="Shh... Listen closely! 👂🎶"
        onTap={() => setMiloSpeech("Listen closely with Milo! 👂🎶")}
      />

      {/* Level Picker Modal */}
      {isLevelModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-pop-in cursor-pointer"
          onClick={() => setIsLevelModalOpen(false)}
        >
          <div
            className="bg-white rounded-4xl p-5 sm:p-6 max-w-md w-full shadow-2xl border-4 border-amber-300 max-h-[90vh] flex flex-col cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl">🚂</span>
                <div>
                  <h3 className="text-xl font-black font-fun text-gray-900">Sound Train Station</h3>
                  <p className="text-xs text-amber-800 font-bold">Pick an unlocked level to blend!</p>
                </div>
              </div>
              <button
                onClick={() => setIsLevelModalOpen(false)}
                className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer shrink-0"
                aria-label="Close Level Picker"
              >
                <X className="w-7 h-7 sm:w-8 sm:h-8" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {CURRICULUM_LEVELS.map((lvl) => {
                const isUnlocked = progress.unlockedLevels.includes(lvl.id);
                const isCurrent = selectedLevelId === lvl.id;
                const words = getWordsForLevel(lvl.id);

                return (
                  <button
                    key={lvl.id}
                    onClick={() => handleSelectLevel(lvl.id)}
                    className={`w-full p-3.5 rounded-2xl border-3 flex items-center justify-between text-left transition-all squish-tap cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-100/90 border-amber-400 ring-3 ring-amber-300 shadow-md'
                        : isUnlocked
                        ? 'bg-white hover:bg-amber-50/50 border-amber-200 shadow-sm'
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{lvl.badgeEmoji}</span>
                      <div>
                        <h4 className="font-black text-sm text-gray-900">
                          Level {lvl.id}: {lvl.title}
                        </h4>
                        <p className="text-xs text-gray-600 font-bold">
                          {words.length} Decodable Words
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {isUnlocked ? (
                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-gray-400 flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-xl">
                          <Lock className="w-3.5 h-3.5" />
                          <span>{lvl.requiredStarsToUnlock}★</span>
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 1. Header Bar: Home and Level Station Badge / Star Counter */}
      <header className={`flex justify-between items-center w-full gap-2 pt-1 pb-1 transition-opacity duration-300 ${isBusy ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
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

        {isToddlerMode ? (
          /* Toddler Focus Mode: Clean Star Counter Pill */
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full border-3 border-amber-200 shadow-[0_4px_0_#FDE68A] font-black text-amber-700 text-sm">
            <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            <span>{progress.totalStars} Stars</span>
          </div>
        ) : (
          /* Full Explorer Mode: Level Station Badge */
          <button
            onClick={() => {
              audioService.playChime();
              setIsLevelModalOpen(true);
            }}
            aria-label="Change Train Station Level"
            className="flex items-center gap-2 sm:gap-3 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-2.5 rounded-full border-3 border-amber-200 shadow-[0_4px_0_#FDE68A] squish-tap cursor-pointer hover:scale-103"
          >
            <span className="text-2xl sm:text-3xl">🚂</span>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black text-gray-900 leading-tight">
                  Level {activeLevel.id} Station
                </span>
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <p className="text-[11px] font-extrabold text-amber-700">
                Word {currentWordIndex + 1} of {availableWords.length}
              </p>
            </div>
          </button>
        )}
      </header>

      {/* 2. Conductor Milo with listening pose during audio */}
      <div className="flex justify-center my-0.5 sm:my-1 shrink-0">
        <CharacterMilo
          size={isToddlerMode ? 'lg' : 'md'}
          speechBubble={isToddlerMode || isBusy ? null : miloSpeech}
          isListening={isBusy}
          onTap={() => {
            handleBlendWord();
          }}
        />
      </div>

      {/* 3. The Sound Train Stage (Carriages & Sound Buttons) */}
      <main className="flex-1 flex flex-col items-center justify-center my-auto min-h-0 w-full px-1">
        {/* Train Engine + Carriages Container */}
        <div className="w-full flex items-center justify-center gap-2 sm:gap-3">
          {/* Cute Little Train Engine Icon */}
          <div
            onClick={isBusy ? undefined : handleBlendWord}
            className={`hidden sm:flex flex-col items-center justify-center shrink-0 pr-1 ${isBusy ? 'opacity-60' : 'cursor-pointer hover:scale-105 squish-tap'}`}
            title="Tap Train to Blend"
          >
            <span className="text-5xl sm:text-6xl animate-bounce-gentle filter drop-shadow-md">🚂</span>
            <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full mt-1">
              Choo-Choo!
            </span>
          </div>

          {/* Carriages (Elkonin Sound Boxes) */}
          <div className="flex items-center gap-2 sm:gap-4 justify-center">
            {currentWord.letters.map((letter, index) => {
              const isHighlighted = highlightedCarriage === index;

              return (
                <div key={index} className="flex flex-col items-center">
                  {/* The Carriage Box */}
                  <button
                    onClick={() => handleTapCarriage(index)}
                    disabled={isBusy}
                    aria-label={`Sound ${letter}`}
                    className={`squish-tap relative ${
                      isToddlerMode
                        ? 'w-24 min-w-[96px] h-32 min-h-[128px] sm:w-32 sm:h-40'
                        : 'w-[88px] min-w-[88px] h-28 min-h-[112px] sm:w-28 sm:h-36'
                    } rounded-3xl border-4 shadow-xl flex flex-col items-center justify-between p-2 cursor-pointer transition-all duration-300 focus:outline-none ${
                      isHighlighted
                        ? 'scale-115 -translate-y-2 ring-6 ring-amber-400 bg-amber-100 border-amber-500 shadow-[0_15px_30px_rgba(217,119,6,0.3)]'
                        : isBusy
                        ? 'bg-white/80 border-amber-200 opacity-60'
                        : 'bg-white hover:bg-amber-50/80 border-amber-300 hover:scale-104 shadow-[0_8px_0_#FCD34D]'
                    }`}
                  >
                    {/* Top Sound Dot (British Sound Button ⚫) */}
                    <div
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-all ${
                        isHighlighted ? 'bg-amber-600 scale-125' : 'bg-amber-400'
                      }`}
                    />

                    {/* Giant Letter Symbol */}
                    <span
                      className={`${
                        isToddlerMode ? 'text-5xl sm:text-7xl' : 'text-4xl sm:text-6xl'
                      } font-black font-fun tracking-wide capitalize transition-transform ${
                        isHighlighted ? 'scale-115 text-amber-900' : 'text-gray-900'
                      }`}
                    >
                      {letter}
                    </span>

                    {/* Sound Pill Button underneath */}
                    <div className="w-full flex items-center justify-center gap-1 bg-amber-50 px-2 py-0.5 rounded-xl border border-amber-200">
                      <Volume2 className="w-3 h-3 text-amber-600" />
                      <span className="text-[11px] sm:text-xs font-extrabold text-amber-800">
                        /{letter}/
                      </span>
                    </div>
                  </button>

                  {/* Train Wheels */}
                  <div className="flex justify-between w-18 sm:w-22 px-1 mt-1">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-800 border-2 border-gray-400 shadow-xs" />
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-800 border-2 border-gray-400 shadow-xs" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tracks Line */}
        <div className="w-full max-w-md h-2 bg-amber-200/80 rounded-full my-2 relative">
          <div className="absolute inset-0 flex justify-around items-center">
            {[1, 2, 3, 4, 5, 6, 7].map((tie) => (
              <div key={tie} className="w-1.5 h-4 bg-amber-400 rounded-sm" />
            ))}
          </div>
        </div>

        {/* Big Interactive "Blend! 🚂" Action Button */}
        {!isWordRevealed ? (
          <div className="mt-2 w-full max-w-sm px-2">
            <button
              onClick={handleBlendWord}
              disabled={isBusy}
              aria-label="Blend sounds together"
              className={`squish-tap w-full ${
                isToddlerMode ? 'h-20 sm:h-22 text-2xl sm:text-3xl' : 'h-16 sm:h-18 text-xl sm:text-2xl'
              } rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-4 border-emerald-300 shadow-[0_6px_0_#065F46] active:translate-y-1 active:shadow-[0_2px_0_#065F46] flex items-center justify-center gap-3 font-black cursor-pointer transition-all ${
                isBusy ? 'opacity-60 pointer-events-none' : 'opacity-100 ring-4 ring-amber-300 animate-pulse-glow'
              }`}
            >
              <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 animate-wiggle" />
              <span>{isBlending ? 'Blending...' : 'Blend! 🚂 Choo-Choo!'}</span>
            </button>
          </div>
        ) : isToddlerMode ? (
          /* Toddler Focus Mode: Clean, Massive Celebratory Picture + Word Card */
          <div className="mt-2 w-full max-w-sm px-2 animate-pop-in">
            <div className="p-4 sm:p-6 rounded-4xl bg-white border-4 border-amber-300 shadow-2xl flex flex-col items-center justify-center gap-2 text-center ring-6 ring-amber-200">
              <span className="text-7xl sm:text-8xl animate-bounce-gentle filter drop-shadow-md">
                {currentWord.emoji}
              </span>
              <h3 className="text-4xl sm:text-5xl font-black font-fun text-gray-900 tracking-wide uppercase">
                {currentWord.word}
              </h3>
              <div className="flex items-center gap-1.5 text-emerald-600 font-extrabold text-sm mt-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Brilliant Blending! ⭐</span>
              </div>
            </div>
          </div>
        ) : (
          /* Full Explorer Mode: Revealed Word Card with Word Replay & Story Sentence */
          <div className="mt-1 w-full max-w-sm px-2 animate-pop-in">
            <div className={`p-3 sm:p-4 rounded-3xl bg-white border-4 border-amber-300 shadow-xl flex flex-col gap-2 transition-all ${
              isPlayingSentence || isPlayingWord ? 'ring-6 ring-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.45)]' : ''
            }`}>
              {/* Top Row: Emoji, Big Word, and Play Word Button */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-5xl sm:text-6xl animate-bounce-gentle shrink-0">
                  {currentWord.emoji}
                </span>

                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-3xl sm:text-4xl font-black font-fun text-gray-900 tracking-wide uppercase truncate">
                      {currentWord.word}
                    </h3>
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 shrink-0" />
                  </div>
                  <p className="text-[11px] sm:text-xs font-bold text-amber-700">
                    {isPlayingWord ? 'Speaking word...' : isPlayingSentence ? 'Reading story...' : 'Tap below to listen!'}
                  </p>
                </div>

                {/* Word Replay Button */}
                <button
                  onClick={handlePlayWord}
                  disabled={isBusy}
                  aria-label={`Hear word ${currentWord.word}`}
                  className={`p-2.5 sm:p-3 rounded-2xl border-2 flex items-center justify-center squish-tap shrink-0 cursor-pointer transition-all ${
                    isPlayingWord
                      ? 'bg-amber-400 text-white border-amber-500 scale-105 shadow-md ring-2 ring-amber-300'
                      : isBusy
                      ? 'bg-gray-100 text-gray-400 border-gray-200 pointer-events-none'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300 shadow-xs'
                  }`}
                  title="Hear word"
                >
                  <Volume2 className={`w-5 h-5 sm:w-6 sm:h-6 ${isPlayingWord ? 'animate-bounce' : ''}`} />
                </button>
              </div>

              {/* Bottom Row: Interactive Slow Sentence Card / Story Bubble */}
              <button
                onClick={handlePlaySentence}
                disabled={isBusy}
                aria-label={`Hear sentence: ${currentWord.meaning}`}
                className={`w-full p-2 sm:p-2.5 rounded-2xl border-2 text-left flex items-center justify-between gap-2 transition-all squish-tap cursor-pointer ${
                  isPlayingSentence
                    ? 'bg-amber-100 border-amber-400 ring-3 ring-amber-300 shadow-md'
                    : isBusy
                    ? 'bg-gray-50 border-gray-200 opacity-60 pointer-events-none'
                    : 'bg-amber-50/80 hover:bg-amber-100/70 border-amber-200 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-xl sm:text-2xl shrink-0">📖</span>
                  <p className="text-xs sm:text-sm font-bold text-amber-950 leading-snug">
                    "{currentWord.meaning}"
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-amber-200 shadow-xs">
                  <Volume2 className={`w-3.5 h-3.5 text-amber-600 ${isPlayingSentence ? 'animate-bounce' : ''}`} />
                  <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider">
                    {isPlayingSentence ? 'Playing' : 'Slow'}
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 4. Bottom Action Controls: Only in Full Explorer Mode */}
      {!isToddlerMode && (
        <footer className="w-full max-w-md mx-auto flex justify-center items-center gap-3 sm:gap-4 pt-2 pb-3 sm:pb-4 shrink-0 px-2">
          {/* Again Button (~35% width) */}
          <button
            onClick={handleBlendWord}
            disabled={isBusy}
            aria-label="Blend sounds again"
            className={`squish-tap w-24 h-20 sm:w-28 sm:h-24 rounded-3xl bg-white text-amber-700 border-4 border-amber-300 shadow-[0_6px_0_#D97706] active:translate-y-1 active:shadow-[0_2px_0_#D97706] flex flex-col items-center justify-center p-1.5 shrink-0 cursor-pointer transition-all ${
              isBusy ? 'opacity-40 pointer-events-none' : 'opacity-100'
            }`}
          >
            <RotateCcw className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.5]" />
            <span className="text-xs sm:text-sm font-black mt-1 leading-none">Again</span>
          </button>

          {/* Next Word Button (~65% width) */}
          <button
            onClick={handleNextWord}
            disabled={isBusy}
            aria-label="Next word"
            className={`squish-tap flex-1 h-20 sm:h-24 rounded-3xl bg-bubble-yellow text-amber-950 border-4 border-amber-300 shadow-[0_6px_0_#D97706] active:translate-y-1 active:shadow-[0_2px_0_#D97706] flex items-center justify-center gap-2 font-black text-xl sm:text-2xl cursor-pointer transition-all ${
              isBusy ? 'opacity-40 pointer-events-none' : 'opacity-100'
            } ${
              justFinishedAudio ? 'scale-104 ring-4 ring-amber-400 animate-bounce-gentle shadow-lg' : ''
            }`}
          >
            <span>Next</span>
            <ArrowRight className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3] shrink-0" />
          </button>
        </footer>
      )}
    </div>
  );
};
