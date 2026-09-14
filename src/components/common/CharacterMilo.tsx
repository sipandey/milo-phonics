import React, { useState, useEffect } from 'react';
import { audioService } from '../../services/audioService';

interface CharacterMiloProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  speechBubble?: string | null;
  onTap?: () => void;
  className?: string;
}

export const CharacterMilo: React.FC<CharacterMiloProps> = ({
  size = 'md',
  speechBubble,
  onTap,
  className = '',
}) => {
  const [isTalking, setIsTalking] = useState(false);
  const [isHappy, setIsHappy] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  // Sync mouth movement with audio service speech events
  useEffect(() => {
    const unsubStart = audioService.onSpeechStart(() => setIsTalking(true));
    const unsubEnd = audioService.onSpeechEnd(() => setIsTalking(false));
    return () => {
      unsubStart();
      unsubEnd();
    };
  }, []);

  // Periodic blinking
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 220);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleTap = () => {
    setIsHappy(true);
    audioService.playBoing();
    setTimeout(() => setIsHappy(false), 800);
    if (onTap) {
      onTap();
    } else {
      audioService.speakPraise();
    }
  };

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24 sm:w-28 sm:h-28',
    lg: 'w-32 h-32 sm:w-40 sm:h-40',
    xl: 'w-44 h-44 sm:w-52 sm:h-52',
  };

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Speech bubble if provided */}
      {speechBubble && (
        <div className="mb-2 px-4 py-2 bg-white/95 backdrop-blur-sm border-2 border-bubble-coral/40 rounded-3xl shadow-lg text-bubble-coral font-bold text-base sm:text-lg animate-pop-in relative max-w-xs text-center">
          {speechBubble}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-bubble-coral/40 rotate-45" />
        </div>
      )}

      {/* Milo Interactive SVG */}
      <button
        onClick={handleTap}
        aria-label="Milo the Lion companion"
        className={`${sizeClasses[size]} squish-tap cursor-pointer focus:outline-none transition-transform duration-300 ${
          isHappy ? 'animate-wiggle scale-110' : 'hover:scale-105'
        }`}
      >
        <svg
          viewBox="0 0 160 160"
          className="w-full h-full drop-shadow-md overflow-visible"
        >
          {/* Soft Glow */}
          <circle cx="80" cy="80" r="70" fill="#FFE8B2" opacity="0.4" />

          {/* Lion Mane petals */}
          <g className="animate-wiggle-repeat origin-center">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
              <circle
                key={idx}
                cx={80 + Math.cos((angle * Math.PI) / 180) * 52}
                cy={80 + Math.sin((angle * Math.PI) / 180) * 52}
                r="24"
                fill={idx % 2 === 0 ? '#FFA043' : '#FF7E36'}
              />
            ))}
          </g>

          {/* Lion Ears */}
          <circle cx="46" cy="46" r="16" fill="#FFA043" />
          <circle cx="46" cy="46" r="9" fill="#FFD1A4" />
          <circle cx="114" cy="46" r="16" fill="#FFA043" />
          <circle cx="114" cy="46" r="9" fill="#FFD1A4" />

          {/* Lion Face Head */}
          <circle cx="80" cy="84" r="50" fill="#FFCC4D" />

          {/* Rosy Cheeks */}
          <ellipse cx="50" cy="98" rx="8" ry="5" fill="#FF8DA1" opacity="0.75" />
          <ellipse cx="110" cy="98" rx="8" ry="5" fill="#FF8DA1" opacity="0.75" />

          {/* Big Toddler Eyes */}
          {isBlinking ? (
            <g stroke="#3D2010" strokeWidth="4" strokeLinecap="round">
              <path d="M 52 82 Q 62 88 72 82" fill="none" />
              <path d="M 88 82 Q 98 88 108 82" fill="none" />
            </g>
          ) : (
            <g>
              {/* Left Eye */}
              <circle cx="62" cy="80" r="8" fill="#3D2010" />
              <circle cx="60" cy="78" r="3" fill="#FFFFFF" />
              <circle cx="64" cy="82" r="1.5" fill="#FFFFFF" />
              {/* Right Eye */}
              <circle cx="98" cy="80" r="8" fill="#3D2010" />
              <circle cx="96" cy="78" r="3" fill="#FFFFFF" />
              <circle cx="100" cy="82" r="1.5" fill="#FFFFFF" />
            </g>
          )}

          {/* Snout Muzzle */}
          <ellipse cx="80" cy="96" rx="20" ry="14" fill="#FFE8B2" />

          {/* Cute Nose */}
          <path
            d="M 74 91 C 74 88 86 88 86 91 C 86 95 81 97 80 97 C 79 97 74 95 74 91 Z"
            fill="#7C3615"
          />

          {/* Mouth (Open when talking, happy smile when idle) */}
          {isTalking ? (
            <ellipse
              cx="80"
              cy="103"
              rx="7"
              ry="9"
              fill="#D83A56"
              stroke="#7C3615"
              strokeWidth="2"
            />
          ) : isHappy ? (
            <path
              d="M 71 99 Q 80 110 89 99"
              fill="#D83A56"
              stroke="#7C3615"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M 73 99 Q 80 106 87 99"
              fill="none"
              stroke="#7C3615"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          )}

          {/* Little Star on Forehead */}
          <polygon
            points="80,56 82,62 88,62 83,66 85,72 80,68 75,72 77,66 72,62 78,62"
            fill="#FFFFFF"
            opacity="0.8"
          />
        </svg>
      </button>
    </div>
  );
};
