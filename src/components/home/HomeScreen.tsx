import React, { useEffect, useState } from 'react';
import { CharacterMilo } from '../common/CharacterMilo';
import { BigButton } from '../common/BigButton';
import { audioService } from '../../services/audioService';
import { Settings, Volume2, VolumeX } from 'lucide-react';

interface HomeScreenProps {
  onStartPlay: () => void;
  onOpenSoundTrain: () => void;
  onOpenLetters: () => void;
  onOpenOxfordSounds: () => void;
  onOpenParentGate: () => void;
  onTeaserClick?: (title: string, message: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartPlay,
  onOpenSoundTrain,
  onOpenLetters,
  onOpenOxfordSounds,
  onOpenParentGate,
  onTeaserClick: _onTeaserClick,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [miloSpeech, setMiloSpeech] = useState<string | null>("Hi! Let's play!");

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

  const handleToggleMute = () => {
    const muted = audioService.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 max-w-4xl mx-auto relative z-10">
      {/* Top Header: Discreet Parent Gate & Sound Toggle */}
      <header className="flex justify-between items-center w-full mb-2">
        <button
          onClick={handleToggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          className="w-14 h-14 rounded-2xl bg-white/90 shadow-md border-2 border-amber-200 flex items-center justify-center text-amber-800 squish-tap"
        >
          {isMuted ? <VolumeX className="w-7 h-7 text-red-500" /> : <Volume2 className="w-7 h-7 text-amber-700" />}
        </button>

        {/* Small Discreet Parent Gate */}
        <button
          onClick={onOpenParentGate}
          aria-label="Parents Dashboard"
          className="px-3 py-2 rounded-2xl bg-white/80 hover:bg-white text-gray-400 hover:text-gray-700 text-xs font-bold border border-gray-200 shadow-sm flex items-center gap-1.5 squish-tap"
        >
          <Settings className="w-4 h-4" />
          <span>Parents</span>
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
          size="lg"
          speechBubble={miloSpeech}
          className="mb-4"
          onTap={() => {
            setMiloSpeech("Yay! Let's have fun!");
            audioService.playVoice('prompt.have-fun');
          }}
        />

        {/* Two Main Toddler Adventures: Sound Sets & Sound Train */}
        <div className="w-full max-w-xl px-2 mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <BigButton
            variant="yellow"
            size="lg"
            onClick={onStartPlay}
            className="w-full animate-pulse-glow"
            icon={<span className="text-4xl sm:text-5xl">🦁</span>}
            label="Let's Play!"
            badge="Sound Sets 🌱"
          />

          <BigButton
            variant="green"
            size="lg"
            onClick={onOpenSoundTrain}
            className="w-full"
            icon={<span className="text-4xl sm:text-5xl">🚂</span>}
            label="Sound Train!"
            badge="Blend Words 🔤"
          />
        </div>

        {/* Secondary Toddler Choices - 2x2 Balanced Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-2xl px-2">
          {/* Letters Screen */}
          <BigButton
            variant="coral"
            size="lg"
            onClick={onOpenLetters}
            icon={<span className="text-4xl sm:text-5xl">🔤</span>}
            label="Letters"
            className="w-full"
          />

          {/* British Sounds Screen */}
          <BigButton
            variant="sky"
            size="lg"
            onClick={onOpenOxfordSounds}
            icon={<span className="text-4xl sm:text-5xl">🇬🇧</span>}
            label="Sounds"
            badge="Oxford"
            className="w-full"
          />
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
