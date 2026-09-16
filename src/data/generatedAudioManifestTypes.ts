/**
 * Types for the generated audio manifest.
 * Shared between the browser app and the generation script.
 */

export interface GeneratedAudioEntry {
  /** Semantic audio ID — the app's stable identity e.g. "word.monkey" */
  id: string;
  /** Cloudinary CDN URL for the generated MP3 */
  url: string;
  /** Cloudinary public_id for the asset */
  cloudinaryPublicId: string;
  /** Text that was sent to TTS */
  text: string;
  /** TTS model used e.g. "gpt-4o-mini-tts" */
  model: string;
  /** TTS voice used e.g. "coral" */
  voice: string;
  /** Instruction config version — bump to force regeneration */
  instructionVersion?: number;
  /** SHA-256 fingerprint of: id+text+model+voice+instructionVersion */
  fingerprint?: string;
  /** ISO 8601 timestamp of when this asset was generated */
  generatedAt?: string;
  /** Audio format e.g. "mp3" */
  format: string;
  /** Optional local static asset path for zero-latency offline playback */
  localUrl?: string;
}

export interface GeneratedManifestFile {
  /** Schema version for the manifest format itself */
  schemaVersion: number;
  /** ISO 8601 timestamp of last generation run */
  lastGeneratedAt: string;
  /** TTS configuration snapshot used for this generation */
  config: {
    model: string;
    voice: string;
    instructionVersion: number;
    format: string;
  };
  /** All generated entries keyed by semantic audio ID */
  entries: Record<string, GeneratedAudioEntry>;
}
