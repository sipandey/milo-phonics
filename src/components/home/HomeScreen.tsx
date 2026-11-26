import React, { useEffect, useState } from 'react';
import { CharacterMilo } from '../common/CharacterMilo';
import { BigButton } from '../common/BigButton';
import { audioService } from '../../services/audioService';
import { progressService } from '../../services/progressService';
import { Settings } from 'lucide-react';

interface HomeScreenProps {
  onStartPlay: () => void;
  onOpenListenTalk: () => void;
  onOpenSoundTrain: () => void;
  onOpenBubblePop: () => void;
  onOpenFeedMilo: () => void;
  onOpenLetters: () => void;
  onOpenOxfordSounds: () => void;
  onOpenParentGate: () => void;
  onOpenToday: () => void;
  onTeaserClick?: (title: string, message: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartPlay,
  onOpenListenTalk,
  onOpenSoundTrain,
  onOpenBubblePop,
  onOpenFeedMilo,
  onOpenLetters,
  onOpenOxfordSounds,
  onOpenParentGate,
  onOpenToday,
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
      setMiloSpeech('Choose a picture or a sound.');
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
        {!isToddlerMode ? (
          <div className="flex items-center gap-1.5 bg-white/95 px-4 py-2.5 rounded-full border-3 border-amber-200 shadow-[0_4px_0_#FDE68A] shrink-0 font-black text-sm text-amber-700 select-none">
            <span>{progress.totalStars} Activity Stars</span>
          </div>
        ) : <div aria-hidden="true" />}

        {/* Small Discreet Parent Gate */}
        <button
          onClick={onOpenParentGate}
          aria-label="Parents Dashboard"
          className={`rounded-2xl bg-white/90 hover:bg-white text-gray-500 hover:text-gray-800 text-xs font-bold border-2 border-amber-200 shadow-[0_3px_0_#FDE68A] flex items-center justify-center gap-1.5 squish-tap cursor-pointer transition-transform active:scale-95 ${isToddlerMode ? 'w-12 h-12' : 'px-3.5 py-2.5'}`}
        >
          <Settings className="w-4 h-4 text-amber-600" />
          {!isToddlerMode && <span className="text-amber-950 font-black">Parents</span>}
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
            Audio-Led Letter &amp; Word Play
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

        {/* Keep the toddler start simple; the full activity menu stays available below. */}
        <div className="w-full max-w-xl px-2 mb-3 sm:mb-5 flex flex-col gap-2.5 sm:gap-3.5">
          <BigButton
            variant="green"
            size="lg"
            onClick={onOpenToday}
            icon={<span className="text-3xl sm:text-5xl">🌟</span>}
            label="Today with Milo"
            badge="Grown-up + child"
            className="w-full"
          />
          {isToddlerMode ? (
            <>
              <div className="grid grid-cols-1 gap-2.5 sm:gap-4">
                <BigButton
                  variant="sky"
                  size="lg"
                  onClick={onOpenListenTalk}
                  icon={<span className="text-3xl sm:text-5xl">💬</span>}
                  label="Listen & Talk"
                  className="w-full"
                />
                <BigButton
                  variant="yellow"
                  size="lg"
                  onClick={onStartPlay}
                  icon={<span className="text-3xl sm:text-5xl">🦁</span>}
                  label="Let's Play!"
                  className="w-full"
                />
              </div>
              <details className="w-full">
                <summary className="min-h-14 flex items-center justify-center rounded-2xl border-2 border-amber-200 bg-white/90 text-amber-950 font-black text-lg cursor-pointer select-none">
                  More games
                </summary>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4 mt-3">
                  <BigButton variant="green" size="lg" onClick={onOpenSoundTrain} icon={<span>🚂</span>} label="Sound Train" className="w-full" />
                  <BigButton variant="purple" size="lg" onClick={onOpenBubblePop} icon={<span>🫧</span>} label="Bubble Pop" className="w-full" />
                  <BigButton variant="coral" size="lg" onClick={onOpenFeedMilo} icon={<span>🍎</span>} label="Feed Milo" className="w-full" />
                  <BigButton variant="white" size="lg" onClick={onOpenLetters} icon={<span>🔤</span>} label="Letters" className="w-full" />
                  <BigButton variant="sky" size="lg" onClick={onOpenOxfordSounds} icon={<span>🎵</span>} label="Sound library" className="w-full col-span-2" />
                </div>
              </details>
            </>
          ) : (
            <>
          {/* Row 1: Core Exploration & Blending */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
            <BigButton
              variant="yellow"
              size="lg"
              onClick={onStartPlay}
              className="w-full"
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

          {/* Listening and language discovery is available before letter-based play. */}
          <div className={`grid gap-2.5 sm:gap-4 ${isToddlerMode ? 'grid-cols-1' : 'grid-cols-3'}`}>
            <BigButton
              variant="sky"
              size="lg"
              onClick={onOpenListenTalk}
              icon={<span className="text-3xl sm:text-5xl">💬</span>}
              label="Listen & Talk"
              badge="Pictures & Words"
              className="w-full"
            />

            {!isToddlerMode && (
              <>
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
                badge="Sound Library"
                className="w-full"
              />
              </>
            )}
          </div>
            </>
          )}
        </div>
      </main>

      {/* Bottom Visual Encouragement */}
      <footer className="text-center py-2">
        {!isToddlerMode && <p className="text-amber-800/60 font-semibold text-sm">Choose an activity to explore.</p>}
      </footer>
    </div>
  );
};
