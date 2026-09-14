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
export type AudioSource = 'cloudinary' | 'speech-synthesis';

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

export interface ChildProgress {
  exploredLetters: Record<string, number>;
  exploredObjects: Record<string, number>;
  totalTaps: number;
  lastPlayed: string;
  lastLetter: string;
}

export interface AudioSettings {
  voiceSpeed: number;
  voicePitch: number;
  sfxVolume: number;
  speechVolume: number;
  selectedVoiceName: string | null;
}

export type ScreenType = 'home' | 'lets-play' | 'letters' | 'letter-detail' | 'sound-safari' | 'story' | 'parent';
