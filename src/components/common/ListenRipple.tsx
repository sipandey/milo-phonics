import React, { useState, useCallback } from 'react';
import { audioService } from '../../services/audioService';

interface RippleParticle {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

interface ListenRippleProps {
  isActive: boolean;
  onTap?: () => void;
  hintText?: string;
}

const MUSICAL_EMOJIS = ['🎵', '🎶', '✨', '⭐', '👂'];

export const ListenRipple: React.FC<ListenRippleProps> = ({
  isActive,
  onTap,
  hintText: _hintText = "Shh... Listen! 👂🎶",
}) => {
  const [particles, setParticles] = useState<RippleParticle[]>([]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isActive) return;

      e.preventDefault();
      e.stopPropagation();

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newParticle: RippleParticle = {
        id: Date.now() + Math.random(),
        x,
        y,
        emoji: MUSICAL_EMOJIS[Math.floor(Math.random() * MUSICAL_EMOJIS.length)],
      };

      setParticles((prev) => [...prev.slice(-6), newParticle]);
      audioService.playPop();
      onTap?.();

      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, 700);
    },
    [isActive, onTap]
  );

  if (!isActive) return null;

  return (
    <div
      onPointerDown={handlePointerDown}
      className="absolute inset-0 z-40 cursor-wait select-none touch-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Floating touch particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute pointer-events-none text-3xl sm:text-4xl animate-bounce-gentle transition-all duration-700"
          style={{
            left: `${p.x}px`,
            top: `${p.y - 20}px`,
            transform: 'translate(-50%, -50%)',
            animation: 'floatUp 0.7s ease-out forwards',
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
};
