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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-pop-in">
      <div className="bg-white rounded-4xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border-4 border-bubble-yellow relative text-center">
        <button
          onClick={() => {
            audioService.playPop();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
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
