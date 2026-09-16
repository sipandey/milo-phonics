import React, { useEffect, useState } from 'react';
import { progressService } from '../../services/progressService';
import { audioService } from '../../services/audioService';
import { CURRICULUM_LEVELS } from '../../data/curriculumData';
import { ParentClerkSync } from './ParentClerkSync';
import { X, Volume2, RotateCcw, Sparkles, Star, Award, BookOpen } from 'lucide-react';

interface ParentDashboardProps {
  onClose: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ onClose }) => {
  const [progress, setProgress] = useState(progressService.getProgress());

  useEffect(() => {
    const unsubscribe = progressService.subscribe((updated) => {
      setProgress(updated);
    });
    return unsubscribe;
  }, []);

  const handleResetProgress = () => {
    if (window.confirm('Reset all toddler stars and unlocked levels back to Level 1?')) {
      progressService.resetProgress();
      setProgress(progressService.getProgress());
      audioService.playPop();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center animate-pop-in">
      <div className="bg-white rounded-4xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-4 border-amber-300 relative text-gray-800 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Parent Dashboard"
          className="absolute top-4 right-4 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-7 h-7 sm:w-8 sm:h-8" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <span className="text-3xl">🛡️</span>
          <div>
            <h2 className="text-2xl font-black font-fun text-gray-900">Parent Dashboard</h2>
            <p className="text-xs text-gray-500">Curriculum progression, cloud backup & voice settings</p>
          </div>
        </div>

        {/* Section 1: Clerk Authentication & Cloud Backup */}
        <div className="mb-6">
          <ParentClerkSync />
        </div>

        {/* Section 2: Systematic Synthetic Phonics (SSP) Progress */}
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-black text-amber-900 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Curriculum Mastery (British Phonics Progression)
          </h3>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span className="text-xs font-bold">Stars Earned</span>
              </div>
              <p className="text-2xl font-black text-amber-950">{progress.totalStars}</p>
              <p className="text-[10px] text-amber-700">across all sounds</p>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold">Current Level</span>
              </div>
              <p className="text-2xl font-black text-emerald-950">Level {progress.currentLevelId}</p>
              <p className="text-[10px] text-emerald-700">Active Adventure</p>
            </div>

            <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 text-center">
              <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                <BookOpen className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-bold">Unlocked</span>
              </div>
              <p className="text-2xl font-black text-purple-950">{progress.unlockedLevels.length} / 7</p>
              <p className="text-[10px] text-purple-700">Phonics Sets</p>
            </div>
          </div>

          {/* 7 Levels Breakdown */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
            <p className="text-xs font-bold text-gray-700 mb-2">SSP Learning Sets:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CURRICULUM_LEVELS.map((lvl) => {
                const isUnlocked = progress.unlockedLevels.includes(lvl.id);
                const isCurrent = progress.currentLevelId === lvl.id;
                let lvlStars = 0;
                lvl.letterIds.forEach((l) => {
                  lvlStars += progress.letterStars[l] || 0;
                });
                const maxStars = lvl.letterIds.length * 3;

                return (
                  <div
                    key={lvl.id}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                      isCurrent
                        ? 'bg-amber-100/70 border-amber-300 ring-2 ring-amber-400'
                        : isUnlocked
                        ? 'bg-white border-gray-200'
                        : 'bg-gray-100/80 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{lvl.badgeEmoji}</span>
                      <div>
                        <p className="font-bold text-gray-900">
                          L{lvl.id}: {lvl.letterIds.map((l) => l.toUpperCase()).join(' ')}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate max-w-[120px]">{lvl.title}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      {isUnlocked ? (
                        <span className="font-black text-amber-700 flex items-center gap-0.5 text-[11px]">
                          ⭐ {lvlStars}/{maxStars}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold">🔒 {lvl.requiredStarsToUnlock}★</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Audio & Narration Pipeline Status */}
        <div className="space-y-3 mb-6 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-black text-amber-900 uppercase tracking-wider flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-amber-500" />
            Audio Engine: Oxford-First & AI Cloudinary Pipeline
          </h3>

          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-800">1. Oxford Dictionary Authentic Audio:</span>
              <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">Active (Top Precedence)</span>
            </div>
            <p className="text-[11px] text-gray-600">
              Authentic British English human recordings for all 26 letter phonemes and Oxford sound catalog.
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-amber-100">
              <span className="font-bold text-gray-800">2. Pre-Recorded British AI (Coral):</span>
              <span className="font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-lg">Active (Cloudinary CDN)</span>
            </div>
            <p className="text-[11px] text-gray-600">
              Calm toddler pacing (~0.75x) matching Oxford tone. 84 words, 38 CVC blends, letters, & story sentences.
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-amber-100">
              <span className="font-bold text-gray-800">3. Browser SpeechSynthesis:</span>
              <span className="font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-lg">Disabled (Zero Native Speech)</span>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={() => {
                audioService.playPhonemeWordBlend('phoneme.s', 'word.sun', 'Sun');
              }}
              className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold squish-tap cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Volume2 className="w-4 h-4" />
              <span>Test Oxford Sound & Coral Word Blend (/s/... Sun!)</span>
            </button>

            <button
              onClick={() => {
                audioService.playCvcWord('sat', 'Sat');
              }}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold squish-tap cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Test CVC Blend (Sat!)</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={handleResetProgress}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-bold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Progress</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 text-white font-bold text-sm rounded-2xl hover:bg-black squish-tap cursor-pointer"
          >
            Back to Play
          </button>
        </div>
      </div>
    </div>
  );
};
