import React, { useRef } from 'react';
import { soundPictures } from '../../curriculum/phaseOneActivities';
import { findGpc, phonemeAudioSymbols } from '../../curriculum/soundPage';
import { LETTERS_AND_SOUNDS } from '../../data/lettersAndSounds';
import { audioService } from '../../services/audioService';
import { LetterOnLines } from './LetterOnLines';
import { playSymbols } from './teachingUi';

interface SoundPicturesProps {
  readonly gpcId: string;
}

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Pictures for a sound; tapping one plays the sound, then the word, to link the two. */
export const SoundPictures: React.FC<SoundPicturesProps> = ({ gpcId }) => {
  const tokenRef = useRef(0);
  const gpc = findGpc(LETTERS_AND_SOUNDS, gpcId)?.gpc;
  const { position, pictures } = soundPictures(gpcId);
  if (!gpc || pictures.length === 0) return null;

  const play = async (wordAudioId: string) => {
    tokenRef.current += 1;
    const token = tokenRef.current;
    const isCurrent = () => tokenRef.current === token;
    await playSymbols(phonemeAudioSymbols(gpc.phoneme), isCurrent);
    if (!isCurrent()) return;
    await pause(250);
    if (isCurrent()) await audioService.playVoice(wordAudioId, { interrupt: true });
  };

  return (
    <section aria-label={`Things that ${position} with ${gpc.grapheme}`} className="mt-4">
      <h3 className="font-black text-base flex items-center justify-center gap-2">
        Things that {position === 'start' ? 'start' : 'end'} with <LetterOnLines graphemes={[gpc.grapheme]} className="h-9" />
      </h3>
      <p className="text-xs text-gray-600 text-center mt-1">Tap a picture: hear the sound, then the word. Say them together.</p>
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {pictures.map((picture) => (
          <button
            key={picture.id}
            type="button"
            onClick={() => void play(picture.wordAudioId)}
            aria-label={`Hear ${gpc.grapheme} then ${picture.name.toLowerCase()}`}
            className="min-h-[112px] rounded-3xl border-2 border-amber-200 bg-white flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform"
          >
            <span className="text-5xl" aria-hidden="true">{picture.emoji}</span>
            <span className="text-lg font-black font-fun text-gray-800">{picture.name.toLowerCase()}</span>
          </button>
        ))}
      </div>
    </section>
  );
};
