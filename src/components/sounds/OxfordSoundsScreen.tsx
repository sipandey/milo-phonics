import React, { useState } from 'react';
import { audioService } from '../../services/audioService';
import { Home, Volume2, Sparkles } from 'lucide-react';

interface SoundItem {
  symbol: string;
  word: string;
}

interface SoundSection {
  title: string;
  category: 'consonants' | 'vowels' | 'diphthongs';
  color: string;
  badgeBg: string;
  items: SoundItem[];
}

const SECTIONS: SoundSection[] = [
  {
    title: 'Consonants',
    category: 'consonants',
    color: '#0284C7',
    badgeBg: '#E0F2FE',
    items: [
      { symbol: 'p', word: 'pen' },
      { symbol: 'b', word: 'bag' },
      { symbol: 't', word: 'tie' },
      { symbol: 'd', word: 'dog' },
      { symbol: 'k', word: 'key' },
      { symbol: 'g', word: 'girl' },
      { symbol: 'm', word: 'man' },
      { symbol: 'n', word: 'nose' },
      { symbol: 'ŋ', word: 'singer' },
      { symbol: 'f', word: 'fall' },
      { symbol: 'v', word: 'van' },
      { symbol: 'θ', word: 'thin' },
      { symbol: 'ð', word: 'this' },
      { symbol: 's', word: 'see' },
      { symbol: 'z', word: 'zoo' },
      { symbol: 'ʃ', word: 'shoe' },
      { symbol: 'ʒ', word: 'genre' },
      { symbol: 'tʃ', word: 'chain' },
      { symbol: 'dʒ', word: 'jazz' },
      { symbol: 'l', word: 'leg' },
      { symbol: 'r', word: 'red' },
      { symbol: 'h', word: 'house' },
      { symbol: 'x', word: 'Hanukkah' },
      { symbol: 'j', word: 'yes' },
      { symbol: 'w', word: 'wet' },
    ],
  },
  {
    title: 'Vowels',
    category: 'vowels',
    color: '#DC2626',
    badgeBg: '#FEE2E2',
    items: [
      { symbol: 'iː', word: 'eat' },
      { symbol: 'i', word: 'anyway' },
      { symbol: 'ɪ', word: 'if' },
      { symbol: 'e', word: 'egg' },
      { symbol: 'æ', word: 'add' },
      { symbol: 'ə', word: 'about' },
      { symbol: 'ɜː', word: 'earth' },
      { symbol: 'ʌ', word: 'up' },
      { symbol: 'uː', word: 'ooze' },
      { symbol: 'u', word: 'actual' },
      { symbol: 'ʊ', word: 'oops' },
      { symbol: 'ɔː', word: 'order' },
      { symbol: 'ɒ', word: 'on' },
      { symbol: 'ɑː', word: 'arm' },
    ],
  },
  {
    title: 'Diphthongs',
    category: 'diphthongs',
    color: '#7C3AED',
    badgeBg: '#EDE9FE',
    items: [
      { symbol: 'eɪ', word: 'eight' },
      { symbol: 'əʊ', word: 'open' },
      { symbol: 'aɪ', word: 'ice' },
      { symbol: 'aʊ', word: 'out' },
      { symbol: 'ɔɪ', word: 'oil' },
      { symbol: 'ɪə', word: 'ear' },
      { symbol: 'eə', word: 'airport' },
      { symbol: 'ʊə', word: 'tourist' },
    ],
  },
];

interface OxfordSoundsScreenProps {
  onGoHome: () => void;
}

export const OxfordSoundsScreen: React.FC<OxfordSoundsScreenProps> = ({ onGoHome }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'consonants' | 'vowels' | 'diphthongs'>('all');
  const [activePlayingKey, setActivePlayingKey] = useState<string | null>(null);

  const handlePlaySound = async (symbol: string, kind: 'isolation' | 'words') => {
    const playKey = `${symbol}-${kind}`;
    setActivePlayingKey(playKey);
    try {
      await audioService.playOxfordSound(symbol, kind, { interrupt: true });
    } finally {
      setActivePlayingKey((current) => (current === playKey ? null : current));
    }
  };

  const filteredSections =
    selectedCategory === 'all'
      ? SECTIONS
      : SECTIONS.filter((s) => s.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 max-w-5xl mx-auto relative z-10 select-none font-fun">
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

        <div className="text-center">
          <h1 className="text-2xl sm:text-4xl font-black text-amber-900 tracking-wide flex items-center justify-center gap-2">
            British Sounds 🇬🇧
          </h1>
          <p className="text-xs sm:text-sm font-bold text-amber-700/80 mt-0.5">
            Oxford Dictionary Authentic Audio
          </p>
        </div>

        <div className="w-16 h-16" />
      </header>

      {/* Category Filter Pills */}
      <div className="flex justify-center gap-2 sm:gap-3 mb-6 flex-wrap">
        {[
          { id: 'all', label: 'All Sounds (47)' },
          { id: 'consonants', label: 'Consonants (25)' },
          { id: 'vowels', label: 'Vowels (14)' },
          { id: 'diphthongs', label: 'Diphthongs (8)' },
        ].map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                audioService.playPop();
                setSelectedCategory(tab.id as typeof selectedCategory);
              }}
              className={`px-4 py-2 rounded-2xl text-sm sm:text-base font-black transition-all squish-tap ${
                isActive
                  ? 'bg-amber-500 text-white shadow-md scale-105 border-2 border-amber-600'
                  : 'bg-white/80 text-amber-800 border-2 border-amber-200 hover:bg-amber-100/50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Sounds Sections */}
      <main className="flex-1 space-y-8 pb-8">
        {filteredSections.map((section) => (
          <section key={section.title} className="space-y-3">
            <div className="flex items-center gap-2 border-b-2 border-amber-200/80 pb-2">
              <Sparkles className="w-5 h-5" style={{ color: section.color }} />
              <h2 className="text-xl sm:text-2xl font-black text-gray-800">
                {section.title}
              </h2>
              <span className="text-xs font-bold text-gray-400 bg-white/80 px-2.5 py-0.5 rounded-full border border-gray-200">
                {section.items.length}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {section.items.map((item) => {
                const isIsoPlaying = activePlayingKey === `${item.symbol}-isolation`;
                const isWordPlaying = activePlayingKey === `${item.symbol}-words`;

                return (
                  <div
                    key={item.symbol}
                    className="bg-white rounded-3xl p-3 border-3 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[140px]"
                    style={{ borderColor: section.color + '40' }}
                  >
                    {/* Phoneme Symbol Button (Tap for isolated sound) */}
                    <button
                      onClick={() => handlePlaySound(item.symbol, 'isolation')}
                      className={`squish-tap w-full py-2.5 rounded-2xl flex items-center justify-center gap-1.5 transition-all ${
                        isIsoPlaying
                          ? 'scale-95 shadow-inner'
                          : 'hover:scale-[1.02]'
                      }`}
                      style={{
                        backgroundColor: isIsoPlaying ? section.color : section.badgeBg,
                        color: isIsoPlaying ? '#FFFFFF' : section.color,
                      }}
                      title={`Play isolated sound /${item.symbol}/`}
                    >
                      <span className="text-2xl sm:text-3xl font-black leading-none">
                        /{item.symbol}/
                      </span>
                      <Volume2 className={`w-4 h-4 ${isIsoPlaying ? 'animate-pulse' : 'opacity-60'}`} />
                    </button>

                    {/* Example Word Button (Tap for Oxford spoken word) */}
                    <button
                      onClick={() => handlePlaySound(item.symbol, 'words')}
                      className={`squish-tap w-full mt-2 py-2 px-3 rounded-2xl text-center border-2 transition-all flex items-center justify-between ${
                        isWordPlaying
                          ? 'bg-amber-100 border-amber-400 text-amber-900 scale-95'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                      }`}
                      title={`Play example word "${item.word}"`}
                    >
                      <span className="text-xs font-semibold text-gray-400">e.g.</span>
                      <span className="text-base sm:text-lg font-black capitalize">
                        {item.word}
                      </span>
                      <span className="text-xs text-amber-600 font-bold">🔊</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 bg-white/60 backdrop-blur-sm rounded-3xl border border-amber-200/60 mt-4">
        <p className="text-xs sm:text-sm font-semibold text-amber-900/70">
          Audio recordings directly from the{' '}
          <span className="font-black text-amber-900">Oxford Advanced Learner's Dictionary</span>.
          Tap a phonetic symbol for the isolated sound, or tap the word for the spoken word.
        </p>
      </footer>
    </div>
  );
};
