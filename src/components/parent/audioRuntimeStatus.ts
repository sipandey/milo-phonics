export interface AudioRuntimeStatus {
  readonly summary: string;
  readonly heading: string;
  readonly phonemeLabel: string;
  readonly phonemeStatus: string;
  readonly phonemeDescription: string;
  readonly curriculumLabel: string;
  readonly curriculumStatus: string;
  readonly curriculumDescription: string;
  readonly nativeSpeechLabel: string;
  readonly nativeSpeechStatus: string;
  readonly blendTestLabel: string;
}

export const AUDIO_RUNTIME_STATUS: AudioRuntimeStatus = {
  summary: 'Bundled pre-recorded audio is active.',
  heading: 'Audio Engine: Bundled Pre-Recorded Audio',
  phonemeLabel: '1. Phoneme audio:',
  phonemeStatus: 'Active (bundled local assets)',
  phonemeDescription: 'Bundled phoneme recordings are served from the app’s local audio assets.',
  curriculumLabel: '2. Curriculum word and blend audio:',
  curriculumStatus: 'Active (bundled local assets)',
  curriculumDescription: 'Bundled audio is selected at runtime; CDN URLs remain generation metadata only.',
  nativeSpeechLabel: '3. Browser SpeechSynthesis:',
  nativeSpeechStatus: 'Disabled (zero native speech)',
  blendTestLabel: 'Test Phoneme and Word Blend (/s/... Sun!)',
};
