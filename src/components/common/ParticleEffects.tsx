import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

export const triggerGentleConfetti = () => {
  try {
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FFD166', '#06D6A0', '#FF8E53', '#4CC9F0', '#C77DFF'],
      disableForReducedMotion: true,
      ticks: 160,
    });
  } catch {
    // Canvas fallback
  }
};

export const FloatingBubblesBackground: React.FC = () => {
  const [bubbles, setBubbles] = useState<Array<{ id: number; left: number; size: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    // Generate gentle background ambient floating elements
    const items = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      left: Math.random() * 90 + 5,
      size: Math.random() * 40 + 30,
      delay: Math.random() * 4,
      duration: Math.random() * 6 + 7,
    }));
    setBubbles(items);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="absolute rounded-full bg-gradient-to-t from-bubble-yellow/15 to-bubble-pink/15 border border-white/30 backdrop-blur-[1px] animate-soft-float"
          style={{
            left: `${b.left}%`,
            bottom: '-50px',
            width: `${b.size}px`,
            height: `${b.size}px`,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
          }}
        />
      ))}
    </div>
  );
};
