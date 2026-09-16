export type SoundType =
  | 'monkey'
  | 'twinkle'
  | 'slurp'
  | 'squeak'
  | 'bite'
  | 'shimmer'
  | 'sparkle'
  | 'hiss'
  | 'baa'
  | 'slide'
  | 'crunch'
  | 'tap'
  | 'snap'
  | 'cosmic'
  | 'arrow'
  | 'pop'
  | 'chime'
  | 'boing'
  | 'fanfare';

export type AudioType = 'phoneme' | 'letter' | 'word' | 'phrase' | 'prompt' | 'praise';
export type AudioSource = 'local' | 'cloudinary' | 'speech-synthesis';

export interface AudioEntry {
  id: string;
  type: AudioType;
  source: AudioSource;
  url?: string;
  fallbackText: string;
  version?: number;
  description?: string;
}

export type AudioManifest = Record<string, AudioEntry>;

export interface PhonicsObject {
  id: string;
  name: string;
  letterId: string;
  emoji: string;
  spokenIntro: string; // e.g. "Mmmm... monkey!"
  soundType: SoundType;
  accentColor: string;
  bgColor: string;
  funReaction: string; // e.g. "Oo-oo-ah-ah!", "Twinkle twinkle!", "Yummy!"
  wordAudioId: string;   // e.g. "word.monkey"
  phraseAudioId: string; // e.g. "phrase.m-monkey"
}

export interface LetterData {
  id: string;
  symbol: string;
  phoneme: string;          // Visual display: "Mmmm"
  phonemeSpoken: string;    // TTS target: "Mmmmm"
  nameSpoken: string;       // "The letter M" or "M"
  colorTheme: {
    primary: string;
    secondary: string;
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
  };
  objects: PhonicsObject[];
  letterAudioId: string;    // e.g. "letter.m"
  phonemeAudioId: string;   // e.g. "phoneme.m"
}

export interface PhonicsLevel {
  id: number;
  title: string;
  subtitle: string;
  badgeEmoji: string;
  letterIds: string[];
  requiredStarsToUnlock: number;
  colorTheme: {
    from: string;
    to: string;
    accent: string;
    cardBg: string;
    border: string;
  };
  decodableWordsPreview: string[];
}

export interface LevelProgress {
  levelId: number;
  unlocked: boolean;
  starsEarned: number;
  completed: boolean;
}

export interface ChildProgress {
  currentLevelId: number;
  unlockedLevels: number[];
  letterStars: Record<string, number>; // letterId -> 0..3 stars
  levels: Record<number, LevelProgress>;
  totalStars: number;
  exploredLetters: Record<string, number>;
  exploredObjects: Record<string, number>;
  totalTaps: number;
  lastPlayed: string;
  lastLetter: string;
  cloudSyncedAt?: string;
  toddlerFocusMode?: boolean; // Single-action pacing with no button clutter
}

export interface AudioSettings {
  voiceSpeed: number;
  voicePitch: number;
  sfxVolume: number;
  speechVolume: number;
  selectedVoiceName: string | null;
}

export interface BlendingWord {
  id: string;
  word: string;
  levelId: number;
  phonemeAudioIds: string[]; // e.g. ['phoneme.s', 'phoneme.a', 'phoneme.t']
  letters: string[];         // e.g. ['s', 'a', 't']
  emoji: string;             // e.g. '🐈'
  meaning: string;           // e.g. 'Sat on a mat'
  wordAudioId?: string;      // Legacy audio ID mapping if available
  cvcAudioId?: string;       // e.g. 'cvc.sat'
  sentenceAudioId?: string;  // e.g. 'sentence.sat'
  color: string;
}

export type ScreenType = 'home' | 'lets-play' | 'letters' | 'letter-detail' | 'sound-safari' | 'story' | 'parent' | 'oxford-sounds' | 'sound-train' | 'bubble-pop' | 'feed-milo';

