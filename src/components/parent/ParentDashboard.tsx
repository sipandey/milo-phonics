import React, { useState } from 'react';
import { progressService } from '../../services/progressService';
import { audioService } from '../../services/audioService';
import { lettersData } from '../../data/lettersData';
import { X, Volume2, RotateCcw, Sparkles, Heart } from 'lucide-react';

interface ParentDashboardProps {
  onClose: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ onClose }) => {
  const [progress, setProgress] = useState(progressService.getProgress());
  const [settings, setSettings] = useState(audioService.getSettings());
  const [testSpeechText, setTestSpeechText] = useState('Mmmm... monkey!');
  const voices = audioService.getAvailableVoices();

  const handleUpdateSettings = (key: string, value: number | string | null) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    audioService.updateSettings({ [key]: value });
  };

  const handleTestVoice = () => {
    audioService.speak(testSpeechText, { interrupt: true });
  };

  const handleResetProgress = () => {
    if (window.confirm('Reset play progress?')) {
      progressService.resetProgress();
      setProgress(progressService.getProgress());
      audioService.playPop();
    }
  };

  // Find most explored letter
  const letterCounts = Object.entries(progress.exploredLetters);
  letterCounts.sort((a, b) => b[1] - a[1]);
  const topLetter = letterCounts[0] && letterCounts[0][1] > 0 ? letterCounts[0][0].toUpperCase() : null;

  // Find favorite object
  const favoriteObj = progressService.getMostPlayedObject();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center animate-pop-in">
      <div className="bg-white rounded-4xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-4 border-amber-300 relative text-gray-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Parent Dashboard"
          className="absolute top-5 right-5 p-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🛡️</span>
          <div>
            <h2 className="text-2xl font-black font-fun text-gray-900">Parent Dashboard</h2>
            <p className="text-xs text-gray-500">Play observations & speech settings</p>
          </div>
        </div>

        {/* Play Insights (No academic testing, warm parent notes) */}
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-black text-amber-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Play Activity & Exploration
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-xs font-bold text-amber-700">Total Play Taps</p>
              <p className="text-3xl font-black text-amber-900 mt-1">{progress.totalTaps}</p>
              <p className="text-[11px] text-amber-600 mt-1">Exploratory touches & sounds</p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p className="text-xs font-bold text-emerald-700">Top Letter</p>
              <p className="text-3xl font-black text-emerald-900 mt-1">
                {topLetter ? `Letter ${topLetter}` : 'Just started'}
              </p>
              <p className="text-[11px] text-emerald-600 mt-1">
                {topLetter ? `${progress.exploredLetters[topLetter.toLowerCase()]} interactions` : 'Explore M, S, and A!'}
              </p>
            </div>
          </div>

          {/* Letter Breakdown */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-xs font-bold text-gray-700 mb-2">Letters Explored:</p>
            <div className="flex gap-4">
              {['m', 's', 'a'].map((id) => {
                const count = progress.exploredLetters[id] || 0;
                const letter = lettersData[id];
                return (
                  <div key={id} className="flex-1 bg-white p-2.5 rounded-xl border border-gray-200 text-center">
                    <span className="text-xl font-black" style={{ color: letter.colorTheme.text }}>
                      {letter.symbol}
                    </span>
                    <p className="text-xs text-gray-500 font-semibold">{count} times</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gentle Observation & Recommendation */}
          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-start gap-3">
            <Heart className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-purple-900 space-y-1">
              <p className="font-bold">Next Play Suggestion:</p>
              <p>
                {favoriteObj
                  ? `Your toddler enjoyed interacting with the ${favoriteObj.id}. Try exploring the S sounds (Sun & Star) together!`
                  : 'Start with Letter M (Monkey & Moon) to build initial sound familiarity!'}
              </p>
            </div>
          </div>
        </div>

        {/* Audio & Narration Settings */}
        <div className="space-y-4 mb-6 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-black text-amber-900 uppercase tracking-wider flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-amber-500" />
            Voice & Toddler Audio Tuning
          </h3>

          {/* Voice Speed Slider */}
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

          {/* Voice Selector if browser has multiple English voices */}
          {voices.length > 1 && (
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Narrator Voice</label>
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

          {/* Test Voice Button */}
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
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold squish-tap"
            >
              Test Voice 🔊
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={handleResetProgress}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Progress</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 text-white font-bold text-sm rounded-2xl hover:bg-black squish-tap"
          >
            Back to Play
          </button>
        </div>
      </div>
    </div>
  );
};
