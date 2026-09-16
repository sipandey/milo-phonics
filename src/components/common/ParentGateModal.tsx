import React, { useState, useEffect } from 'react';
import { audioService } from '../../services/audioService';
import { X, Lock } from 'lucide-react';

interface ParentGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => void;
}

export const ParentGateModal: React.FC<ParentGateModalProps> = ({
  isOpen,
  onClose,
  onUnlock,
}) => {
  const [num1, setNum1] = useState(3);
  const [num2, setNum2] = useState(4);
  const [options, setOptions] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      generateMathProblem();
    }
  }, [isOpen]);

  const generateMathProblem = () => {
    const a = Math.floor(Math.random() * 5) + 3;
    const b = Math.floor(Math.random() * 5) + 2;
    const answer = a + b;
    setNum1(a);
    setNum2(b);

    // Generate 3 random decoy answers
    const decoys = new Set<number>([answer]);
    while (decoys.size < 4) {
      const offset = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
      const val = answer + offset;
      if (val > 0) decoys.add(val);
    }
    const shuffled = Array.from(decoys).sort(() => Math.random() - 0.5);
    setOptions(shuffled);
  };

  const handleSelectOption = (num: number) => {
    if (num === num1 + num2) {
      audioService.playChime();
      onUnlock();
    } else {
      audioService.playBoing();
      generateMathProblem();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-pop-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border-4 border-bubble-yellow relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Grown-Ups Only</h3>
            <p className="text-xs text-gray-500">Please solve to continue</p>
          </div>
        </div>

        <div className="my-6 py-4 px-6 bg-amber-50 rounded-2xl text-center border-2 border-amber-200">
          <span className="text-2xl font-black text-amber-900">
            {num1} + {num2} = ?
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleSelectOption(opt)}
              className="py-3 px-4 bg-gray-100 hover:bg-bubble-yellow hover:text-amber-950 font-black text-xl rounded-2xl border-2 border-gray-200 squish-tap transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
