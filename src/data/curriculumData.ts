import { PhonicsLevel } from '../types/phonics';

export const CURRICULUM_LEVELS: PhonicsLevel[] = [
  {
    id: 1,
    title: 'The First Steps',
    subtitle: 'Foundation sounds for your very first words',
    badgeEmoji: '🌱',
    letterIds: ['s', 'a', 't', 'p'],
    requiredStarsToUnlock: 0,
    colorTheme: {
      from: '#FEF3C7',
      to: '#FDE68A',
      accent: '#D97706',
      cardBg: '#FFFBEB',
      border: '#FCD34D',
    },
    decodableWordsPreview: ['sat', 'pat', 'tap', 'at', 'as'],
  },
  {
    id: 2,
    title: 'The Word Builders',
    subtitle: 'High-utility sounds that unlock 30+ new words',
    badgeEmoji: '🧱',
    letterIds: ['i', 'n', 'm', 'd'],
    requiredStarsToUnlock: 6,
    colorTheme: {
      from: '#E0F2FE',
      to: '#BAE6FD',
      accent: '#0284C7',
      cardBg: '#F0F9FF',
      border: '#7DD3FC',
    },
    decodableWordsPreview: ['pin', 'pan', 'mat', 'dad', 'tin', 'sad'],
  },
  {
    id: 3,
    title: 'The Explorers',
    subtitle: 'Fun consonants and cheerful vowels',
    badgeEmoji: '🧭',
    letterIds: ['g', 'o', 'c', 'k'],
    requiredStarsToUnlock: 14,
    colorTheme: {
      from: '#DCFCE7',
      to: '#BBF7D0',
      accent: '#16A34A',
      cardBg: '#F0FDF4',
      border: '#86EFAC',
    },
    decodableWordsPreview: ['cat', 'cot', 'can', 'cap', 'kid', 'kick'],
  },
  {
    id: 4,
    title: 'The Adventurers',
    subtitle: 'Vibrant short vowels and rolling sounds',
    badgeEmoji: '🚀',
    letterIds: ['e', 'u', 'r'],
    requiredStarsToUnlock: 22,
    colorTheme: {
      from: '#F3E8FF',
      to: '#E9D5FF',
      accent: '#9333EA',
      cardBg: '#FAF5FF',
      border: '#D8B4FE',
    },
    decodableWordsPreview: ['red', 'run', 'sun', 'mud', 'bed', 'pet'],
  },
  {
    id: 5,
    title: 'The Champions',
    subtitle: 'Gentle puffs, strong taps, and lovely leaps',
    badgeEmoji: '🏆',
    letterIds: ['h', 'b', 'f', 'l'],
    requiredStarsToUnlock: 28,
    colorTheme: {
      from: '#FFE4E6',
      to: '#FECDD3',
      accent: '#E11D48',
      cardBg: '#FFF1F2',
      border: '#FDA4AF',
    },
    decodableWordsPreview: ['hat', 'bat', 'fun', 'leg', 'bell', 'puff'],
  },
  {
    id: 6,
    title: 'The Discovery Team',
    subtitle: 'Curious twists and buzzing energy',
    badgeEmoji: '✨',
    letterIds: ['j', 'v', 'w', 'x'],
    requiredStarsToUnlock: 36,
    colorTheme: {
      from: '#FFEDD5',
      to: '#FED7AA',
      accent: '#EA580C',
      cardBg: '#FFF7ED',
      border: '#FDBA74',
    },
    decodableWordsPreview: ['jam', 'van', 'wet', 'win', 'fox', 'box'],
  },
  {
    id: 7,
    title: 'The Phonics Masters',
    subtitle: 'The grand finale of the single letter sounds',
    badgeEmoji: '👑',
    letterIds: ['y', 'z', 'q'],
    requiredStarsToUnlock: 44,
    colorTheme: {
      from: '#FEF08A',
      to: '#FDE047',
      accent: '#CA8A04',
      cardBg: '#FEFCE8',
      border: '#FACC15',
    },
    decodableWordsPreview: ['yes', 'zip', 'quiz', 'quick'],
  },
];

export function getLevelById(levelId: number): PhonicsLevel | undefined {
  return CURRICULUM_LEVELS.find((lvl) => lvl.id === levelId);
}

export function getLevelForLetter(letterId: string): PhonicsLevel | undefined {
  const cleanId = letterId.toLowerCase();
  return CURRICULUM_LEVELS.find((lvl) => lvl.letterIds.includes(cleanId));
}
