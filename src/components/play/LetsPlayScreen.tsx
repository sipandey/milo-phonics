import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CharacterMilo } from '../common/CharacterMilo';
import { triggerGentleConfetti } from '../common/ParticleEffects';
import { audioService } from '../../services/audioService';
import { progressService } from '../../services/progressService';
import { getAllLetters, getLetterById } from '../../data/lettersData';
import { ArrowRight, RotateCcw, Home, Sparkles, Dices, BookOpen } from 'lucide-react';

interface LetsPlayScreenProps {
  onGoHome: () => void;
  onExploreLetter: (letterId: string) => void;
}

export const LetsPlayScreen: React.FC<LetsPlayScreenProps> = ({
  onGoHome,
  onExploreLetter,
}) => {
  const allLetters = getAllLetters();

  // Starting point / letter filter: 'all' or specific letter ID ('a', 'b', etc.)
  const [selectedLetterFilter, setSelectedLetterFilter] = useState<string>('all');

  // Filtered pool of curriculum objects based on selection
  const activeObjects = useMemo(() => {
    if (selectedLetterFilter === 'all') {
      return allLetters.flatMap((l) => l.objects);
    }
    const letter = allLetters.find((l) => l.id === selectedLetterFilter);
    return letter ? letter.objects : allLetters.flatMap((l) => l.objects);
  }, [selectedLetterFilter, allLetters]);

  // Initial random index across the active pool so it never starts on the same letter every time!
  const [currentIndex, setCurrentIndex] = useState(() => {
    const total = allLetters.flatMap((l) => l.objects).length;
    return Math.floor(Math.random() * (total || 1));
  });

  const [isObjectAnimating, setIsObjectAnimating] = useState(false);
  const [isLetterAnimating, setIsLetterAnimating] = useState(false);
  const [miloSpeech, setMiloSpeech] = useState<string | null>("Hi! Let's find some sounds!");
  const hasIntroduced = useRef(false);

  // Safe wrap-around index
  const safeIndex = currentIndex % (activeObjects.length || 1);
  const currentObject = activeObjects[safeIndex] || activeObjects[0];
  const currentLetter = getLetterById(currentObject.letterId);

  // Intro sequence: greet once -> introduce current object via Oxford sound + slow British word
  useEffect(() => {
    let cancel = false;

    const playIntroSequence = async () => {
      if (!hasIntroduced.current) {
        hasIntroduced.current = true;
        setMiloSpeech("Hi! Let's find some sounds!");
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

    playIntroSequence();

    // Preload next upcoming audio asset
    const nextIdx = (safeIndex + 1) % activeObjects.length;
    const nextObj = activeObjects[nextIdx];
    if (nextObj) {
      audioService.preload([currentObject.wordAudioId, nextObj.wordAudioId, currentLetter.phonemeAudioId]);
    }

    return () => {
      cancel = true;
    };
  }, [currentObject.id]);

  // Tapping the Object: Animate, sound effect, repeat spoken name, gentle sparkles
  const handleTapObject = () => {
    setIsObjectAnimating(true);
    progressService.recordObjectInteraction(currentObject.id, currentObject.letterId);
    audioService.playSoundEffect(currentObject.soundType);
    setMiloSpeech(currentObject.spokenIntro);

    audioService.playPhonemeWordBlend(
      currentLetter.phonemeAudioId,
      currentObject.wordAudioId,
      currentObject.name
    );
    triggerGentleConfetti();

    setTimeout(() => {
      setIsObjectAnimating(false);
    }, 600);
  };

  // Tapping the Letter badge: Animate, play boing, pronounce Oxford phoneme
  const handleTapLetter = () => {
    setIsLetterAnimating(true);
    progressService.recordLetterInteraction(currentLetter.id);
    audioService.playBoing();
    setMiloSpeech(currentLetter.phoneme);
    audioService.playVoice(currentLetter.phonemeAudioId);

    setTimeout(() => {
      setIsLetterAnimating(false);
    }, 500);
  };

  // Random surprise generator across active objects
  const handleSurprise = () => {
    audioService.playChime();
    triggerGentleConfetti();
    let nextIdx = Math.floor(Math.random() * activeObjects.length);
    if (activeObjects.length > 1 && nextIdx === safeIndex) {
      nextIdx = (nextIdx + 1) % activeObjects.length;
    }
    setCurrentIndex(nextIdx);
  };

  // Move to next surprise
  const handleNext = () => {
    audioService.playPop();
    const nextIdx = (safeIndex + 1) % activeObjects.length;
    setCurrentIndex(nextIdx);
  };

  // Repeat current surprise
  const handleRepeat = () => {
    handleTapObject();
  };

  // Filter or choose starting letter point
  const handleFilterLetter = (letterId: string) => {
    audioService.playPop();
    if (letterId === 'all') {
      setSelectedLetterFilter('all');
      const all = allLetters.flatMap((l) => l.objects);
      setCurrentIndex(Math.floor(Math.random() * all.length));
    } else {
      setSelectedLetterFilter(letterId);
      setCurrentIndex(0);
      const letter = getLetterById(letterId);
      if (letter) {
        audioService.playVoice(letter.phonemeAudioId);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 max-w-4xl mx-auto relative z-10 select-none touch-pan-y pb-8">
      {/* Top Header: Home, Letter Badge, and Direct Explore Shortcut */}
      <header className="flex justify-between items-center w-full gap-2 mb-2">
        <button
          onClick={() => {
            audioService.playPop();
            onGoHome();
          }}
          aria-label="Go Home"
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white shadow-md border-3 border-amber-200 flex items-center justify-center text-amber-700 squish-tap shrink-0"
        >
          <Home className="w-7 h-7 sm:w-8 sm:h-8" />
        </button>

        {/* Big Letter Sound Badge */}
        <button
          onClick={handleTapLetter}
          aria-label={`Letter ${currentLetter.symbol} sound ${currentLetter.phoneme}`}
          className={`px-4 sm:px-6 py-2 rounded-full border-4 shadow-lg squish-tap flex items-center gap-2 sm:gap-3 transition-transform ${
            isLetterAnimating ? 'scale-115 rotate-6' : 'hover:scale-105'
          }`}
          style={{
            backgroundColor: currentLetter.colorTheme.badgeBg,
            borderColor: currentLetter.colorTheme.primary,
          }}
        >
          <span
            className="text-3xl sm:text-5xl font-black font-fun drop-shadow"
            style={{ color: currentLetter.colorTheme.text }}
          >
            {currentLetter.symbol}
          </span>
          <span
            className="text-xl sm:text-3xl font-extrabold"
            style={{ color: currentLetter.colorTheme.text }}
          >
            "{currentLetter.phoneme}"
          </span>
        </button>

        {/* Shortcut to Explore this Letter */}
        <button
          onClick={() => {
            audioService.playPop();
            onExploreLetter(currentLetter.id);
          }}
          aria-label={`Explore letter ${currentLetter.symbol}`}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white shadow-md border-3 border-amber-200 flex flex-col items-center justify-center text-amber-800 squish-tap shrink-0 hover:scale-105"
          title={`Explore Letter ${currentLetter.symbol}`}
        >
          <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600" />
          <span className="text-[10px] font-black leading-none mt-0.5">{currentLetter.symbol}</span>
        </button>
      </header>

      {/* Starting Letter Picker Ribbon: Choose any starting point (A-Z or All) */}
      <div className="w-full my-1">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 no-scrollbar touch-pan-x">
          {/* All / Random Option */}
          <button
            onClick={() => handleFilterLetter('all')}
            className={`px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all squish-tap flex items-center gap-1 shrink-0 ${
              selectedLetterFilter === 'all'
                ? 'bg-amber-500 text-white shadow-md border-2 border-amber-600 scale-105'
                : 'bg-white/80 text-amber-900 border border-amber-200 hover:bg-white'
            }`}
          >
            <Dices className="w-4 h-4" />
            <span>All Sounds (26)</span>
          </button>

          {/* 26 Letters */}
          {allLetters.map((l) => {
            const isSelected = selectedLetterFilter === l.id;
            return (
              <button
                key={l.id}
                onClick={() => handleFilterLetter(l.id)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl text-base sm:text-lg font-black shrink-0 transition-all squish-tap flex items-center justify-center border-2 ${
                  isSelected
                    ? 'scale-115 shadow-md ring-3 ring-amber-400 font-extrabold'
                    : 'opacity-85 hover:opacity-100 hover:scale-105'
                }`}
                style={{
                  backgroundColor: l.colorTheme.badgeBg,
                  borderColor: l.colorTheme.primary,
                  color: l.colorTheme.text,
                }}
                aria-label={`Filter by letter ${l.symbol}`}
              >
                {l.symbol}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Play Area */}
      <main className="flex-1 flex flex-col items-center justify-center my-2 sm:my-3">
        {/* Companion Milo with speech bubble */}
        <CharacterMilo
          size="md"
          speechBubble={miloSpeech}
          className="mb-2 sm:mb-3"
          onTap={() => {
            setMiloSpeech(currentObject.spokenIntro);
            audioService.playPhonemeWordBlend(
              currentLetter.phonemeAudioId,
              currentObject.wordAudioId,
              currentObject.name
            );
          }}
        />

        {/* Central Surprise Object Stage */}
        <div className="relative w-full max-w-sm flex flex-col items-center justify-center">
          {/* Glowing Aura Background */}
          <div
            className="absolute inset-0 rounded-full filter blur-2xl opacity-40 animate-pulse-glow"
            style={{ backgroundColor: currentObject.accentColor }}
          />

          {/* Huge Interactive Object Card */}
          <button
            onClick={handleTapObject}
            aria-label={`Tap ${currentObject.name}`}
            className={`squish-tap relative w-60 h-60 sm:w-72 sm:h-72 rounded-5xl border-8 shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 focus:outline-none ${
              isObjectAnimating
                ? 'scale-110 rotate-3 shadow-[0_20px_35px_rgba(0,0,0,0.15)]'
                : 'hover:scale-104 shadow-[0_12px_24px_rgba(0,0,0,0.1)]'
            }`}
            style={{
              backgroundColor: currentObject.bgColor,
              borderColor: currentObject.accentColor,
            }}
          >
            {/* Sparkle badge on top */}
            <div
              className="absolute -top-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md border-3 border-white animate-bounce-gentle"
              style={{ backgroundColor: currentObject.accentColor }}
            >
              <Sparkles className="w-6 h-6" />
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
              className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-black font-fun tracking-wide capitalize"
              style={{ color: currentObject.accentColor }}
            >
              {currentObject.name}
            </span>
          </button>
        </div>
      </main>

      {/* Toddler-Friendly Action Controls: Repeat, Surprise Me, & Next */}
      <footer className="w-full flex justify-center items-center gap-3 sm:gap-4 pt-2 pb-2">
        {/* Repeat Button */}
        <button
          onClick={handleRepeat}
          aria-label="Play sound again"
          className="squish-tap w-16 h-16 sm:w-20 sm:h-20 rounded-3xl sm:rounded-4xl bg-white text-amber-700 border-4 border-amber-300 shadow-[0_5px_0_#D97706] flex flex-col items-center justify-center shrink-0"
        >
          <RotateCcw className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
          <span className="text-[10px] sm:text-xs font-black mt-0.5">Again</span>
        </button>

        {/* Surprise Me Button (Random jump) */}
        <button
          onClick={handleSurprise}
          aria-label="Random Surprise"
          className="squish-tap flex-1 max-w-[170px] sm:max-w-[210px] h-16 sm:h-20 rounded-3xl sm:rounded-4xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-4 border-purple-400 shadow-[0_6px_0_#6D28D9] flex items-center justify-center gap-2 font-black text-lg sm:text-2xl"
        >
          <Dices className="w-6 h-6 sm:w-7 sm:h-7 animate-wiggle" />
          <span>Surprise!</span>
        </button>

        {/* Big Next Button */}
        <button
          onClick={handleNext}
          aria-label="Next Sound"
          className="squish-tap flex-1 max-w-[150px] sm:max-w-[190px] h-16 sm:h-20 rounded-3xl sm:rounded-4xl bg-bubble-yellow text-amber-950 border-4 border-amber-300 shadow-[0_6px_0_#D97706] flex items-center justify-center gap-2 font-black text-lg sm:text-2xl"
        >
          <span>Next</span>
          <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3]" />
        </button>
      </footer>
    </div>
  );
};
