import React, { useEffect, useState } from 'react';
import { CharacterMilo } from '../common/CharacterMilo';
import { BigButton } from '../common/BigButton';
import { audioService } from '../../services/audioService';
import { progressService } from '../../services/progressService';
import { Settings, Star } from 'lucide-react';

interface HomeScreenProps {
  onStartPlay: () => void;
  onOpenSoundTrain: () => void;
  onOpenBubblePop: () => void;
  onOpenFeedMilo: () => void;
  onOpenLetters: () => void;
  onOpenOxfordSounds: () => void;
  onOpenParentGate: () => void;
  onTeaserClick?: (title: string, message: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartPlay,
  onOpenSoundTrain,
  onOpenBubblePop,
  onOpenFeedMilo,
  onOpenLetters,
  onOpenOxfordSounds,
  onOpenParentGate,
  onTeaserClick: _onTeaserClick,
}) => {
  const [miloSpeech, setMiloSpeech] = useState<string | null>("Hi! Let's play!");
  const [progress, setProgress] = useState(progressService.getProgress());

  useEffect(() => {
    const unsub = progressService.subscribe((p) => setProgress(p));
    return unsub;
  }, []);

  const isToddlerMode = progress.toddlerFocusMode !== false;

  useEffect(() => {
    // Warm greeting on entry
    const timer = setTimeout(() => {
      audioService.playVoice('prompt.lets-play');
    }, 400);

    const speechTimer = setTimeout(() => {
      setMiloSpeech("Touch anything!");
    }, 4500);

    return () => {
      clearTimeout(timer);
      clearTimeout(speechTimer);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 max-w-4xl mx-auto relative z-10">
      {/* Top Header: Star Bank Counter & Discreet Parent Gate */}
      <header className="flex justify-between items-center w-full mb-2">
        {/* Child-Friendly Star Bank Badge */}
        <div className="flex items-center gap-1.5 bg-white/95 px-4 py-2.5 rounded-full border-3 border-amber-200 shadow-[0_4px_0_#FDE68A] shrink-0 font-black text-sm text-amber-700 select-none">
          <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
          <span>{progress.totalStars} Stars</span>
        </div>

        {/* Small Discreet Parent Gate */}
        <button
          onClick={onOpenParentGate}
          aria-label="Parents Dashboard"
          className="px-3.5 py-2.5 rounded-2xl bg-white/90 hover:bg-white text-gray-500 hover:text-gray-800 text-xs font-bold border-2 border-amber-200 shadow-[0_3px_0_#FDE68A] flex items-center gap-1.5 squish-tap cursor-pointer transition-transform active:scale-95"
        >
          <Settings className="w-4 h-4 text-amber-600" />
          <span className="text-amber-950 font-black">Parents</span>
        </button>
      </header>

      {/* Hero: Friendly Milo Lion Companion & Title */}
      <main className="flex-1 flex flex-col items-center justify-center my-2 sm:my-3">
        {/* Brand Title */}
        <div className="text-center mb-3 sm:mb-4">
          <h1 className="text-4xl sm:text-5xl font-black font-fun text-amber-950 tracking-tight flex items-center justify-center gap-2 drop-shadow-xs">
            <span>Milo Phonics</span>
            <span className="text-3xl sm:text-4xl">🇬🇧</span>
          </h1>
          <p className="text-xs sm:text-sm font-extrabold text-amber-800/80 mt-0.5">
            Pure British Sounds for Little Learners
          </p>
        </div>

        <CharacterMilo
          size="md"
          speechBubble={miloSpeech}
          className="mb-3 sm:mb-4"
          onTap={() => {
            setMiloSpeech("Yay! Let's have fun!");
            audioService.playVoice('prompt.have-fun');
          }}
        />

        {/* Toddler Activities Grid: 2 - 1 - 2 Symmetrical Layout */}
        <div className="w-full max-w-xl px-2 mb-3 sm:mb-5 flex flex-col gap-2.5 sm:gap-3.5">
          {/* Row 1: Core Exploration & Blending */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
            <BigButton
              variant="yellow"
              size="lg"
              onClick={onStartPlay}
              className="w-full animate-pulse-glow"
              icon={<span className="text-3xl sm:text-5xl">🦁</span>}
              label="Let's Play!"
              badge="Sound Sets 🌱"
            />

            <BigButton
              variant="green"
              size="lg"
              onClick={onOpenSoundTrain}
              className="w-full"
              icon={<span className="text-3xl sm:text-5xl">🚂</span>}
              label="Sound Train!"
              badge="Blend Words 🔤"
            />
          </div>

          {/* Row 2: Interactive Toddler Minigames */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
            <BigButton
              variant="purple"
              size="lg"
              onClick={onOpenBubblePop}
              className="w-full"
              icon={<span className="text-3xl sm:text-5xl">🫧</span>}
              label="Bubble Pop!"
              badge="Listen & Pop! 👂"
            />

            <BigButton
              variant="coral"
              size="lg"
              onClick={onOpenFeedMilo}
              className="w-full"
              icon={<span className="text-3xl sm:text-5xl">🍎</span>}
              label="Feed Milo!"
              badge="Munch Sounds! 😋"
            />
          </div>

          {/* Row 3: Reference & Sound Explorers (Hidden in Toddler Focus Mode) */}
          {!isToddlerMode && (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
              <BigButton
                variant="white"
                size="lg"
                onClick={onOpenLetters}
                icon={<span className="text-3xl sm:text-5xl">🔤</span>}
                label="Letters"
                className="w-full"
              />

              <BigButton
                variant="sky"
                size="lg"
                onClick={onOpenOxfordSounds}
                icon={<span className="text-3xl sm:text-5xl">🇬🇧</span>}
                label="Sounds"
                badge="Oxford"
                className="w-full"
              />
            </div>
          )}
        </div>
      </main>

      {/* Bottom Visual Encouragement */}
      <footer className="text-center py-2">
        <p className="text-amber-800/60 font-semibold text-sm">
          Tap any button to explore sounds & fun! ✨
        </p>
      </footer>
    </div>
  );
};
