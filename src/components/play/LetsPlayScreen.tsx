import React, { useState, useEffect, useRef } from 'react';
import { CharacterMilo } from '../common/CharacterMilo';
import { triggerGentleConfetti } from '../common/ParticleEffects';
import { audioService } from '../../services/audioService';
import { progressService } from '../../services/progressService';
import { lettersData, getLetterById } from '../../data/lettersData';
import { PhonicsObject } from '../../types/phonics';
import { ArrowRight, RotateCcw, Home, Sparkles } from 'lucide-react';

interface LetsPlayScreenProps {
  onGoHome: () => void;
  onExploreLetter: (letterId: string) => void;
}

export const LetsPlayScreen: React.FC<LetsPlayScreenProps> = ({
  onGoHome,
}) => {
  // All objects available across M, S, A
  // Ordered intentionally to highlight M (Monkey, Moon, Milk, Mouse, Mango) first!
  const allObjects: PhonicsObject[] = [
    ...lettersData['m'].objects,
    ...lettersData['s'].objects,
    ...lettersData['a'].objects,
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isObjectAnimating, setIsObjectAnimating] = useState(false);
  const [isLetterAnimating, setIsLetterAnimating] = useState(false);
  const [miloSpeech, setMiloSpeech] = useState<string | null>("Hi! Let's find some sounds!");
  const hasIntroduced = useRef(false);

  const currentObject = allObjects[currentIndex];
  const currentLetter = getLetterById(currentObject.letterId);

  // Intro sequence: "Hi! Let's find some sounds!" -> "Mmmm... monkey!"
  useEffect(() => {
    let cancel = false;

    const playIntroSequence = async () => {
      if (!hasIntroduced.current) {
        hasIntroduced.current = true;
        setMiloSpeech("Hi! Let's find some sounds!");
        await audioService.playVoice('prompt.find-sounds');
        if (cancel) return;
      }

      // Introduce object sound via Oxford sound + slow British word
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
    const nextIdx = (currentIndex + 1) % allObjects.length;
    const nextObj = allObjects[nextIdx];
    audioService.preload([currentObject.wordAudioId, nextObj.wordAudioId, currentLetter.phonemeAudioId]);

    return () => {
      cancel = true;
    };
  }, [currentIndex]);

  // Tapping the Object: Animate, sound effect, repeat spoken name, gentle sparkles
  const handleTapObject = () => {
    setIsObjectAnimating(true);
    progressService.recordObjectInteraction(currentObject.id, currentObject.letterId);

    // Play tactile sound effect
    audioService.playSoundEffect(currentObject.soundType);

    // Speak phoneme + word via Oxford sound + slow British word
    setMiloSpeech(currentObject.spokenIntro);
    audioService.playPhonemeWordBlend(
      currentLetter.phonemeAudioId,
      currentObject.wordAudioId,
      currentObject.name
    );

    // Gentle visual celebration
    triggerGentleConfetti();

    setTimeout(() => {
      setIsObjectAnimating(false);
    }, 600);
  };

  // Tapping the Letter badge: Animate, play boing, pronounce phoneme
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

  // Move to next surprise
  const handleNext = () => {
    audioService.playPop();
    const nextIdx = (currentIndex + 1) % allObjects.length;
    setCurrentIndex(nextIdx);
  };

  // Repeat current surprise
  const handleRepeat = () => {
    handleTapObject();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 max-w-4xl mx-auto relative z-10 select-none">
      {/* Top Bar with Big Home button */}
      <header className="flex justify-between items-center w-full">
        <button
          onClick={() => {
            audioService.playPop();
            onGoHome();
          }}
          aria-label="Go Home"
          className="w-16 h-16 rounded-3xl bg-white shadow-md border-3 border-amber-200 flex items-center justify-center text-amber-700 squish-tap"
        >
          <Home className="w-8 h-8" />
        </button>

        {/* Big Letter Sound Badge */}
        <button
          onClick={handleTapLetter}
          aria-label={`Letter ${currentLetter.symbol}`}
          className={`px-6 py-2 rounded-full border-4 shadow-lg squish-tap flex items-center gap-3 transition-transform ${
            isLetterAnimating ? 'scale-115 rotate-6' : 'hover:scale-105'
          }`}
          style={{
            backgroundColor: currentLetter.colorTheme.badgeBg,
            borderColor: currentLetter.colorTheme.primary,
          }}
        >
          <span
            className="text-4xl sm:text-5xl font-black font-fun drop-shadow"
            style={{ color: currentLetter.colorTheme.text }}
          >
            {currentLetter.symbol}
          </span>
          <span
            className="text-2xl sm:text-3xl font-extrabold"
            style={{ color: currentLetter.colorTheme.text }}
          >
            "{currentLetter.phoneme}"
          </span>
        </button>
      </header>

      {/* Main Play Area */}
      <main className="flex-1 flex flex-col items-center justify-center my-2 sm:my-4">
        {/* Companion Milo with speech bubble */}
        <CharacterMilo
          size="md"
          speechBubble={miloSpeech}
          className="mb-3"
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
            className={`squish-tap relative w-64 h-64 sm:w-72 sm:h-72 rounded-5xl border-8 shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 focus:outline-none ${
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

            {/* Friendly Object Name (Visual reinforcement) */}
            <span
              className="mt-3 text-2xl sm:text-3xl font-black font-fun tracking-wide capitalize"
              style={{ color: currentObject.accentColor }}
            >
              {currentObject.name}
            </span>
          </button>
        </div>
      </main>

      {/* Toddler-Friendly Action Controls: Repeat & Next */}
      <footer className="w-full flex justify-center items-center gap-4 sm:gap-6 pt-2 pb-4">
        {/* Repeat Button */}
        <button
          onClick={handleRepeat}
          aria-label="Play sound again"
          className="squish-tap w-20 h-20 sm:w-24 sm:h-24 rounded-4xl bg-white text-amber-600 border-4 border-amber-300 shadow-[0_6px_0_#D97706] flex flex-col items-center justify-center"
        >
          <RotateCcw className="w-9 h-9 stroke-[2.5]" />
          <span className="text-xs font-bold mt-1">Again</span>
        </button>

        {/* Big Next Surprise Button */}
        <button
          onClick={handleNext}
          aria-label="Next Surprise"
          className="squish-tap flex-1 max-w-xs h-20 sm:h-24 rounded-4xl bg-bubble-yellow text-amber-950 border-4 border-amber-300 shadow-[0_8px_0_#D97706] flex items-center justify-center gap-3 font-black text-2xl sm:text-3xl"
        >
          <span>Next</span>
          <ArrowRight className="w-8 h-8 stroke-[3]" />
        </button>
      </footer>
    </div>
  );
};
