import React from 'react';
import { audioService } from '../../services/audioService';

interface BigButtonProps {
  onClick: () => void;
  variant?: 'yellow' | 'coral' | 'green' | 'sky' | 'purple' | 'white';
  size?: 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  label?: string;
  badge?: string;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export const BigButton: React.FC<BigButtonProps> = ({
  onClick,
  variant = 'yellow',
  size = 'lg',
  icon,
  label,
  badge,
  className = '',
  children,
  disabled = false,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    audioService.playPop();
    onClick();
  };

  const variantStyles = {
    yellow: 'bg-bubble-yellow text-amber-900 border-4 border-amber-300 shadow-[0_8px_0_#D97706]',
    coral: 'bg-bubble-coral text-white border-4 border-orange-300 shadow-[0_8px_0_#C2410C]',
    green: 'bg-bubble-green text-emerald-950 border-4 border-emerald-300 shadow-[0_8px_0_#047857]',
    sky: 'bg-bubble-sky text-sky-950 border-4 border-sky-300 shadow-[0_8px_0_#0369A1]',
    purple: 'bg-bubble-purple text-white border-4 border-purple-300 shadow-[0_8px_0_#581C87]',
    white: 'bg-white text-gray-800 border-4 border-gray-200 shadow-[0_8px_0_#CBD5E1]',
  };

  const sizeStyles = {
    md: 'min-h-[72px] min-w-[72px] px-5 py-3 text-lg rounded-3xl',
    lg: 'min-h-[88px] min-w-[88px] px-6 py-4 text-2xl font-bold rounded-4xl',
    xl: 'min-h-[108px] min-w-[108px] px-8 py-5 text-3xl font-extrabold rounded-5xl',
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`squish-tap relative inline-flex flex-col items-center justify-center font-fun transition-transform active:translate-y-2 active:shadow-[0_2px_0_rgba(0,0,0,0.2)] select-none focus:outline-none ${variantStyles[variant]} ${sizeStyles[size]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      {badge && (
        <span className="absolute -top-3 -right-2 px-3 py-1 bg-bubble-pink text-white font-bold text-xs rounded-full shadow-md border-2 border-white animate-bounce-gentle">
          {badge}
        </span>
      )}

      {icon && <div className="text-4xl mb-1 drop-shadow-sm">{icon}</div>}
      {label && <span className="tracking-wide text-center leading-tight">{label}</span>}
      {children}
    </button>
  );
};
