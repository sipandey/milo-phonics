import React, { useState, useEffect, useRef } from 'react';
import { CharacterMilo } from './CharacterMilo';
import { audioService } from '../../services/audioService';

export type MiloVideoState = 'hungry' | 'chewing' | 'curious' | 'full';

interface MiloVideoCompanionProps {
  state?: MiloVideoState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  speechBubble?: string | null;
  onTap?: () => void;
  className?: string;
  isListening?: boolean;
  isTargetOver?: boolean;
}

const VIDEO_PATHS: Record<MiloVideoState, string> = {
  hungry: '/video/milo/milo_hungry_pose.mp4',
  chewing: '/video/milo/milo_chomp_chew.mp4',
  curious: '/video/milo/milo_curious_rethink.mp4',
  full: '/video/milo/milo_full_tummy_celebrate.mp4',
};

export const MiloVideoCompanion: React.FC<MiloVideoCompanionProps> = ({
  state = 'hungry',
  size = 'md',
  speechBubble,
  onTap,
  className = '',
  isListening = false,
  isTargetOver = false,
}) => {
  const hungryVideoRef = useRef<HTMLVideoElement>(null);
  const chewingVideoRef = useRef<HTMLVideoElement>(null);
  const [hungryError, setHungryError] = useState(false);
  const [chewingError, setChewingError] = useState(false);
  const [isHappyTap, setIsHappyTap] = useState(false);

  // Rewind and play chewing video immediately when entering 'chewing' state
  useEffect(() => {
    if (state === 'chewing' && chewingVideoRef.current && !chewingError) {
      chewingVideoRef.current.currentTime = 0;
      chewingVideoRef.current.play().catch(() => {});
    }
  }, [state, chewingError]);

  const handleTap = () => {
    setIsHappyTap(true);
    audioService.playBoing();
    setTimeout(() => setIsHappyTap(false), 800);
    if (onTap) {
      onTap();
    } else {
      audioService.playVoice('praise.random', { interrupt: false, delayMs: 150 });
    }
  };

  const sizeClasses = {
    sm: 'w-24 h-24 sm:w-28 sm:h-28',
    md: 'w-36 h-36 sm:w-44 sm:h-44',
    lg: 'w-48 h-48 sm:w-56 sm:h-56',
    xl: 'w-60 h-60 sm:w-72 sm:h-72',
  };

  const hasAnyVideo = !hungryError;
  const isChewingActive = state === 'chewing' && !chewingError;

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Speech bubble if provided and not in pure listening mode */}
      {speechBubble && !isListening && (
        <div className="mb-2 px-4 py-2 bg-white/95 backdrop-blur-sm border-2 border-amber-300 rounded-3xl shadow-lg text-amber-950 font-bold text-base sm:text-lg animate-pop-in relative max-w-xs text-center z-20">
          {speechBubble}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-amber-300 rotate-45" />
        </div>
      )}

      {/* Main Companion Container */}
      <button
        onClick={handleTap}
        aria-label="Milo the Lion companion"
        className={`relative ${sizeClasses[size]} rounded-4xl squish-tap cursor-pointer focus:outline-none transition-transform duration-300 ${
          isHappyTap
            ? 'animate-wiggle scale-110'
            : isListening
            ? 'scale-105 -rotate-2'
            : isTargetOver
            ? 'scale-110 ring-8 ring-amber-400 animate-bounce-gentle'
            : 'hover:scale-105'
        }`}
      >
        {hasAnyVideo ? (
          <div className="relative w-full h-full rounded-4xl overflow-hidden shadow-xl border-4 border-amber-200 bg-[#F8F4EA]">
            {/* Hungry Video (Default Base Pose) */}
            <video
              ref={hungryVideoRef}
              src={VIDEO_PATHS.hungry}
              autoPlay
              loop
              muted
              playsInline
              onError={() => setHungryError(true)}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-300 ${
                isChewingActive ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
              } ${state === 'curious' ? '-rotate-3 scale-98' : ''}`}
            />

            {/* Chewing Video (Instant Chomp & Chew Action) */}
            {!chewingError && (
              <video
                ref={chewingVideoRef}
                src={VIDEO_PATHS.chewing}
                autoPlay
                loop
                muted
                playsInline
                onError={() => setChewingError(true)}
                className={`absolute inset-0 w-full h-full object-cover object-center scale-108 transition-all duration-200 ${
                  isChewingActive
                    ? 'opacity-100 z-10 animate-wiggle-repeat'
                    : 'opacity-0 pointer-events-none z-0'
                }`}
              />
            )}

            {/* Listening Sound Wave Rings */}
            {isListening && (
              <div className="absolute top-3 right-3 bg-amber-400 text-amber-950 px-2 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow-md border-2 border-white animate-pulse z-20">
                <span>👂</span>
                <span className="hidden sm:inline">Listening</span>
              </div>
            )}

            {/* Eating / Drop Target Glow Overlay when dragging over Milo */}
            {isTargetOver && (
              <div className="absolute inset-0 bg-amber-400/20 backdrop-blur-[1px] flex items-center justify-center border-4 border-dashed border-amber-400 rounded-4xl animate-pulse z-20">
                <span className="text-4xl animate-bounce">😋</span>
              </div>
            )}
          </div>
        ) : (
          /* Seamless Fallback to SVG CharacterMilo */
          <CharacterMilo
            size={size}
            isListening={isListening}
            onTap={handleTap}
            className="w-full h-full"
          />
        )}
      </button>
    </div>
  );
};
