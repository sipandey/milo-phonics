import { AudioEntry, AudioManifest } from '../types/phonics';

/**
 * Central Audio Manifest
 *
 * Defines all semantic audio IDs, their content type, source, and fallback text.
 * When pre-generated Cloudinary audio assets are introduced in Phase 2,
 * the `url` and `source: 'cloudinary'` fields will be added here
 * WITHOUT requiring changes to the UI components.
 */
export const audioManifest: AudioManifest = {
  // ==========================================
  // LETTERS & PHONEMES
  // ==========================================
  'letter.m': {
    id: 'letter.m',
    type: 'letter',
    source: 'speech-synthesis',
    fallbackText: 'Letter M',
    version: 1,
    description: 'Letter name M',
  },
  'phoneme.m': {
    id: 'phoneme.m',
    type: 'phoneme',
    source: 'speech-synthesis',
    fallbackText: 'Mmmmm',
    version: 1,
    description: 'M sound /m/',
  },
  'letter.s': {
    id: 'letter.s',
    type: 'letter',
    source: 'speech-synthesis',
    fallbackText: 'Letter S',
    version: 1,
    description: 'Letter name S',
  },
  'phoneme.s': {
    id: 'phoneme.s',
    type: 'phoneme',
    source: 'speech-synthesis',
    fallbackText: 'Sssss',
    version: 1,
    description: 'S sound /s/',
  },
  'letter.a': {
    id: 'letter.a',
    type: 'letter',
    source: 'speech-synthesis',
    fallbackText: 'Letter A',
    version: 1,
    description: 'Letter name A',
  },
  'phoneme.a': {
    id: 'phoneme.a',
    type: 'phoneme',
    source: 'speech-synthesis',
    fallbackText: 'Ahhh',
    version: 1,
    description: 'Short A sound /æ/',
  },

  // ==========================================
  // WORDS & INTRO PHRASES (LETTER M)
  // ==========================================
  'word.monkey': {
    id: 'word.monkey',
    type: 'word',
    source: 'speech-synthesis',
    fallbackText: 'Monkey',
    version: 1,
  },
  'phrase.m-monkey': {
    id: 'phrase.m-monkey',
    type: 'phrase',
    source: 'speech-synthesis',
    fallbackText: 'Mmmm... monkey!',
    version: 1,
  },
  'word.moon': {
    id: 'word.moon',
    type: 'word',
    source: 'speech-synthesis',
    fallbackText: 'Moon',
    version: 1,
  },
  'phrase.m-moon': {
    id: 'phrase.m-moon',
    type: 'phrase',
    source: 'speech-synthesis',
    fallbackText: 'Mmmm... moon!',
    version: 1,
  },
  'word.milk': {
    id: 'word.milk',
    type: 'word',
    source: 'speech-synthesis',
    fallbackText: 'Milk',
    version: 1,
  },
  'phrase.m-milk': {
    id: 'phrase.m-milk',
    type: 'phrase',
    source: 'speech-synthesis',
    fallbackText: 'Mmmm... milk!',
    version: 1,
  },
  'word.mouse': {
    id: 'word.mouse',
    type: 'word',
    source: 'speech-synthesis',
    fallbackText: 'Mouse',
    version: 1,
  },
  'phrase.m-mouse': {
    id: 'phrase.m-mouse',
    type: 'phrase',
    source: 'speech-synthesis',
    fallbackText: 'Mmmm... mouse!',
    version: 1,
  },
  'word.mango': {
    id: 'word.mango',
    type: 'word',
    source: 'speech-synthesis',
    fallbackText: 'Mango',
    version: 1,
  },
  'phrase.m-mango': {
    id: 'phrase.m-mango',
    type: 'phrase',
    source: 'speech-synthesis',
    fallbackText: 'Mmmm... mango!',
    version: 1,
  },

  // ==========================================
  // WORDS & INTRO PHRASES (LETTER S)
  // ==========================================
  'word.sun': {
    id: 'word.sun',
    type: 'word',
    source: 'speech-synthesis',
    fallbackText: 'Sun',
    version: 1,
  },
  'phrase.s-sun': {
    id: 'phrase.s-sun',
    type: 'phrase',
    source: 'speech-synthesis',
    fallbackText: 'Sssss... sun!',
    version: 1,
  },
  'word.star': {
    id: 'word.star',
    type: 'word',
    source: 'speech-synthesis',
    fallbackText: 'Star',
    version: 1,
  },
  'phrase.s-star': {
    id: 'phrase.s-star',
    type: 'phrase',
    source: 'speech-synthesis',
    fallbackText: 'Sssss... star!',
    version: 1,
  },
  'word.snake': {
    id: 'word.snake',
    type: 'word',
    source: 'speech-synthesis',
    fallbackText: 'Snake',
    version: 1,
  },
  'phrase.s-snake': {
    id: 'phrase.s-snake',
    type: 'phrase',
    source: 'speech-synthesis',
    fallbackText: 'Sssss... snake!',
    version: 1,
  },
  'word.sheep': {
    id: 'word.sheep',
    type: 'word',
    source: 'speech-synthesis',
    fallbackText: 'Sheep',
    version: 1,
  },
  'phrase.s-sheep': {
    id: 'phrase.s-sheep',
    type: 'phrase',
    source: 'speech-synthesis',
    fallbackText: 'Sssss... sheep!',
    version: 1,
  },
  'word.sock': {
    id: 'word.sock',
    type: 'word',
    source: 'speech-synthesis',
    fallbackText: 'Sock',
    version: 1,
  },
  'phrase.s-sock': {
    id: 'phrase.s-sock',
    type: 'phrase',
    source: 'speech-synthesis',
    fallbackText: 'Sssss... sock!',
    version: 1,
  },

  // ==========================================
  // WORDS & INTRO PHRASES (LETTER A)
  // ==========================================
  'word.apple': {
    id: 'word.apple',
    type: 'word',
    source: 'speech-synthesis',
    fallbackText: 'Apple',
    version: 1,
  },
  'phrase.a-apple': {
    id: 'phrase.a-apple',
    type: 'phrase',
    source: 'speech-synthesis',
    fallbackText: 'Ahhh... apple!',
    version: 1,
  },
  'word.ant': {
    id: 'word.ant',
    type: 'word',
    source: 'speech-synthesis',
    fallbackText: 'Ant',
    version: 1,
  },
  'phrase.a-ant': {
    id: 'phrase.a-ant',
    type: 'phrase',
    source: 'speech-synthesis',
    fallbackText: 'Ahhh... ant!',
    version: 1,
  },
  'word.alligator': {
    id: 'word.alligator',
    type: 'word',
    source: 'speech-synthesis',
    fallbackText: 'Alligator',
    version: 1,
  },
  'phrase.a-alligator': {
    id: 'phrase.a-alligator',
    type: 'phrase',
    source: 'speech-synthesis',
    fallbackText: 'Ahhh... alligator!',
    version: 1,
  },
  'word.astronaut': {
    id: 'word.astronaut',
    type: 'word',
    source: 'speech-synthesis',
    fallbackText: 'Astronaut',
    version: 1,
  },
  'phrase.a-astronaut': {
    id: 'phrase.a-astronaut',
    type: 'phrase',
    source: 'speech-synthesis',
    fallbackText: 'Ahhh... astronaut!',
    version: 1,
  },
  'word.arrow': {
    id: 'word.arrow',
    type: 'word',
    source: 'speech-synthesis',
    fallbackText: 'Arrow',
    version: 1,
  },
  'phrase.a-arrow': {
    id: 'phrase.a-arrow',
    type: 'phrase',
    source: 'speech-synthesis',
    fallbackText: 'Ahhh... arrow!',
    version: 1,
  },

  // ==========================================
  // PROMPTS & GREETINGS
  // ==========================================
  'prompt.lets-play': {
    id: 'prompt.lets-play',
    type: 'prompt',
    source: 'speech-synthesis',
    fallbackText: "Hi! Let's play!",
    version: 1,
  },
  'prompt.find-sounds': {
    id: 'prompt.find-sounds',
    type: 'prompt',
    source: 'speech-synthesis',
    fallbackText: "Hi! Let's find some sounds!",
    version: 1,
  },
  'prompt.touch-anything': {
    id: 'prompt.touch-anything',
    type: 'prompt',
    source: 'speech-synthesis',
    fallbackText: 'Touch anything!',
    version: 1,
  },
  'prompt.have-fun': {
    id: 'prompt.have-fun',
    type: 'prompt',
    source: 'speech-synthesis',
    fallbackText: "Yay! Let's have fun!",
    version: 1,
  },

  // ==========================================
  // PRAISES & REWARDS
  // ==========================================
  'praise.yay': {
    id: 'praise.yay',
    type: 'praise',
    source: 'speech-synthesis',
    fallbackText: 'Yay!',
    version: 1,
  },
  'praise.super': {
    id: 'praise.super',
    type: 'praise',
    source: 'speech-synthesis',
    fallbackText: 'Super!',
    version: 1,
  },
  'praise.hooray': {
    id: 'praise.hooray',
    type: 'praise',
    source: 'speech-synthesis',
    fallbackText: 'Hooray!',
    version: 1,
  },
  'praise.wonderful': {
    id: 'praise.wonderful',
    type: 'praise',
    source: 'speech-synthesis',
    fallbackText: 'Wonderful!',
    version: 1,
  },
  'praise.look-at-that': {
    id: 'praise.look-at-that',
    type: 'praise',
    source: 'speech-synthesis',
    fallbackText: 'Look at that!',
    version: 1,
  },
  'praise.great-tapping': {
    id: 'praise.great-tapping',
    type: 'praise',
    source: 'speech-synthesis',
    fallbackText: 'Great tapping!',
    version: 1,
  },
  'praise.random': {
    id: 'praise.random',
    type: 'praise',
    source: 'speech-synthesis',
    fallbackText: 'Yay!',
    version: 1,
  },
};

const praiseKeys = [
  'praise.yay',
  'praise.super',
  'praise.hooray',
  'praise.wonderful',
  'praise.look-at-that',
  'praise.great-tapping',
];

export const getAudioEntry = (audioId: string): AudioEntry | undefined => {
  return audioManifest[audioId];
};

export const getRandomPraiseAudioId = (): string => {
  return praiseKeys[Math.floor(Math.random() * praiseKeys.length)];
};
