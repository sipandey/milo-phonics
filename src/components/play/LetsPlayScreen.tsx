import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CharacterMilo } from '../common/CharacterMilo';
import { triggerGentleConfetti } from '../common/ParticleEffects';
import { audioService } from '../../services/audioService';
import { progressService } from '../../services/progressService';
import { CURRICULUM_LEVELS, getLevelById } from '../../data/curriculumData';
import { getLetterById } from '../../data/lettersData';
import { PhonicsObject, ChildProgress } from '../../types/phonics';
import {
  ArrowRight,
  RotateCcw,
  Home,
  Sparkles,
  Dices,
  BookOpen,
  Star,
  Lock,
  MapPin,
  X,
} from 'lucide-react';

interface LetsPlayScreenProps {
  onGoHome: () => void;
  onExploreLetter: (letterId: string) => void;
}

export const LetsPlayScreen: React.FC<LetsPlayScreenProps> = ({
  onGoHome,
  onExploreLetter,
}) => {
  const [progress, setProgress] = useState<ChildProgress>(progressService.getProgress());
  const [selectedLevelId, setSelectedLevelId] = useState<number>(progress.currentLevelId || 1);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Subscribe to reactive progress updates
  useEffect(() => {
    const unsubscribe = progressService.subscribe((updated) => {
      setProgress(updated);
    });
    return unsubscribe;
  }, []);

  const activeLevel = useMemo(() => {
    return getLevelById(selectedLevelId) || CURRICULUM_LEVELS[0];
  }, [selectedLevelId]);

  // Selected letter within the active level
  const [selectedLetterId, setSelectedLetterId] = useState<string>(activeLevel.letterIds[0]);

  // Ensure selected letter is always valid for the active level
  useEffect(() => {
    if (!activeLevel.letterIds.includes(selectedLetterId)) {
      setSelectedLetterId(activeLevel.letterIds[0]);
    }
  }, [activeLevel, selectedLetterId]);

  // Objects available for the currently selected letter
  const currentLetter = useMemo(() => {
    return getLetterById(selectedLetterId);
  }, [selectedLetterId]);

  // Clean phoneme notation (removes pre-existing slashes so it never prints //s//)
  const cleanPhoneme = useMemo(() => {
    return currentLetter.phoneme.replace(/\//g, '');
  }, [currentLetter.phoneme]);

  const [currentObjectIndex, setCurrentObjectIndex] = useState<number>(0);

  const currentObject: PhonicsObject = useMemo(() => {
    const objs = currentLetter.objects;
    return objs[currentObjectIndex % objs.length] || objs[0];
  }, [currentLetter, currentObjectIndex]);

  const [isObjectAnimating, setIsObjectAnimating] = useState(false);
  const [isLetterAnimating, setIsLetterAnimating] = useState(false);
  const [miloSpeech, setMiloSpeech] = useState<string | null>("Let's explore this sound!");
  const [levelUnlockAlert, setLevelUnlockAlert] = useState<number | null>(null);
  const hasIntroduced = useRef(false);

  // Intro playback when object changes
  useEffect(() => {
    let cancel = false;

    const playIntro = async () => {
      if (!hasIntroduced.current) {
        hasIntroduced.current = true;
        setMiloSpeech(`Level ${activeLevel.id}: /${cleanPhoneme}/!`);
        await audioService.playVoice('prompt.find-sounds');
        if (cancel) return;
      }

      setMiloSpeech(currentObject.spokenIntro);
      audioService.playSoundEffect('pop');
      await audioService.playPhonemeWordBlend(
        currentLetter.phonemeAudioId,
        currentObject.wordAudioId,
        currentObject.name
      );
    };

    playIntro();

    return () => {
      cancel = true;
    };
  }, [currentObject.id, currentLetter.id, cleanPhoneme, activeLevel.id]);

  // Tap Object interaction: plays sound blend, awards stars, checks unlock
  const handleTapObject = () => {
    setIsObjectAnimating(true);
    audioService.playSoundEffect(currentObject.soundType);
    setMiloSpeech(currentObject.spokenIntro);

    const { newlyEarned, newlyUnlockedLevels } = progressService.recordObjectInteraction(
      currentObject.id,
      currentObject.letterId
    );

    audioService.playPhonemeWordBlend(
      currentLetter.phonemeAudioId,
      currentObject.wordAudioId,
      currentObject.name
    );

    if (newlyEarned > 0) {
      triggerGentleConfetti();
      audioService.playChime();
    }

    if (newlyUnlockedLevels.length > 0) {
      const nextLvl = newlyUnlockedLevels[0];
      setLevelUnlockAlert(nextLvl);
      audioService.playFanfare();
      triggerGentleConfetti();
    }

    setTimeout(() => {
      setIsObjectAnimating(false);
    }, 600);
  };

  // Tap Letter badge / phoneme pill
  const handleTapLetter = () => {
    setIsLetterAnimating(true);
    audioService.playBoing();
    setMiloSpeech(`/${cleanPhoneme}/`);
    audioService.playVoice(currentLetter.phonemeAudioId);

    const { newlyEarned, newlyUnlockedLevels } = progressService.recordLetterInteraction(currentLetter.id);

    if (newlyEarned > 0) {
      audioService.playChime();
      triggerGentleConfetti();
    }

    if (newlyUnlockedLevels.length > 0) {
      setLevelUnlockAlert(newlyUnlockedLevels[0]);
      audioService.playFanfare();
      triggerGentleConfetti();
    }

    setTimeout(() => {
      setIsLetterAnimating(false);
    }, 500);
  };

  // Next object for the letter, or cycle to next letter in the level
  const handleNext = () => {
    audioService.playPop();
    const objs = currentLetter.objects;
    if (currentObjectIndex + 1 < objs.length) {
      setCurrentObjectIndex((prev) => prev + 1);
    } else {
      // Move to next letter in level
      const currentLetterIdx = activeLevel.letterIds.indexOf(selectedLetterId);
      const nextLetterIdx = (currentLetterIdx + 1) % activeLevel.letterIds.length;
      setSelectedLetterId(activeLevel.letterIds[nextLetterIdx]);
      setCurrentObjectIndex(0);
    }
  };

  // Random surprise within the active level
  const handleSurprise = () => {
    audioService.playChime();
    triggerGentleConfetti();
    const randomLetterId = activeLevel.letterIds[Math.floor(Math.random() * activeLevel.letterIds.length)];
    setSelectedLetterId(randomLetterId);
    const letter = getLetterById(randomLetterId);
    setCurrentObjectIndex(Math.floor(Math.random() * letter.objects.length));
  };

  // Switch active Level
  const handleSelectLevel = (levelId: number) => {
    const isUnlocked = progress.unlockedLevels.includes(levelId);
    const targetLvl = getLevelById(levelId);

    if (isUnlocked) {
      audioService.playPop();
      setSelectedLevelId(levelId);
      progressService.setCurrentLevel(levelId);
      if (targetLvl) {
        setSelectedLetterId(targetLvl.letterIds[0]);
        setCurrentObjectIndex(0);
      }
      setIsMapModalOpen(false);
    } else {
      audioService.playBoing();
      const starsNeeded = (targetLvl?.requiredStarsToUnlock || 0) - progress.totalStars;
      setMiloSpeech(`Locked! Earn ${Math.max(1, starsNeeded)} more stars ⭐ to unlock Level ${levelId}!`);
    }
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-between p-2.5 sm:p-4 max-w-4xl mx-auto relative z-10 select-none overflow-hidden">
      {/* 1. Level Unlock Celebration Modal */}
      {levelUnlockAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-pop-in">
          <div className="bg-white rounded-4xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl border-4 border-amber-300">
            <span className="text-6xl animate-bounce">🎉</span>
            <h3 className="text-2xl sm:text-3xl font-black font-fun text-gray-900 mt-2">
              Level {levelUnlockAlert} Unlocked!
            </h3>
            <p className="text-sm font-bold text-amber-800 mt-1">
              Brilliant! You unlocked{' '}
              <span className="font-extrabold text-amber-950">
                {getLevelById(levelUnlockAlert)?.title}
              </span>
              !
            </p>

            <div className="my-4 p-3 bg-amber-50 rounded-2xl border border-amber-200 flex justify-center gap-2 text-2xl font-black text-amber-900">
              {getLevelById(levelUnlockAlert)?.letterIds.map((l) => (
                <span key={l} className="px-3 py-1 bg-white rounded-xl shadow-xs border border-amber-300">
                  {l.toUpperCase()}
                </span>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setLevelUnlockAlert(null)}
                className="flex-1 py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm cursor-pointer"
              >
                Keep Playing
              </button>
              <button
                onClick={() => {
                  handleSelectLevel(levelUnlockAlert);
                  setLevelUnlockAlert(null);
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-bubble-yellow hover:bg-amber-400 text-amber-950 font-black text-sm shadow-md border-2 border-amber-400 squish-tap cursor-pointer"
              >
                Jump to Level {levelUnlockAlert} 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Full-Screen Island Adventure Map Modal (Replaces cramped top L1-L7 tab pills!) */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-pop-in">
          <div className="bg-white rounded-4xl p-5 sm:p-6 max-w-lg w-full shadow-2xl border-4 border-amber-300 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl">🗺️</span>
                <div>
                  <h3 className="text-xl font-black font-fun text-gray-900">Phonics World Map</h3>
                  <p className="text-xs text-amber-800 font-bold">Pick an unlocked island to explore!</p>
                </div>
              </div>
              <button
                onClick={() => setIsMapModalOpen(false)}
                className="p-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {CURRICULUM_LEVELS.map((lvl) => {
                const isUnlocked = progress.unlockedLevels.includes(lvl.id);
                const isCurrent = selectedLevelId === lvl.id;
                let lvlStars = 0;
                lvl.letterIds.forEach((l) => {
                  lvlStars += progress.letterStars[l] || 0;
                });
                const maxStars = lvl.letterIds.length * 3;

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
                      <span className="text-3xl sm:text-4xl">{lvl.badgeEmoji}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-sm sm:text-base text-gray-900">
                            Level {lvl.id}: {lvl.title}
                          </h4>
                          {isCurrent && (
                            <span className="text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full">
                              Playing Now
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-gray-600">
                          Sounds: {lvl.letterIds.map((l) => l.toUpperCase()).join('  •  ')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {isUnlocked ? (
                        <div className="flex items-center gap-1 font-black text-amber-700 text-xs sm:text-sm bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                          <span>{lvlStars}/{maxStars}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-gray-400 font-bold bg-gray-100 px-2.5 py-1 rounded-xl border border-gray-200">
                          <Lock className="w-3.5 h-3.5" />
                          <span>{lvl.requiredStarsToUnlock}★</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. Top Header: Clean, Chunky, Toddler-Proof (Home, Island Badge, Explorer) */}
      <header className="flex justify-between items-center w-full gap-2 pt-1 pb-1">
        {/* Chunky Home Button (60x60px) */}
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

        {/* Level & Stars Island Badge (Tapping opens World Map Modal) */}
        <button
          onClick={() => {
            audioService.playChime();
            setIsMapModalOpen(true);
          }}
          aria-label="Open Phonics World Map"
          className="flex items-center gap-2 sm:gap-3 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-2.5 rounded-full border-3 border-amber-200 shadow-[0_4px_0_#FDE68A] squish-tap cursor-pointer hover:scale-103"
        >
          <span className="text-2xl sm:text-3xl">{activeLevel.badgeEmoji}</span>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-gray-900 leading-tight">
                Level {activeLevel.id}
              </span>
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-600">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{progress.totalStars} Stars</span>
            </div>
          </div>
        </button>

        {/* Chunky Explorer Shortcut Button (60x60px) */}
        <button
          onClick={() => {
            audioService.playPop();
            onExploreLetter(currentLetter.id);
          }}
          aria-label={`Explore letter ${currentLetter.symbol}`}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white shadow-[0_4px_0_#FDE68A] border-3 border-amber-200 flex flex-col items-center justify-center text-amber-800 squish-tap shrink-0 hover:scale-105 cursor-pointer active:scale-95"
          title={`Explore Letter ${currentLetter.symbol}`}
        >
          <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600" />
          <span className="text-[10px] font-black leading-none mt-0.5">{currentLetter.symbol}</span>
        </button>
      </header>

      {/* 4. Giant Stepping Stones Bar (Active Level's Sounds: Big, Juicy, 70px+ targets) */}
      <div className="w-full my-1 flex justify-center shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 bg-white/80 backdrop-blur-md rounded-3xl border-3 border-amber-200 shadow-sm max-w-md w-full justify-around">
          {activeLevel.letterIds.map((letterId) => {
            const letter = getLetterById(letterId);
            const isSelected = selectedLetterId === letterId;
            const stars = progress.letterStars[letterId] || 0;

            return (
              <button
                key={letterId}
                onClick={() => {
                  audioService.playPop();
                  setSelectedLetterId(letterId);
                  setCurrentObjectIndex(0);
                }}
                className={`flex-1 h-16 sm:h-20 rounded-2xl flex flex-col items-center justify-center transition-all squish-tap cursor-pointer border-3 ${
                  isSelected
                    ? 'scale-110 shadow-lg ring-4 ring-amber-400 font-black border-amber-500'
                    : 'opacity-85 hover:opacity-100 hover:scale-102 border-transparent'
                }`}
                style={{
                  backgroundColor: letter.colorTheme.badgeBg,
                }}
              >
                <span
                  className="text-2xl sm:text-3xl font-black font-fun leading-none"
                  style={{ color: letter.colorTheme.text }}
                >
                  {letter.symbol}
                </span>

                {/* Stars Indicator for this sound */}
                <div className="flex gap-0.5 mt-1">
                  {[1, 2, 3].map((starIdx) => (
                    <Star
                      key={starIdx}
                      className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                        starIdx <= stars
                          ? 'fill-amber-400 text-amber-500'
                          : 'fill-gray-200 text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Main Hero Arena: Large Character + Giant Tactile Sound Card */}
      <main className="flex-1 flex flex-col items-center justify-center my-auto min-h-0">
        {/* Companion Milo with friendly speech bubble */}
        <CharacterMilo
          size="md"
          speechBubble={miloSpeech}
          className="mb-1 sm:mb-2 shrink-0"
          onTap={() => {
            setMiloSpeech(currentObject.spokenIntro);
            audioService.playPhonemeWordBlend(
              currentLetter.phonemeAudioId,
              currentObject.wordAudioId,
              currentObject.name
            );
          }}
        />

        {/* Central Giant Interactive Sound & Object Stage */}
        <div className="relative w-full max-w-sm flex flex-col items-center justify-center">
          {/* Glowing Aura Background */}
          <div
            className="absolute inset-0 rounded-full filter blur-3xl opacity-35 animate-pulse-glow"
            style={{ backgroundColor: currentObject.accentColor }}
          />

          {/* Huge Touch Hero Card */}
          <button
            onClick={handleTapObject}
            aria-label={`Tap ${currentObject.name}`}
            className={`squish-tap relative w-64 h-64 sm:w-76 sm:h-76 rounded-5xl border-8 shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 focus:outline-none ${
              isObjectAnimating
                ? 'scale-108 rotate-2 shadow-[0_20px_35px_rgba(0,0,0,0.2)]'
                : 'hover:scale-103 shadow-[0_12px_24px_rgba(0,0,0,0.12)]'
            }`}
            style={{
              backgroundColor: currentObject.bgColor,
              borderColor: currentObject.accentColor,
            }}
          >
            {/* Clean Phoneme Pill (NO //s// bug, strictly /{cleanPhoneme}/) */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleTapLetter();
              }}
              className={`absolute -top-4 px-5 py-1.5 rounded-full bg-white shadow-md border-3 flex items-center gap-1.5 font-black text-base sm:text-lg cursor-pointer transition-transform ${
                isLetterAnimating ? 'scale-125 rotate-6' : 'hover:scale-108'
              }`}
              style={{ borderColor: currentLetter.colorTheme.primary, color: currentLetter.colorTheme.text }}
            >
              <span>/{cleanPhoneme}/</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>

            {/* Giant Visual Emoji / Illustration */}
            <span
              className={`text-8xl sm:text-9xl transition-transform duration-300 filter drop-shadow-md select-none ${
                isObjectAnimating ? 'scale-120 animate-wiggle' : ''
              }`}
            >
              {currentObject.emoji}
            </span>

            {/* Friendly Big Object Name */}
            <span
              className="mt-2 text-3xl sm:text-4xl font-black font-fun tracking-wide capitalize select-none"
              style={{ color: currentObject.accentColor }}
            >
              {currentObject.name}
            </span>
          </button>
        </div>
      </main>

      {/* 6. Big, Juicy, Toddler-Proof Action Buttons (Guaranteed 72px-84px tall!) */}
      <footer className="w-full flex justify-center items-center gap-3 sm:gap-4 pt-2 pb-2 shrink-0">
        {/* Big Circular Audio Replay Button */}
        <button
          onClick={handleTapObject}
          aria-label="Play sound again"
          className="squish-tap w-18 h-18 sm:w-22 sm:h-22 rounded-4xl bg-white text-amber-700 border-4 border-amber-300 shadow-[0_6px_0_#D97706] active:translate-y-1 active:shadow-[0_2px_0_#D97706] flex flex-col items-center justify-center shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-7 h-7 sm:w-9 sm:h-9 stroke-[2.5]" />
          <span className="text-xs sm:text-sm font-black mt-0.5">Again</span>
        </button>

        {/* Big Surprise Me Button */}
        <button
          onClick={handleSurprise}
          aria-label="Random Surprise in Level"
          className="squish-tap flex-1 max-w-[170px] sm:max-w-[200px] h-18 sm:h-22 rounded-4xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-4 border-purple-400 shadow-[0_6px_0_#6D28D9] active:translate-y-1 active:shadow-[0_2px_0_#6D28D9] flex items-center justify-center gap-2 font-black text-lg sm:text-2xl cursor-pointer"
        >
          <Dices className="w-6 h-6 sm:w-7 sm:h-7 animate-wiggle" />
          <span>Surprise!</span>
        </button>

        {/* Big Juicy Next Button */}
        <button
          onClick={handleNext}
          aria-label="Next Sound"
          className="squish-tap flex-1 max-w-[170px] sm:max-w-[200px] h-18 sm:h-22 rounded-4xl bg-bubble-yellow text-amber-950 border-4 border-amber-300 shadow-[0_6px_0_#D97706] active:translate-y-1 active:shadow-[0_2px_0_#D97706] flex items-center justify-center gap-2 font-black text-lg sm:text-2xl cursor-pointer"
        >
          <span>Next</span>
          <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 stroke-[3]" />
        </button>
      </footer>
    </div>
  );
};
