import React, { useState, useEffect, useRef } from 'react';
import { getLetterById } from '../../data/lettersData';
import { CharacterMilo } from '../common/CharacterMilo';
import { triggerGentleConfetti } from '../common/ParticleEffects';
import { audioService } from '../../services/audioService';
import { progressService } from '../../services/progressService';
import { PhonicsObject } from '../../types/phonics';
import { ArrowLeft, Home, Sparkles, Volume2 } from 'lucide-react';

interface LetterDetailScreenProps {
  letterId: string;
  onBack: () => void;
  onGoHome: () => void;
}

export const LetterDetailScreen: React.FC<LetterDetailScreenProps> = ({
  letterId,
  onBack,
  onGoHome,
}) => {
  const letter = getLetterById(letterId);
  const [selectedObjectIndex, setSelectedObjectIndex] = useState(0);
  const [isLetterAnimating, setIsLetterAnimating] = useState(false);
  const [isObjectAnimating, setIsObjectAnimating] = useState(false);
  const [miloSpeech, setMiloSpeech] = useState<string | null>(letter.phoneme);
  const hasIntroduced = useRef(false);

  const activeObject: PhonicsObject = letter.objects[selectedObjectIndex];

  // Entry sequence: Animate letter + Oxford phoneme -> show object + Oxford phoneme + slow British word
  useEffect(() => {
    let cancel = false;

    const runSequence = async () => {
      // Phase 1: Letter introduction with authentic Oxford sound
      setIsLetterAnimating(true);
      setMiloSpeech(letter.phoneme);
      await audioService.playVoice(letter.phonemeAudioId);
      if (cancel) return;
      setIsLetterAnimating(false);

      // Phase 2: Object introduction with slow word sound
      setTimeout(async () => {
        if (cancel) return;
        setIsObjectAnimating(true);
        setMiloSpeech(activeObject.spokenIntro);
        audioService.playSoundEffect('pop');
        await audioService.playVoice(activeObject.wordAudioId, { delayMs: 150 });
        if (cancel) return;
        setIsObjectAnimating(false);
      }, 500);
    };

    if (!hasIntroduced.current) {
      hasIntroduced.current = true;
      runSequence();
    }

    // Preload audio assets for this letter's objects
    audioService.preload([
      letter.phonemeAudioId,
      ...letter.objects.map(o => o.phraseAudioId),
      ...letter.objects.map(o => o.wordAudioId),
    ]);

    return () => {
      cancel = true;
    };
  }, [letterId]);

  // Handle tap on the Giant Letter (authentic Oxford sound)
  const handleTapLetter = () => {
    setIsLetterAnimating(true);
    progressService.recordLetterInteraction(letter.id);
    audioService.playBoing();
    setMiloSpeech(letter.phoneme);
    audioService.playVoice(letter.phonemeAudioId);

    setTimeout(() => {
      setIsLetterAnimating(false);
    }, 600);
  };

  // Handle tap on the Active Object (Oxford sound + slow British word)
  const handleTapObject = () => {
    setIsObjectAnimating(true);
    progressService.recordObjectInteraction(activeObject.id, letter.id);
    audioService.playSoundEffect(activeObject.soundType);
    setMiloSpeech(activeObject.spokenIntro);
    
    audioService.playPhonemeWordBlend(
      letter.phonemeAudioId,
      activeObject.wordAudioId,
      activeObject.name
    );
    triggerGentleConfetti();

    setTimeout(() => {
      setIsObjectAnimating(false);
    }, 600);
  };

  // Select another object from the objects list
  const handleSelectObject = (idx: number) => {
    if (idx === selectedObjectIndex) {
      handleTapObject();
      return;
    }
    setSelectedObjectIndex(idx);
    const newObj = letter.objects[idx];
    audioService.playPop();
    setIsObjectAnimating(true);
    setMiloSpeech(newObj.spokenIntro);

    audioService.playPhonemeWordBlend(
      letter.phonemeAudioId,
      newObj.wordAudioId,
      newObj.name
    );

    setTimeout(() => {
      setIsObjectAnimating(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 max-w-4xl mx-auto relative z-10 select-none">
      {/* Top Header */}
      <header className="flex justify-between items-center w-full">
        <div className="flex gap-2">
          <button
            onClick={() => {
              audioService.playPop();
              onBack();
            }}
            aria-label="Back to Letters"
            className="w-16 h-16 rounded-3xl bg-white shadow-md border-3 border-amber-200 flex items-center justify-center text-amber-700 squish-tap"
          >
            <ArrowLeft className="w-8 h-8" />
          </button>
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
        </div>

        {/* Milo in header corner */}
        <CharacterMilo
          size="sm"
          speechBubble={miloSpeech}
          onTap={() => {
            setMiloSpeech(activeObject.spokenIntro);
            audioService.playPhonemeWordBlend(
              letter.phonemeAudioId,
              activeObject.wordAudioId,
              activeObject.name
            );
          }}
        />
      </header>

      {/* Main Interactive Stage: Letter & Object Side-by-Side or Stacked */}
      <main className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 my-2 sm:my-4">
        {/* Giant Animated Letter Tile */}
        <button
          onClick={handleTapLetter}
          aria-label={`Letter ${letter.symbol}`}
          className={`squish-tap relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-5xl border-8 shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 focus:outline-none ${
            isLetterAnimating ? 'scale-110 -rotate-6' : 'hover:scale-104'
          }`}
          style={{
            backgroundColor: letter.colorTheme.bg,
            borderColor: letter.colorTheme.primary,
            boxShadow: `0 14px 0 ${letter.colorTheme.primary}45`,
          }}
        >
          {/* Sound Icon */}
          <div
            className="absolute top-3 right-3 p-2 rounded-2xl text-white shadow-sm"
            style={{ backgroundColor: letter.colorTheme.primary }}
          >
            <Volume2 className="w-5 h-5" />
          </div>

          {/* Letter Symbol */}
          <span
            className="text-8xl sm:text-9xl font-black font-fun drop-shadow leading-none"
            style={{ color: letter.colorTheme.text }}
          >
            {letter.symbol}
          </span>

          {/* Spoken Phoneme Badge */}
          <div
            className="mt-2 px-4 py-1 rounded-full text-xl font-black"
            style={{
              backgroundColor: letter.colorTheme.badgeBg,
              color: letter.colorTheme.text,
            }}
          >
            "{letter.phoneme}"
          </div>
        </button>

        {/* Giant Active Phonics Object */}
        <button
          onClick={handleTapObject}
          aria-label={`Object ${activeObject.name}`}
          className={`squish-tap relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-5xl border-8 shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 focus:outline-none ${
            isObjectAnimating ? 'scale-110 rotate-6' : 'hover:scale-104'
          }`}
          style={{
            backgroundColor: activeObject.bgColor,
            borderColor: activeObject.accentColor,
            boxShadow: `0 14px 0 ${activeObject.accentColor}45`,
          }}
        >
          {/* Sparkle badge */}
          <div
            className="absolute top-3 right-3 p-2 rounded-2xl text-white shadow-sm animate-bounce-gentle"
            style={{ backgroundColor: activeObject.accentColor }}
          >
            <Sparkles className="w-5 h-5" />
          </div>

          {/* Giant Object Emoji */}
          <span
            className={`text-7xl sm:text-8xl md:text-9xl transition-transform duration-300 filter drop-shadow-md ${
              isObjectAnimating ? 'scale-120 animate-wiggle' : ''
            }`}
          >
            {activeObject.emoji}
          </span>

          {/* Object Name */}
          <span
            className="mt-2 text-xl sm:text-2xl font-black font-fun tracking-wide"
            style={{ color: activeObject.accentColor }}
          >
            {activeObject.name}
          </span>
        </button>
      </main>

      {/* Object Selector Bar: 5 Objects Per Letter */}
      <footer className="w-full flex flex-col items-center pb-2">
        <p className="text-sm font-black text-amber-900/60 mb-2">
          Touch an object to see & hear:
        </p>
        <div className="flex justify-center items-center gap-3 sm:gap-4 w-full max-w-md overflow-x-auto py-2 px-2 no-scrollbar">
          {letter.objects.map((obj, idx) => {
            const isSelected = idx === selectedObjectIndex;
            return (
              <button
                key={obj.id}
                onClick={() => handleSelectObject(idx)}
                aria-label={`Select ${obj.name}`}
                className={`squish-tap w-16 h-16 sm:w-20 sm:h-20 rounded-3xl border-4 flex flex-col items-center justify-center text-3xl sm:text-4xl transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'scale-115 shadow-lg border-amber-500 bg-white ring-4 ring-amber-300'
                    : 'bg-white/80 border-gray-200 opacity-80 hover:opacity-100'
                }`}
              >
                <span>{obj.emoji}</span>
              </button>
            );
          })}
        </div>
      </footer>
    </div>
  );
};
