import React from 'react';
import { getAllLetters } from '../../data/lettersData';
import { audioService } from '../../services/audioService';
import { progressService } from '../../services/progressService';
import { Home } from 'lucide-react';

interface LetterSelectScreenProps {
  onSelectLetter: (letterId: string) => void;
  onGoHome: () => void;
}

export const LetterSelectScreen: React.FC<LetterSelectScreenProps> = ({
  onSelectLetter,
  onGoHome,
}) => {
  const letters = getAllLetters();
  const upcomingLetters = ['T', 'P', 'B', 'D', 'C', 'F', 'R'];

  const handleChoose = (letterId: string, phonemeSpoken: string) => {
    audioService.playChime();
    audioService.speakPhoneme(phonemeSpoken);
    progressService.recordLetterInteraction(letterId);
    onSelectLetter(letterId);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 max-w-4xl mx-auto relative z-10 select-none">
      {/* Top Header */}
      <header className="flex justify-between items-center w-full mb-4">
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

        <h1 className="text-3xl sm:text-4xl font-black font-fun text-amber-900 tracking-wide">
          Letters 🔤
        </h1>

        <div className="w-16 h-16" /> {/* Placeholder balance */}
      </header>

      {/* Main Active Letters Grid */}
      <main className="flex-1 flex flex-col items-center justify-center my-2">
        <div className="text-center mb-6">
          <p className="text-xl sm:text-2xl font-black text-amber-800">
            Touch a letter to explore!
          </p>
        </div>

        {/* 3 Giant Active Letter Tiles: M, S, A */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 w-full max-w-2xl px-2">
          {letters.map((letter) => (
            <button
              key={letter.id}
              onClick={() => handleChoose(letter.id, letter.phonemeSpoken)}
              className="squish-tap relative flex flex-col items-center justify-between p-6 rounded-5xl border-8 shadow-xl cursor-pointer hover:scale-105 transition-all duration-200 focus:outline-none min-h-[220px]"
              style={{
                backgroundColor: letter.colorTheme.bg,
                borderColor: letter.colorTheme.primary,
                boxShadow: `0 12px 0 ${letter.colorTheme.primary}40`,
              }}
            >
              {/* Top Letter Symbol */}
              <span
                className="text-7xl sm:text-8xl font-black font-fun leading-none mt-2 drop-shadow-sm"
                style={{ color: letter.colorTheme.text }}
              >
                {letter.symbol}
              </span>

              {/* Phoneme Label */}
              <div
                className="px-4 py-1.5 rounded-full text-xl font-black mt-2"
                style={{
                  backgroundColor: letter.colorTheme.badgeBg,
                  color: letter.colorTheme.text,
                }}
              >
                "{letter.phoneme}"
              </div>

              {/* Preview 3 object emojis */}
              <div className="flex gap-2 text-2xl mt-4 bg-white/70 px-3 py-1 rounded-2xl">
                {letter.objects.slice(0, 3).map((obj) => (
                  <span key={obj.id}>{obj.emoji}</span>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* Upcoming Letters (M S A T P B D C F R) */}
        <div className="mt-8 text-center w-full max-w-xl">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            More Letters Coming Soon
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {upcomingLetters.map((char) => (
              <div
                key={char}
                className="w-11 h-11 rounded-2xl bg-white/60 border border-gray-200 text-gray-400 flex items-center justify-center font-bold text-lg"
              >
                {char}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-2">
        <p className="text-amber-800/60 font-semibold text-sm">
          Listen to the sounds and find friendly objects! 🌟
        </p>
      </footer>
    </div>
  );
};
