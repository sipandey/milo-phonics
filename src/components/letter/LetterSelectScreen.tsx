import React, { useState } from 'react';
import { getAllLetters } from '../../data/lettersData';
import { audioService } from '../../services/audioService';
import { progressService } from '../../services/progressService';
import { Home, Volume2 } from 'lucide-react';

interface LetterSelectScreenProps {
  onSelectLetter: (letterId: string) => void;
  onGoHome: () => void;
}

export const LetterSelectScreen: React.FC<LetterSelectScreenProps> = ({
  onSelectLetter,
  onGoHome,
}) => {
  const letters = getAllLetters();
  const [playingLetterId, setPlayingLetterId] = useState<string | null>(null);

  const handlePlaySoundOnly = (e: React.MouseEvent, phonemeAudioId: string, letterId: string) => {
    e.stopPropagation();
    setPlayingLetterId(letterId);
    audioService.playVoice(phonemeAudioId);
    progressService.recordLetterInteraction(letterId);
    setTimeout(() => {
      setPlayingLetterId(null);
    }, 800);
  };

  const handleChoose = (letterId: string, phonemeAudioId: string) => {
    setPlayingLetterId(letterId);
    audioService.playChime();
    audioService.playVoice(phonemeAudioId);
    progressService.recordLetterInteraction(letterId);
    setTimeout(() => {
      onSelectLetter(letterId);
    }, 220);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 max-w-4xl mx-auto relative z-10 select-none touch-pan-y pb-16 sm:pb-10">
      {/* Top Header - Sticky so Home is always accessible when scrolling */}
      <header className="sticky top-0 z-20 bg-bubble-cream/90 backdrop-blur-md py-2 flex justify-between items-center w-full mb-3 rounded-2xl">
        <button
          onClick={() => {
            audioService.playPop();
            onGoHome();
          }}
          aria-label="Go Home"
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white shadow-md border-3 border-amber-200 flex items-center justify-center text-amber-700 squish-tap"
        >
          <Home className="w-7 h-7 sm:w-8 sm:h-8" />
        </button>

        <h1 className="text-3xl sm:text-4xl font-black font-fun text-amber-900 tracking-wide">
          Letters 🔤
        </h1>

        <div className="w-14 sm:w-16" /> {/* Placeholder balance */}
      </header>

      {/* Main Active Letters Grid */}
      <main className="flex-1 flex flex-col items-center justify-center my-2">
        <div className="text-center mb-6">
          <p className="text-xl sm:text-2xl font-black text-amber-800">
            Touch a letter to explore! 🔊
          </p>
          <p className="text-sm font-semibold text-amber-700/70 mt-1">
            Tap sound buttons to hear Oxford British English phonemes
          </p>
        </div>

        {/* Responsive 26-Letter Alphabet Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 w-full max-w-4xl px-2">
          {letters.map((letter) => {
            const isPlaying = playingLetterId === letter.id;
            return (
              <div
                key={letter.id}
                onClick={() => handleChoose(letter.id, letter.phonemeAudioId)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleChoose(letter.id, letter.phonemeAudioId);
                  }
                }}
                className={`squish-tap relative flex flex-col items-center justify-between p-4 sm:p-5 rounded-4xl border-4 shadow-md cursor-pointer hover:scale-105 transition-all duration-200 focus:outline-none min-h-[175px] ${
                  isPlaying ? 'scale-105 ring-4 ring-amber-400' : ''
                }`}
                style={{
                  backgroundColor: letter.colorTheme.bg,
                  borderColor: letter.colorTheme.primary,
                  boxShadow: `0 6px 0 ${letter.colorTheme.primary}30`,
                }}
              >
                {/* Speaker icon in corner for instant sound playback */}
                <button
                  onClick={(e) => handlePlaySoundOnly(e, letter.phonemeAudioId, letter.id)}
                  aria-label={`Listen to Oxford sound for ${letter.symbol}`}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center shadow-sm text-white hover:scale-115 active:scale-95 transition-transform"
                  style={{ backgroundColor: letter.colorTheme.primary }}
                >
                  <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-bounce' : ''}`} />
                </button>

                {/* Top Letter Symbol */}
                <span
                  className={`text-5xl sm:text-6xl font-black font-fun leading-none drop-shadow-sm transition-transform ${
                    isPlaying ? 'scale-110' : ''
                  }`}
                  style={{ color: letter.colorTheme.text }}
                >
                  {letter.symbol}
                </span>

                {/* Phoneme Label - clickable sound pill */}
                <button
                  onClick={(e) => handlePlaySoundOnly(e, letter.phonemeAudioId, letter.id)}
                  aria-label={`Sound ${letter.phoneme}`}
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-base sm:text-lg font-black mt-1.5 hover:scale-108 active:scale-95 transition-transform shadow-xs"
                  style={{
                    backgroundColor: letter.colorTheme.badgeBg,
                    color: letter.colorTheme.text,
                  }}
                >
                  <span>{letter.phoneme}</span>
                  <Volume2 className="w-3.5 h-3.5 opacity-70" />
                </button>

                {/* Preview object emojis */}
                <div className="flex gap-1 text-xl sm:text-2xl mt-2 bg-white/70 px-2.5 py-0.5 rounded-xl">
                  {letter.objects.slice(0, 3).map((obj) => (
                    <span key={obj.id}>{obj.emoji}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-2">
        <p className="text-amber-800/60 font-semibold text-sm">
          Listen to authentic Oxford British sounds & learn to read! 🇬🇧🌟
        </p>
      </footer>
    </div>
  );
};
