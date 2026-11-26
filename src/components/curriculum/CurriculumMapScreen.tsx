import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { LETTERS_AND_SOUNDS } from '../../data/lettersAndSounds';
import { findGpc, selectPractiseWords } from '../../curriculum/soundPage';
import { isDecodableWith, parseSegmentedWord } from '../../curriculum/lettersAndSoundsValidation';
import { useTeachingProgress } from '../../hooks/useTeachingProgress';
import { teachingProgressStore } from '../../services/teachingProgressStore';
import { DEFAULT_CHILD_ID, getItemState, knownGraphemes, setFocus } from '../../services/teachingProgress';
import type { LettersAndSoundsPhaseId } from '../../types/lettersAndSounds';
import { STATUS_STYLES, StatusButtons, recordMark } from './teachingUi';

import type { PhaseOneActivityId } from '../../curriculum/phaseOneActivities';

export type { PhaseOneActivityId };

/** Games available for each Phase 1 aspect. */
const ASPECT_ACTIVITIES: Record<string, readonly { id: PhaseOneActivityId; label: string }[]> = {
  'p1.oral-blending': [
    { id: 'robot-blending', label: '🤖 Robot Milo (blending)' },
    { id: 'sound-boxes', label: '🟦 Sound boxes (segmenting)' },
  ],
  'p1.alliteration': [{ id: 'first-sounds', label: '🦁 First sounds' }],
  'p1.rhythm-rhyme': [{ id: 'odd-one-out', label: '🎵 Odd one out' }],
};

interface CurriculumMapScreenProps {
  readonly onBack: () => void;
  readonly onOpenSound: (gpcId: string) => void;
  readonly onOpenActivity: (activityId: PhaseOneActivityId) => void;
  readonly onOpenReader: (readerId: string) => void;
}

/** Remembers the open phase tab while the app is running, so returning from a sound page or reader keeps it. */
let lastPhaseId: LettersAndSoundsPhaseId = 2;

export const CurriculumMapScreen: React.FC<CurriculumMapScreenProps> = ({ onBack, onOpenSound, onOpenActivity, onOpenReader }) => {
  const doc = useTeachingProgress();
  const [phaseId, setPhaseIdState] = useState<LettersAndSoundsPhaseId>(lastPhaseId);
  const setPhaseId = (next: LettersAndSoundsPhaseId) => {
    lastPhaseId = next;
    setPhaseIdState(next);
  };
  const phase = LETTERS_AND_SOUNDS.phases.find((candidate) => candidate.id === phaseId);
  const status = (itemId: string) => getItemState(doc, DEFAULT_CHILD_ID, itemId)?.status ?? null;
  const focusIds = doc.children[DEFAULT_CHILD_ID]?.focus.ids ?? [];
  const known = knownGraphemes(doc, DEFAULT_CHILD_ID, LETTERS_AND_SOUNDS);
  const practise = selectPractiseWords(LETTERS_AND_SOUNDS, known, focusIds);

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-4xl mx-auto text-gray-800">
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to home"
          className="min-h-[56px] min-w-[56px] rounded-2xl bg-white border-2 border-gray-200 flex items-center justify-center cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl font-black font-fun">Curriculum map</h1>
          <p className="text-xs text-gray-500">Pick any sound. Mark what is introduced and how practice went.</p>
        </div>
      </div>

      <section aria-label="Practise these" className="mb-5 rounded-3xl bg-amber-50 border-2 border-amber-200 p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-black">★ Practise these</h2>
          {focusIds.length > 0 && (
            <button
              type="button"
              onClick={() => teachingProgressStore.update((current) => setFocus(current, DEFAULT_CHILD_ID, [], new Date()))}
              className="min-h-[44px] px-3 rounded-xl bg-white border-2 border-amber-200 text-sm font-bold cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
        {focusIds.length === 0 ? (
          <p className="text-sm text-amber-900 mt-1">Open a sound and choose “Practise this sound”.</p>
        ) : (
          <>
            <div className="flex gap-2 flex-wrap mt-2">
              {focusIds.map((id) => {
                const gpc = findGpc(LETTERS_AND_SOUNDS, id)?.gpc;
                return gpc ? (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onOpenSound(id)}
                    className="min-h-[44px] px-4 rounded-xl bg-amber-400 text-amber-950 font-black cursor-pointer"
                  >
                    {gpc.grapheme}
                  </button>
                ) : null;
              })}
            </div>
            <p className="text-sm mt-3">
              <span className="font-bold">Words: </span>
              {practise.words.length > 0 ? practise.words.slice(0, 10).map((word) => word.text).join(', ') : 'none yet'}
            </p>
            {practise.needsMoreSounds && (
              <p className="text-xs text-amber-900 mt-1">
                Fewer than three words fit. Mark another sound as introduced, or blend by listening only.
              </p>
            )}
          </>
        )}
      </section>

      <nav aria-label="Phases" className="flex gap-2 mb-5 overflow-x-auto">
        {LETTERS_AND_SOUNDS.phases.map((candidate) => (
          <button
            key={candidate.id}
            type="button"
            aria-pressed={candidate.id === phaseId}
            onClick={() => setPhaseId(candidate.id)}
            className={`min-h-[56px] px-5 rounded-2xl border-2 font-black whitespace-nowrap cursor-pointer ${
              candidate.id === phaseId ? 'bg-sky-500 text-white border-sky-600' : 'bg-white border-gray-200'
            }`}
          >
            {candidate.title}
          </button>
        ))}
      </nav>

      {phase && (
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            {phase.summary} <span className="text-gray-400">Guide age: {phase.approxAge}.</span>
          </p>

          {phase.aspects?.map((aspect) => (
            <section key={aspect.id} className={`rounded-3xl border-2 p-4 ${STATUS_STYLES[status(aspect.id) ?? 'none']}`}>
              <h2 className="font-black text-lg text-gray-900">{aspect.title}</h2>
              <p className="text-sm text-gray-700">{aspect.description}</p>
              <ul className="list-disc pl-5 text-sm text-gray-700 my-2">
                {aspect.activityIdeas.map((idea) => <li key={idea}>{idea}</li>)}
              </ul>
              {(ASPECT_ACTIVITIES[aspect.id]?.length ?? 0) > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                  {ASPECT_ACTIVITIES[aspect.id]?.map((activity) => (
                    <button
                      key={activity.id}
                      type="button"
                      onClick={() => onOpenActivity(activity.id)}
                      className="min-h-[56px] px-4 rounded-2xl bg-amber-400 text-amber-950 font-black cursor-pointer active:scale-95 transition-transform"
                    >
                      {activity.label}
                    </button>
                  ))}
                </div>
              )}
              <StatusButtons itemLabel={aspect.title} current={status(aspect.id)} onMark={(next) => recordMark(aspect.id, next)} compact />
            </section>
          ))}

          {phase.sets.map((set) => (
            <section key={set.id}>
              <h2 className="font-black text-lg mb-2">{set.title}</h2>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {set.gpcs.map((gpc) => (
                  <button
                    key={gpc.id}
                    type="button"
                    onClick={() => onOpenSound(gpc.id)}
                    aria-label={`Open the sound ${gpc.grapheme}${status(gpc.id) ? `, ${status(gpc.id)}` : ', not introduced'}`}
                    className={`relative min-h-[88px] rounded-3xl border-4 text-3xl font-black font-fun cursor-pointer active:scale-95 transition-transform ${
                      STATUS_STYLES[status(gpc.id) ?? 'none']
                    }`}
                  >
                    {gpc.grapheme}
                    {gpc.id.endsWith('-short') && <span className="block text-xs font-bold">short</span>}
                    {gpc.id.endsWith('-long') && <span className="block text-xs font-bold">long</span>}
                    {focusIds.includes(gpc.id) && <span className="absolute top-1 right-2 text-base" aria-hidden="true">★</span>}
                  </button>
                ))}
              </div>
              {set.gpcs.some((gpc) => gpc.words.length > 0) && (
                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-bold text-gray-600">Blending in {set.title}:</span>
                  <StatusButtons itemLabel={`blending in ${set.title}`} current={status(`blend.${set.id}`)} onMark={(next) => recordMark(`blend.${set.id}`, next)} compact />
                </div>
              )}
            </section>
          ))}

          {(phase.adjacentConsonantWords?.length ?? 0) > 0 && (
            <section>
              <h2 className="font-black text-lg mb-2">Words with adjacent consonants</h2>
              <p className="text-sm mb-3">{phase.adjacentConsonantWords?.map((word) => parseSegmentedWord(word).text).join(', ')}</p>
              <StatusButtons itemLabel="adjacent consonant blending" current={status(`blend.phase${phase.id}`)} onMark={(next) => recordMark(`blend.phase${phase.id}`, next)} compact />
            </section>
          )}

          {(phase.readers?.length ?? 0) > 0 && (
            <section>
              <h2 className="font-black text-lg mb-2">Little readers</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {phase.readers?.map((reader) => {
                  const id = `reader.${reader.id}`;
                  const ready = reader.pages.every((page) =>
                    page.words.every((word) => word.startsWith('*') || isDecodableWith(word, known, { allowDoubledConsonants: [...known].some((g) => /^(ff|ll|ss|zz)$/.test(g)) })),
                  );
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => onOpenReader(reader.id)}
                      aria-label={`Open the reader ${reader.title}${ready ? ', ready' : ', needs more sounds'}`}
                      className={`min-h-[72px] rounded-2xl border-2 p-3 text-left flex items-center gap-3 cursor-pointer ${STATUS_STYLES[status(id) ?? 'none']}`}
                    >
                      <span className="text-4xl" aria-hidden="true">{reader.pages[0]?.picture}</span>
                      <span>
                        <span className="block font-black text-gray-900">{reader.title}</span>
                        <span className="block text-xs text-gray-600">{ready ? 'Ready: uses introduced sounds' : 'Needs more sounds introduced'}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {phase.trickyWords.length > 0 && (
            <section>
              <h2 className="font-black text-lg mb-2">Tricky words</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {phase.trickyWords.map((word) => {
                  const id = `tricky.${word.toLowerCase()}`;
                  return (
                    <div key={id} className={`rounded-2xl border-2 p-2 flex items-center justify-between gap-2 ${STATUS_STYLES[status(id) ?? 'none']}`}>
                      <span className="text-2xl font-black font-fun pl-2 text-gray-900">{word}</span>
                      <StatusButtons itemLabel={`the tricky word ${word}`} current={status(id)} onMark={(next) => recordMark(id, next)} compact />
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
