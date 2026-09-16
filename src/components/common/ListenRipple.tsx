import React, { useState } from 'react';

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

export const ListenRipple: React.FC<ListenRippleProps> = ({
  isActive,
  onTap: _onTap,
  hintText: _hintText = "Shh... Listen! 👂🎶",
}) => {
  const [particles] = useState<RippleParticle[]>([]);

  if (!isActive) return null;

  return (
    <div
      className="absolute inset-0 z-20 pointer-events-none select-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Ambient listening particles (purely visual, zero touch interception) */}
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
