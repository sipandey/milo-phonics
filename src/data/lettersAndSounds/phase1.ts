import type { LettersAndSoundsPhase } from '../../types/lettersAndSounds';

/**
 * Phase 1 is listening and speaking, not reading. Activity ideas are short
 * prompts for the adult; most are meant to happen away from the screen.
 */
export const PHASE_1: LettersAndSoundsPhase = {
  id: 1,
  title: 'Phase 1',
  approxAge: '3–4',
  summary: 'Listening to and repeating sounds, rhythm, and rhyme; enjoying books together.',
  sets: [],
  trickyWords: [],
  aspects: [
    {
      id: 'p1.environmental',
      title: 'Environmental sounds',
      description: 'Notice and name everyday sounds.',
      activityIdeas: ['Go on a listening walk and name three sounds.', 'Hear a sound and find the matching picture.'],
    },
    {
      id: 'p1.instrumental',
      title: 'Instrumental sounds',
      description: 'Explore loud and quiet, fast and slow with instruments.',
      activityIdeas: ['Make a kitchen band with pans and spoons.', 'Guess which instrument made the sound.'],
    },
    {
      id: 'p1.body-percussion',
      title: 'Body percussion',
      description: 'Make and copy sounds and rhythms with the body.',
      activityIdeas: ['Clap a pattern and copy it back.', 'Clap the syllables in family names.'],
    },
    {
      id: 'p1.rhythm-rhyme',
      title: 'Rhythm and rhyme',
      description: 'Hear rhythm and spot words that rhyme.',
      activityIdeas: ['Leave out the rhyming word in a nursery rhyme.', 'Find the odd one out: cat, hat, dog.'],
    },
    {
      id: 'p1.alliteration',
      title: 'Alliteration',
      description: 'Hear words that start with the same sound.',
      activityIdeas: ['Play I spy with sounds: something beginning with /s/.', 'Collect toys that start with /m/.'],
    },
    {
      id: 'p1.voice-sounds',
      title: 'Voice sounds',
      description: 'Play with the voice to make and copy sounds.',
      activityIdeas: ['Make animal and machine sounds: sss snake, mmm yum.', 'Copy a sound high, low, loud, and quiet.'],
    },
    {
      id: 'p1.oral-blending',
      title: 'Oral blending and segmenting',
      description: 'Blend spoken sounds into a word, and split a word into its sounds, without letters.',
      activityIdeas: ['Robot talk: "pass the c-u-p".', 'Say a word and tap out each sound together.'],
    },
  ],
};
