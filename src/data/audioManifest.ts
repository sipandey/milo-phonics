import { AudioEntry, AudioManifest } from '../types/phonics';
import { generatedAudioManifest } from './generatedAudioManifest';

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
  // 26 LETTERS & OXFORD BRITISH ENGLISH PHONEMES
  // ==========================================
  'letter.a': { id: 'letter.a', type: 'letter', source: 'speech-synthesis', fallbackText: 'Letter A', version: 1, description: 'Letter name A' },
  'phoneme.a': { id: 'phoneme.a', type: 'phoneme', source: 'local', url: '/audio/phoneme_a.mp3', fallbackText: '/æ/', version: 1, description: 'Oxford British English short A sound /æ/' },

  'letter.b': { id: 'letter.b', type: 'letter', source: 'speech-synthesis', fallbackText: 'Letter B', version: 1, description: 'Letter name B' },
  'phoneme.b': { id: 'phoneme.b', type: 'phoneme', source: 'local', url: '/audio/phoneme_b.mp3', fallbackText: '/b/', version: 1, description: 'Oxford British English B sound /b/' },

  'letter.c': { id: 'letter.c', type: 'letter', source: 'speech-synthesis', fallbackText: 'Letter C', version: 1, description: 'Letter name C' },
  'phoneme.c': { id: 'phoneme.c', type: 'phoneme', source: 'local', url: '/audio/phoneme_c.mp3', fallbackText: '/k/', version: 1, description: 'Oxford British English hard C sound /k/' },

  'letter.d': { id: 'letter.d', type: 'letter', source: 'speech-synthesis', fallbackText: 'Letter D', version: 1, description: 'Letter name D' },
  'phoneme.d': { id: 'phoneme.d', type: 'phoneme', source: 'local', url: '/audio/phoneme_d.mp3', fallbackText: '/d/', version: 1, description: 'Oxford British English D sound /d/' },

  'letter.e': { id: 'letter.e', type: 'letter', source: 'speech-synthesis', fallbackText: 'Letter E', version: 1, description: 'Letter name E' },
  'phoneme.e': { id: 'phoneme.e', type: 'phoneme', source: 'local', url: '/audio/phoneme_e.mp3', fallbackText: '/e/', version: 1, description: 'Oxford British English short E sound /e/' },

  'letter.f': { id: 'letter.f', type: 'letter', source: 'speech-synthesis', fallbackText: 'Letter F', version: 1, description: 'Letter name F' },
  'phoneme.f': { id: 'phoneme.f', type: 'phoneme', source: 'local', url: '/audio/phoneme_f.mp3', fallbackText: '/f/', version: 1, description: 'Oxford British English F sound /f/' },

  'letter.g': { id: 'letter.g', type: 'letter', source: 'speech-synthesis', fallbackText: 'Letter G', version: 1, description: 'Letter name G' },
  'phoneme.g': { id: 'phoneme.g', type: 'phoneme', source: 'local', url: '/audio/phoneme_g.mp3', fallbackText: '/g/', version: 1, description: 'Oxford British English hard G sound /g/' },

  'letter.h': { id: 'letter.h', type: 'letter', source: 'speech-synthesis', fallbackText: 'Letter H', version: 1, description: 'Letter name H' },
  'phoneme.h': { id: 'phoneme.h', type: 'phoneme', source: 'local', url: '/audio/phoneme_h.mp3', fallbackText: '/h/', version: 1, description: 'Oxford British English H sound /h/' },

  'letter.i': { id: 'letter.i', type: 'letter', source: 'speech-synthesis', fallbackText: 'Letter I', version: 1, description: 'Letter name I' },
  'phoneme.i': { id: 'phoneme.i', type: 'phoneme', source: 'local', url: '/audio/phoneme_i.mp3', fallbackText: '/ɪ/', version: 1, description: 'Oxford British English short I sound /ɪ/' },

  'letter.j': { id: 'letter.j', type: 'letter', source: 'speech-synthesis', fallbackText: 'Letter J', version: 1, description: 'Letter name J' },
  'phoneme.j': { id: 'phoneme.j', type: 'phoneme', source: 'local', url: '/audio/phoneme_j.mp3', fallbackText: '/dʒ/', version: 1, description: 'Oxford British English J sound /dʒ/' },

  'letter.k': { id: 'letter.k', type: 'letter', source: 'speech-synthesis', fallbackText: 'Letter K', version: 1, description: 'Letter name K' },
  'phoneme.k': { id: 'phoneme.k', type: 'phoneme', source: 'local', url: '/audio/phoneme_k.mp3', fallbackText: '/k/', version: 1, description: 'Oxford British English K sound /k/' },

  'letter.l': { id: 'letter.l', type: 'letter', source: 'speech-synthesis', fallbackText: 'Letter L', version: 1, description: 'Letter name L' },
  'phoneme.l': { id: 'phoneme.l', type: 'phoneme', source: 'local', url: '/audio/phoneme_l.mp3', fallbackText: '/l/', version: 1, description: 'Oxford British English L sound /l/' },

  'letter.m': { id: 'letter.m', type: 'letter', source: 'speech-synthesis', fallbackText: 'Letter M', version: 1, description: 'Letter name M' },
  'phoneme.m': { id: 'phoneme.m', type: 'phoneme', source: 'local', url: '/audio/phoneme_m.mp3', fallbackText: '/m/', version: 1, description: 'Oxford British English M sound /m/' },

  'letter.n': { id: 'letter.n', type: 'letter', source: 'speech-synthesis', fallbackText: 'Letter N', version: 1, description: 'Letter name N' },
  'phoneme.n': { id: 'phoneme.n', type: 'phoneme', source: 'local', url: '/audio/phoneme_n.mp3', fallbackText: '/n/', version: 1, description: 'Oxford British English N sound /n/' },

  'letter.o': { id: 'letter.o', type: 'letter', source: 'speech-synthesis', fallbackText: 'Letter O', version: 1, description: 'Letter name O' },
  'phoneme.o': { id: 'phoneme.o', type: 'phoneme', source: 'local', url: '/audio/phoneme_o.mp3', fallbackText: '/ɒ/', version: 1, description: 'Oxford British English short O sound /ɒ/' },

  'letter.p': { id: 'letter.p', type: 'letter', source: 'speech-synthesis', fallbackText: 'Letter P', version: 1, description: 'Letter name P' },
  'phoneme.p': { id: 'phoneme.p', type: 'phoneme', source: 'local', url: '/audio/phoneme_p.mp3', fallbackText: '/p/', version: 1, description: 'Oxford British English P sound /p/' },

  'letter.q': { id: 'letter.q', type: 'letter', source: 'speech-synthesis', fallbackText: 'Letter Q', version: 1, description: 'Letter name Q' },
  'phoneme.q': { id: 'phoneme.q', type: 'phoneme', source: 'local', url: '/audio/phoneme_q.mp3', fallbackText: '/kw/', version: 1, description: 'Oxford British English Q sound /k/' },

  'letter.r': { id: 'letter.r', type: 'letter', source: 'speech-synthesis', fallbackText: 'Letter R', version: 1, description: 'Letter name R' },
  'phoneme.r': { id: 'phoneme.r', type: 'phoneme', source: 'local', url: '/audio/phoneme_r.mp3', fallbackText: '/r/', version: 1, description: 'Oxford British English R sound /r/' },

  'letter.s': { id: 'letter.s', type: 'letter', source: 'speech-synthesis', fallbackText: 'Letter S', version: 1, description: 'Letter name S' },
  'phoneme.s': { id: 'phoneme.s', type: 'phoneme', source: 'local', url: '/audio/phoneme_s.mp3', fallbackText: '/s/', version: 1, description: 'Oxford British English S sound /s/' },

  'letter.t': { id: 'letter.t', type: 'letter', source: 'speech-synthesis', fallbackText: 'Letter T', version: 1, description: 'Letter name T' },
  'phoneme.t': { id: 'phoneme.t', type: 'phoneme', source: 'local', url: '/audio/phoneme_t.mp3', fallbackText: '/t/', version: 1, description: 'Oxford British English T sound /t/' },

  'letter.u': { id: 'letter.u', type: 'letter', source: 'speech-synthesis', fallbackText: 'Letter U', version: 1, description: 'Letter name U' },
  'phoneme.u': { id: 'phoneme.u', type: 'phoneme', source: 'local', url: '/audio/phoneme_u.mp3', fallbackText: '/ʌ/', version: 1, description: 'Oxford British English short U sound /ʌ/' },

  'letter.v': { id: 'letter.v', type: 'letter', source: 'speech-synthesis', fallbackText: 'Letter V', version: 1, description: 'Letter name V' },
  'phoneme.v': { id: 'phoneme.v', type: 'phoneme', source: 'local', url: '/audio/phoneme_v.mp3', fallbackText: '/v/', version: 1, description: 'Oxford British English V sound /v/' },

  'letter.w': { id: 'letter.w', type: 'letter', source: 'speech-synthesis', fallbackText: 'Letter W', version: 1, description: 'Letter name W' },
  'phoneme.w': { id: 'phoneme.w', type: 'phoneme', source: 'local', url: '/audio/phoneme_w.mp3', fallbackText: '/w/', version: 1, description: 'Oxford British English W sound /w/' },

  'letter.x': { id: 'letter.x', type: 'letter', source: 'speech-synthesis', fallbackText: 'Letter X', version: 1, description: 'Letter name X' },
  'phoneme.x': { id: 'phoneme.x', type: 'phoneme', source: 'local', url: '/audio/phoneme_x.mp3', fallbackText: '/ks/', version: 1, description: 'Oxford British English X sound /ks/' },

  'letter.y': { id: 'letter.y', type: 'letter', source: 'speech-synthesis', fallbackText: 'Letter Y', version: 1, description: 'Letter name Y' },
  'phoneme.y': { id: 'phoneme.y', type: 'phoneme', source: 'local', url: '/audio/phoneme_y.mp3', fallbackText: '/j/', version: 1, description: 'Oxford British English Y sound /j/' },

  'letter.z': { id: 'letter.z', type: 'letter', source: 'speech-synthesis', fallbackText: 'Letter Z', version: 1, description: 'Letter name Z' },
  'phoneme.z': { id: 'phoneme.z', type: 'phoneme', source: 'local', url: '/audio/phoneme_z.mp3', fallbackText: '/z/', version: 1, description: 'Oxford British English Z sound /z/' },

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
  // All 84 curriculum words are bundled as local static assets in public/audio/words/
  if (audioId.startsWith('word.')) {
    const base = audioManifest[audioId];
    return {
      id: audioId,
      type: 'word',
      source: 'local',
      url: `/audio/words/${audioId}.mp3`,
      fallbackText: base?.fallbackText || audioId.replace(/^word\.[a-z]-?/, ''),
      version: 1,
      description: base?.description || 'Curriculum word audio',
    };
  }

  const base = audioManifest[audioId];
  if (!base) return undefined;

  const generated = generatedAudioManifest[audioId];
  if (generated?.url) {
    // Phase 2 merge: Cloudinary URL + source override the base entry transparently.
    // fallbackText stays intact for error-recovery fallback.
    return {
      ...base,
      url: generated.url,
      source: 'cloudinary',
    };
  }

  return base;
};

export const getRandomPraiseAudioId = (): string => {
  return praiseKeys[Math.floor(Math.random() * praiseKeys.length)];
};
