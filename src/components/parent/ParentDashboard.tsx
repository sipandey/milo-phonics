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
  const [settings, setSettings] = useState(audioService.getSettings());
  const [testSpeechText, setTestSpeechText] = useState('sat... pat... tap!');
  const voices = audioService.getAvailableVoices();

  useEffect(() => {
    const unsubscribe = progressService.subscribe((updated) => {
      setProgress(updated);
    });
    return unsubscribe;
  }, []);

  const handleUpdateSettings = (key: string, value: number | string | null) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    audioService.updateSettings({ [key]: value });
  };

  const handleTestVoice = () => {
    audioService.speak(testSpeechText, { interrupt: true });
  };

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
          className="absolute top-5 right-5 p-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
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

        {/* Audio & Narration Settings */}
        <div className="space-y-4 mb-6 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-black text-amber-900 uppercase tracking-wider flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-amber-500" />
            Voice & Toddler Audio Tuning
          </h3>

          <div>
            <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
              <span>Speech Speed (Slower for toddlers)</span>
              <span>{Math.round(settings.voiceSpeed * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.1"
              step="0.05"
              value={settings.voiceSpeed}
              onChange={(e) => handleUpdateSettings('voiceSpeed', parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {voices.length > 1 && (
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Fallback Voice</label>
              <select
                value={settings.selectedVoiceName || ''}
                onChange={(e) => handleUpdateSettings('selectedVoiceName', e.target.value || null)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
              >
                <option value="">Default Recommended Voice</option>
                {voices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={testSpeechText}
              onChange={(e) => setTestSpeechText(e.target.value)}
              className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
              placeholder="Test speech text"
            />
            <button
              onClick={handleTestVoice}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold squish-tap cursor-pointer"
            >
              Test Voice 🔊
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
