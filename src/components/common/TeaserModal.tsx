import React from 'react';
import { audioService } from '../../services/audioService';
import { CharacterMilo } from './CharacterMilo';
import { X } from 'lucide-react';

interface TeaserModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export const TeaserModal: React.FC<TeaserModalProps> = ({
  isOpen,
  title,
  message,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-pop-in cursor-pointer"
      onClick={() => {
        audioService.playPop();
        onClose();
      }}
    >
      <div
        className="bg-white rounded-4xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border-4 border-bubble-yellow relative text-center cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {
            audioService.playPop();
            onClose();
          }}
          className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-gray-500 hover:text-gray-700 bg-white rounded-full shadow-lg border-2 border-amber-200 cursor-pointer squish-tap"
          aria-label="Close"
        >
          <X className="w-7 h-7 sm:w-8 sm:h-8" />
        </button>

        <CharacterMilo size="md" className="mb-3" />

        <h3 className="text-2xl font-black font-fun text-amber-900 mb-2">{title}</h3>
        <p className="text-base text-gray-600 mb-6 font-semibold leading-relaxed">
          {message}
        </p>

        <button
          onClick={() => {
            audioService.playPop();
            onClose();
          }}
          className="w-full py-4 bg-bubble-yellow text-amber-950 font-black text-xl rounded-3xl border-4 border-amber-300 shadow-[0_6px_0_#D97706] squish-tap"
        >
          Let's Play M, S, A! ✨
        </button>
      </div>
    </div>
  );
};
