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

  // If level changes, ensure selected letter is valid for this level
  useEffect(() => {
    if (!activeLevel.letterIds.includes(selectedLetterId)) {
      setSelectedLetterId(activeLevel.letterIds[0]);
    }
  }, [activeLevel, selectedLetterId]);

  // Objects available for the currently selected letter
  const currentLetter = useMemo(() => {
    return getLetterById(selectedLetterId);
  }, [selectedLetterId]);

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
        setMiloSpeech(`Level ${activeLevel.id}: Let's learn /${currentLetter.phoneme}/!`);
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
  }, [currentObject.id, currentLetter.id]);

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

  // Tap Letter badge
  const handleTapLetter = () => {
    setIsLetterAnimating(true);
    audioService.playBoing();
    setMiloSpeech(`/${currentLetter.phoneme}/`);
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
    } else {
      audioService.playBoing();
      const starsNeeded = (targetLvl?.requiredStarsToUnlock || 0) - progress.totalStars;
      setMiloSpeech(`Locked! Earn ${Math.max(1, starsNeeded)} more stars ⭐ to unlock Level ${levelId}!`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 max-w-4xl mx-auto relative z-10 select-none touch-pan-y pb-8">
      {/* Level Unlock Celebration Modal */}
      {levelUnlockAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-pop-in">
          <div className="bg-white rounded-4xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl border-4 border-amber-300">
            <span className="text-5xl animate-bounce">🎉</span>
            <h3 className="text-2xl sm:text-3xl font-black font-fun text-gray-900 mt-2">
              Level {levelUnlockAlert} Unlocked!
            </h3>
            <p className="text-sm font-bold text-amber-800 mt-1">
              Brilliant reading! You unlocked{' '}
              <span className="font-extrabold text-amber-950">
                {getLevelById(levelUnlockAlert)?.title}
              </span>
              !
            </p>

            <div className="my-4 p-3 bg-amber-50 rounded-2xl border border-amber-200 flex justify-center gap-2 text-xl font-black text-amber-900">
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

      {/* Top Header: Home, Star Count, and Explore Letter */}
      <header className="flex justify-between items-center w-full gap-2 mb-2">
        <button
          onClick={() => {
            audioService.playPop();
            onGoHome();
          }}
          aria-label="Go Home"
          className="w-13 h-13 sm:w-16 sm:h-16 rounded-3xl bg-white shadow-md border-3 border-amber-200 flex items-center justify-center text-amber-700 squish-tap shrink-0 cursor-pointer"
        >
          <Home className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>

        {/* Level Title & Total Stars */}
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 sm:px-5 py-2 rounded-full border-3 border-amber-200 shadow-sm">
          <span className="text-xl sm:text-2xl">{activeLevel.badgeEmoji}</span>
          <div className="text-left">
            <h2 className="text-xs sm:text-sm font-black text-gray-900 leading-tight">
              Level {activeLevel.id}: {activeLevel.title}
            </h2>
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-600">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{progress.totalStars} Stars</span>
            </div>
          </div>
        </div>

        {/* Shortcut to Letter Detail */}
        <button
          onClick={() => {
            audioService.playPop();
            onExploreLetter(currentLetter.id);
          }}
          aria-label={`Explore letter ${currentLetter.symbol}`}
          className="w-13 h-13 sm:w-16 sm:h-16 rounded-3xl bg-white shadow-md border-3 border-amber-200 flex flex-col items-center justify-center text-amber-800 squish-tap shrink-0 hover:scale-105 cursor-pointer"
          title={`Explore Letter ${currentLetter.symbol}`}
        >
          <BookOpen className="w-5 h-5 sm:w-7 sm:h-7 text-amber-600" />
          <span className="text-[10px] font-black leading-none mt-0.5">{currentLetter.symbol}</span>
        </button>
      </header>

      {/* 7 Levels Navigation Ribbon */}
      <div className="w-full my-1">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 no-scrollbar touch-pan-x">
          {CURRICULUM_LEVELS.map((lvl) => {
            const isUnlocked = progress.unlockedLevels.includes(lvl.id);
            const isSelected = selectedLevelId === lvl.id;
            return (
              <button
                key={lvl.id}
                onClick={() => handleSelectLevel(lvl.id)}
                className={`px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all squish-tap flex items-center gap-1.5 shrink-0 border-2 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-white shadow-md border-amber-600 scale-105 ring-2 ring-amber-300'
                    : isUnlocked
                    ? 'bg-white/90 text-amber-950 border-amber-200 hover:bg-white'
                    : 'bg-gray-100 text-gray-400 border-gray-300 opacity-60'
                }`}
                title={lvl.title}
              >
                <span>{lvl.badgeEmoji}</span>
                <span>L{lvl.id}</span>
                {!isUnlocked && <Lock className="w-3 h-3 text-gray-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Level Sounds (Stepping Stones) - Shows ONLY current level's letters */}
      <div className="w-full my-1 flex justify-center">
        <div className="flex items-center gap-2 sm:gap-3 p-1.5 bg-white/70 backdrop-blur-md rounded-3xl border-2 border-amber-200 shadow-xs max-w-md w-full justify-around">
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
                className={`flex-1 py-1.5 px-2 rounded-2xl flex flex-col items-center justify-center transition-all squish-tap cursor-pointer border-2 ${
                  isSelected
                    ? 'scale-108 shadow-md ring-3 ring-amber-400 font-black'
                    : 'opacity-85 hover:opacity-100 hover:scale-102 border-transparent'
                }`}
                style={{
                  backgroundColor: letter.colorTheme.badgeBg,
                  borderColor: isSelected ? letter.colorTheme.primary : 'transparent',
                }}
              >
                <span
                  className="text-xl sm:text-2xl font-black font-fun"
                  style={{ color: letter.colorTheme.text }}
                >
                  {letter.symbol}
                </span>

                {/* Stars Indicator for this sound */}
                <div className="flex gap-0.5 mt-0.5">
                  {[1, 2, 3].map((starIdx) => (
                    <Star
                      key={starIdx}
                      className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
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

      {/* Main Play Area */}
      <main className="flex-1 flex flex-col items-center justify-center my-1 sm:my-2">
        {/* Companion Milo with speech bubble */}
        <CharacterMilo
          size="md"
          speechBubble={miloSpeech}
          className="mb-2"
          onTap={() => {
            setMiloSpeech(currentObject.spokenIntro);
            audioService.playPhonemeWordBlend(
              currentLetter.phonemeAudioId,
              currentObject.wordAudioId,
              currentObject.name
            );
          }}
        />

        {/* Big Interactive Sound & Object Stage */}
        <div className="relative w-full max-w-sm flex flex-col items-center justify-center">
          {/* Glowing Aura Background */}
          <div
            className="absolute inset-0 rounded-full filter blur-2xl opacity-40 animate-pulse-glow"
            style={{ backgroundColor: currentObject.accentColor }}
          />

          {/* Interactive Card */}
          <button
            onClick={handleTapObject}
            aria-label={`Tap ${currentObject.name}`}
            className={`squish-tap relative w-56 h-56 sm:w-68 sm:h-68 rounded-5xl border-8 shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 focus:outline-none ${
              isObjectAnimating
                ? 'scale-110 rotate-3 shadow-[0_20px_35px_rgba(0,0,0,0.15)]'
                : 'hover:scale-104 shadow-[0_12px_24px_rgba(0,0,0,0.1)]'
            }`}
            style={{
              backgroundColor: currentObject.bgColor,
              borderColor: currentObject.accentColor,
            }}
          >
            {/* Top Phoneme Pill */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleTapLetter();
              }}
              className={`absolute -top-3 px-4 py-1 rounded-full bg-white shadow-md border-2 flex items-center gap-1 font-black text-sm sm:text-base cursor-pointer transition-transform ${
                isLetterAnimating ? 'scale-125 rotate-6' : 'hover:scale-105'
              }`}
              style={{ borderColor: currentLetter.colorTheme.primary, color: currentLetter.colorTheme.text }}
            >
              <span>/{currentLetter.phoneme}/</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>

            {/* Giant Visual Emoji / Illustration */}
            <span
              className={`text-8xl sm:text-9xl transition-transform duration-300 filter drop-shadow-md ${
                isObjectAnimating ? 'scale-120 animate-wiggle' : ''
              }`}
            >
              {currentObject.emoji}
            </span>

            {/* Friendly Object Name */}
            <span
              className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-black font-fun tracking-wide capitalize"
              style={{ color: currentObject.accentColor }}
            >
              {currentObject.name}
            </span>
          </button>
        </div>

        {/* Decodable Word Preview Pill */}
        <div className="mt-2 text-center">
          <p className="text-[11px] font-extrabold text-amber-800 bg-amber-100/70 px-3 py-1 rounded-full border border-amber-200">
            📖 Level Words: {activeLevel.decodableWordsPreview.join(' • ')}
          </p>
        </div>
      </main>

      {/* Toddler-Friendly Action Controls: Repeat, Surprise Me, & Next */}
      <footer className="w-full flex justify-center items-center gap-3 sm:gap-4 pt-1 pb-1">
        {/* Repeat Button */}
        <button
          onClick={handleTapObject}
          aria-label="Play sound again"
          className="squish-tap w-15 h-15 sm:w-18 sm:h-18 rounded-3xl bg-white text-amber-700 border-4 border-amber-300 shadow-[0_5px_0_#D97706] flex flex-col items-center justify-center shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
          <span className="text-[10px] sm:text-xs font-black mt-0.5">Again</span>
        </button>

        {/* Surprise Me Button (Level-specific random jump) */}
        <button
          onClick={handleSurprise}
          aria-label="Random Surprise in Level"
          className="squish-tap flex-1 max-w-[170px] sm:max-w-[200px] h-15 sm:h-18 rounded-3xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-4 border-purple-400 shadow-[0_5px_0_#6D28D9] flex items-center justify-center gap-2 font-black text-base sm:text-xl cursor-pointer"
        >
          <Dices className="w-5 h-5 sm:w-6 sm:h-6 animate-wiggle" />
          <span>Surprise!</span>
        </button>

        {/* Big Next Button */}
        <button
          onClick={handleNext}
          aria-label="Next Sound"
          className="squish-tap flex-1 max-w-[150px] sm:max-w-[180px] h-15 sm:h-18 rounded-3xl bg-bubble-yellow text-amber-950 border-4 border-amber-300 shadow-[0_5px_0_#D97706] flex items-center justify-center gap-2 font-black text-base sm:text-xl cursor-pointer"
        >
          <span>Next</span>
          <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
        </button>
      </footer>
    </div>
  );
};
