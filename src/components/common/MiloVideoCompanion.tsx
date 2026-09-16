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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [isHappyTap, setIsHappyTap] = useState(false);
  const [activeSrc, setActiveSrc] = useState<string>(VIDEO_PATHS[state]);

  // Handle state changes and fallback to hungry video if specific video is pending
  useEffect(() => {
    const targetPath = VIDEO_PATHS[state];
    setActiveSrc(targetPath);
    setVideoError(false);
  }, [state]);

  // If a specific state video fails to load (e.g. not yet provided), fallback to hungry video first
  const handleVideoError = () => {
    if (activeSrc !== VIDEO_PATHS.hungry) {
      setActiveSrc(VIDEO_PATHS.hungry);
    } else {
      setVideoError(true);
    }
  };

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
        {!videoError ? (
          <div className="relative w-full h-full rounded-4xl overflow-hidden shadow-xl border-4 border-amber-200 bg-[#F8F4EA]">
            {/* Center-cropped 1:1 Video Container */}
            <video
              ref={videoRef}
              key={activeSrc}
              src={activeSrc}
              autoPlay
              loop
              muted
              playsInline
              onError={handleVideoError}
              className={`w-full h-full object-cover object-center transition-all duration-300 ${
                state === 'chewing' ? 'scale-105 animate-wiggle-repeat' : ''
              } ${state === 'curious' ? '-rotate-3 scale-98' : ''}`}
            />

            {/* Listening Sound Wave Rings */}
            {isListening && (
              <div className="absolute top-3 right-3 bg-amber-400 text-amber-950 px-2 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow-md border-2 border-white animate-pulse">
                <span>👂</span>
                <span className="hidden sm:inline">Listening</span>
              </div>
            )}

            {/* Eating / Drop Target Glow Overlay when dragging over Milo */}
            {isTargetOver && (
              <div className="absolute inset-0 bg-amber-400/20 backdrop-blur-[1px] flex items-center justify-center border-4 border-dashed border-amber-400 rounded-4xl animate-pulse">
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
