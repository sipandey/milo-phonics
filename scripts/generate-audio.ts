/**
 * Phase 2 Audio Generation Pipeline
 * ===================================
 * Development-time script — NEVER runs in the browser.
 *
 * Usage:
 *   npm run generate:audio              — generate all eligible assets
 *   npm run generate:audio -- --dry-run — preview what would be generated
 *   npm run generate:audio -- --id word.monkey
 *   npm run generate:audio -- --type phrase
 *
 * Requires .env with:
 *   OPENAI_API_KEY, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,
 *   CLOUDINARY_API_SECRET, TTS_MODEL, AUDIO_TTS_VOICE, TTS_INSTRUCTION_VERSION
 *
 * Outputs:
 *   - generated/audio/<id>.mp3          (temp, gitignored)
 *   - src/data/generatedAudioManifest.ts (committed, consumed by app)
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { v2 as cloudinary } from 'cloudinary';
import type { AudioType } from '../src/types/phonics.js';
import type { GeneratedAudioEntry, GeneratedManifestFile } from '../src/data/generatedAudioManifestTypes.js';

// ============================================================
// PATHS
// ============================================================

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const GENERATED_AUDIO_DIR = path.join(ROOT, 'generated', 'audio');
const GENERATED_MANIFEST_TS = path.join(ROOT, 'src', 'data', 'generatedAudioManifest.ts');
const GENERATED_MANIFEST_JSON = path.join(ROOT, 'generated', 'generatedAudioManifest.json');

// ============================================================
// CONFIG
// ============================================================

const CONFIG = {
  model: process.env.TTS_MODEL ?? 'gpt-4o-mini-tts',
  voice: (process.env.AUDIO_TTS_VOICE ?? 'coral') as string,
  format: 'mp3' as const,
  instructionVersion: parseInt(process.env.TTS_INSTRUCTION_VERSION ?? '1', 10),
  cloudinaryFolder: 'phonics/audio/v1',
};

// ============================================================
// TTS INSTRUCTIONS BY AUDIO TYPE
// Centralised — bump TTS_INSTRUCTION_VERSION in .env when changing.
// ============================================================

const TTS_INSTRUCTIONS: Record<AudioType, string> = {
  letter: `You are a warm, friendly narrator for a toddler phonics app for children aged 2-3.
Speak the letter name clearly, naturally, and at a gentle, unhurried pace.
Be encouraging and child-appropriate. Do not sound robotic or overly formal.
Do not exaggerate or be theatrical. Just warm and clear.`,

  phoneme: `You are a warm, friendly narrator for a toddler phonics app for children aged 2-3.
Pronounce this isolated phoneme sound clearly and naturally.
The sound should be the pure phoneme — not the letter name.
Be gentle, warm, and easy to understand for a very young child.
Slightly elongate the sound to help children hear it, but do not overdo it.`,

  word: `You are a warm, friendly narrator for a toddler phonics app for children aged 2-3.
Say this single word clearly, naturally, and warmly.
Pace yourself so a 2-year-old can easily hear and repeat the word.
Be encouraging — make it sound like a discovery, not a drill.`,

  phrase: `You are a warm, friendly narrator for a toddler phonics app for children aged 2-3.
Read this short phrase clearly and warmly, as if pointing something out to an excited toddler.
Make it sound like a gentle, joyful discovery.
Natural pacing — not too fast, not exaggeratedly slow.
The "..." represents a brief natural pause before the word.`,

  prompt: `You are a warm, friendly narrator for a toddler phonics app for children aged 2-3.
Say this prompt in a friendly, inviting, playful tone.
Make the child feel excited and safe to explore.
Natural conversational energy — not theatrical, not flat.`,

  praise: `You are a warm, friendly narrator for a toddler phonics app for children aged 2-3.
Say this short praise enthusiastically but not over-the-top.
Sound genuinely happy and encouraging.
Keep it brief and joyful.`,
};

// ============================================================
// PHONEME SAFETY POLICY
// ============================================================
// Phonemes require special care in TTS. A TTS system given "M" may say
// the letter name "em" rather than the isolated /m/ phoneme.
// Even extended forms like "Mmmmm" may vary by model/voice.
//
// Policy: phonemes are NOT auto-generated. They are flagged needs-review.
// The fallbackText in audioManifest already gives SpeechSynthesis a reasonable
// approximation. Humans must verify and approve phoneme audio.
//
// To override: set GENERATE_PHONEMES=true in .env (not recommended for production).
// ============================================================
const GENERATE_PHONEMES = process.env.GENERATE_PHONEMES === 'true';

// ============================================================
// AUDIO MANIFEST (loaded at runtime from source — no duplication)
// ============================================================

// We import the raw audioManifest entries directly so the script uses
// the same source of truth as the app. We strip the generatedAudioManifest
// circular dependency by importing only the raw data.

interface RawAudioEntry {
  id: string;
  type: AudioType;
  fallbackText: string;
  source: string;
  version?: number;
  description?: string;
  url?: string;
}

function loadAudioManifest(): Record<string, RawAudioEntry> {
  // Read and parse the audioManifest.ts source directly.
  // We use a simplified regex extraction so we avoid circular imports
  // (generatedAudioManifest.ts would import from itself via audioManifest.ts).
  const manifestPath = path.join(ROOT, 'src', 'data', 'audioManifest.ts');
  const source = fs.readFileSync(manifestPath, 'utf-8');

  // Extract the raw audioManifest object literal entries using a simple approach:
  // Find the start of `export const audioManifest` and extract entries from it.
  // We do this by building entries from the known pattern in the TS source.
  const entries: Record<string, RawAudioEntry> = {};

  // Match each entry block: 'key': { ... }
  const entryPattern = /'([^']+)':\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
  let match: RegExpExecArray | null;

  while ((match = entryPattern.exec(source)) !== null) {
    const key = match[1];
    const body = match[2];

    // Skip non-manifest entries (praiseKeys array etc.)
    if (!body.includes('type:') || !body.includes('fallbackText:')) continue;

    const extractField = (field: string): string | undefined => {
      // Support both 'single' and "double" quoted strings, including apostrophes in double-quoted strings
      // First try double-quoted (allows apostrophes inside)
      const dq = body.match(new RegExp(`${field}:\\s*"([^"]+)"`));
      if (dq) return dq[1];
      // Then single-quoted
      const sq = body.match(new RegExp(`${field}:\\s*'([^']+)'`));
      if (sq) return sq[1];
      return undefined;
    };

    const extractNumber = (field: string): number | undefined => {
      const m = body.match(new RegExp(`${field}:\\s*(\\d+)`));
      return m ? parseInt(m[1], 10) : undefined;
    };

    const id = extractField('id') ?? key;
    const type = extractField('type') as AudioType | undefined;
    const fallbackText = extractField('fallbackText');
    const sourceVal = extractField('source') ?? 'speech-synthesis';
    const version = extractNumber('version');
    const description = extractField('description');

    if (id && type && fallbackText) {
      entries[key] = { id, type, fallbackText, source: sourceVal, version, description };
    }
  }

  return entries;
}

// ============================================================
// EXISTING GENERATED MANIFEST (for idempotency)
// ============================================================

function loadExistingGeneratedManifest(): GeneratedManifestFile | null {
  if (!fs.existsSync(GENERATED_MANIFEST_JSON)) return null;
  try {
    const raw = fs.readFileSync(GENERATED_MANIFEST_JSON, 'utf-8');
    return JSON.parse(raw) as GeneratedManifestFile;
  } catch {
    return null;
  }
}

// ============================================================
// FINGERPRINTING
// ============================================================

function computeFingerprint(
  id: string,
  text: string,
  model: string,
  voice: string,
  instructionVersion: number,
): string {
  const payload = `${id}|${text}|${model}|${voice}|${instructionVersion}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

// ============================================================
// CLOUDINARY PUBLIC ID
// ============================================================

function toCloudinaryPublicId(audioId: string, type: AudioType): string {
  // e.g. "word.monkey" → "phonics/audio/v1/word/monkey"
  //      "phrase.m-monkey" → "phonics/audio/v1/phrase/m-monkey"
  //      "letter.m" → "phonics/audio/v1/letter/m"
  const suffix = audioId.replace('.', '/');
  return `${CONFIG.cloudinaryFolder}/${suffix}`;
}

// ============================================================
// OPENAI TTS
// ============================================================

async function generateTTS(
  client: OpenAI,
  text: string,
  type: AudioType,
  outputPath: string,
): Promise<void> {
  const instructions = TTS_INSTRUCTIONS[type];

  const response = await client.audio.speech.create({
    model: CONFIG.model,
    voice: CONFIG.voice as Parameters<typeof client.audio.speech.create>[0]['voice'],
    input: text,
    instructions,
    response_format: CONFIG.format,
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
}

// ============================================================
// CLOUDINARY UPLOAD
// ============================================================

async function uploadToCloudinary(
  localPath: string,
  publicId: string,
): Promise<{ url: string; public_id: string }> {
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      resource_type: 'video', // Cloudinary uses 'video' for audio/video files
      public_id: publicId,    // already includes folder path e.g. "phonics/audio/v1/word/monkey"
      overwrite: true,
      format: CONFIG.format,
      use_filename: false,
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (err: unknown) {
    // Cloudinary SDK throws objects, not proper Error instances
    if (err && typeof err === 'object') {
      const e = err as Record<string, unknown>;
      const detail = e['message'] ?? e['error'] ?? e['http_code'] ?? JSON.stringify(err);
      throw new Error(`Cloudinary error: ${detail}`);
    }
    throw err;
  }
}

// ============================================================
// MANIFEST WRITER
// ============================================================

function writeGeneratedManifestTS(entries: Record<string, GeneratedAudioEntry>): void {
  const entryLines = Object.values(entries)
    .map((e) => {
      return `  ${JSON.stringify(e.id)}: ${JSON.stringify(e, null, 4).replace(/^/gm, '  ').trim()},`;
    })
    .join('\n');

  const ts = `/**
 * GENERATED FILE — do not edit by hand.
 *
 * This file is produced by: npm run generate:audio
 *
 * It contains the Cloudinary URLs and generation metadata for all
 * pre-generated TTS voice assets. The AudioManager merges this with
 * the base audioManifest so that generated audio takes precedence
 * over SpeechSynthesis fallback.
 *
 * Commit this file — it is source code, not a secret.
 * Do NOT commit .env — it contains secrets.
 *
 * Last generated: ${new Date().toISOString()}
 * Model: ${CONFIG.model} | Voice: ${CONFIG.voice} | Instruction version: ${CONFIG.instructionVersion}
 */

import type { GeneratedAudioEntry } from './generatedAudioManifestTypes';

/**
 * Generated audio entries keyed by semantic audio ID.
 * Each entry contains the Cloudinary URL and generation metadata.
 */
export const generatedAudioManifest: Record<string, GeneratedAudioEntry> = {
${entryLines}
};
`;

  fs.writeFileSync(GENERATED_MANIFEST_TS, ts, 'utf-8');
}

function writeGeneratedManifestJSON(entries: Record<string, GeneratedAudioEntry>): void {
  const manifest: GeneratedManifestFile = {
    schemaVersion: 1,
    lastGeneratedAt: new Date().toISOString(),
    config: {
      model: CONFIG.model,
      voice: CONFIG.voice,
      instructionVersion: CONFIG.instructionVersion,
      format: CONFIG.format,
    },
    entries,
  };
  fs.writeFileSync(GENERATED_MANIFEST_JSON, JSON.stringify(manifest, null, 2), 'utf-8');
}

// ============================================================
// RESULT TYPES
// ============================================================

type AssetStatus = 'generated' | 'skipped' | 'failed' | 'needs-review' | 'dry-run-would-generate' | 'dry-run-would-skip';

interface AssetResult {
  id: string;
  type: AudioType;
  status: AssetStatus;
  reason?: string;
  entry?: GeneratedAudioEntry;
}

// ============================================================
// CLI ARGS
// ============================================================

function parseArgs(): { dryRun: boolean; filterId?: string; filterType?: string } {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const idIdx = args.indexOf('--id');
  const typeIdx = args.indexOf('--type');

  return {
    dryRun,
    filterId: idIdx >= 0 ? args[idIdx + 1] : undefined,
    filterType: typeIdx >= 0 ? args[typeIdx + 1] : undefined,
  };
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  const { dryRun, filterId, filterType } = parseArgs();

  console.log('\n🎵  Phonics Audio Generation Pipeline — Phase 2');
  console.log('━'.repeat(60));
  if (dryRun) console.log('🔍  DRY RUN — no OpenAI calls, no Cloudinary uploads\n');

  // Validate credentials (not needed for dry-run)
  if (!dryRun) {
    const required = ['OPENAI_API_KEY', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
    const missing = required.filter((k) => !process.env[k]);
    if (missing.length > 0) {
      console.error(`\n❌  Missing required environment variables: ${missing.join(', ')}`);
      console.error('   Copy .env.example to .env and fill in your credentials.\n');
      process.exit(1);
    }
  }

  // Configure services
  const openai = dryRun
    ? null
    : new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  if (!dryRun) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  // Ensure temp directory exists
  if (!dryRun) {
    fs.mkdirSync(GENERATED_AUDIO_DIR, { recursive: true });
  }

  // Load manifests
  const audioManifestEntries = loadAudioManifest();
  const existingManifest = loadExistingGeneratedManifest();
  const existingEntries: Record<string, GeneratedAudioEntry> = existingManifest?.entries ?? {};

  console.log(`📚  Loaded ${Object.keys(audioManifestEntries).length} audio manifest entries`);
  console.log(`🗂   Existing generated entries: ${Object.keys(existingEntries).length}`);
  console.log(`⚙️   TTS: model=${CONFIG.model}, voice=${CONFIG.voice}, instructionVersion=${CONFIG.instructionVersion}`);
  if (!GENERATE_PHONEMES) {
    console.log(`⚠️   Phonemes: NOT auto-generated (needs-review policy)`);
  }
  console.log();

  // Filter entries
  let candidates = Object.values(audioManifestEntries);

  // Skip praise.random (it's a special alias, not a real asset)
  candidates = candidates.filter((e) => e.id !== 'praise.random');

  if (filterId) {
    candidates = candidates.filter((e) => e.id === filterId);
    if (candidates.length === 0) {
      console.error(`❌  No manifest entry found for id: ${filterId}`);
      process.exit(1);
    }
  }

  if (filterType) {
    candidates = candidates.filter((e) => e.type === filterType);
    if (candidates.length === 0) {
      console.error(`❌  No manifest entries found for type: ${filterType}`);
      process.exit(1);
    }
  }

  console.log(`🎯  Processing ${candidates.length} candidate(s)\n`);

  // Process each asset
  const results: AssetResult[] = [];
  const newEntries: Record<string, GeneratedAudioEntry> = { ...existingEntries };

  for (const entry of candidates) {
    const { id, type, fallbackText: text } = entry;

    // ---- PHONEME SAFETY CHECK ----
    if (type === 'phoneme' && !GENERATE_PHONEMES) {
      console.log(`🔍  [needs-review]  ${id}  (type=phoneme — requires human approval before generation)`);
      console.log(`    Reason: TTS systems may produce the letter name instead of isolated phoneme.`);
      console.log(`    Fallback: SpeechSynthesis with "${text}" remains active.`);
      console.log(`    To generate: set GENERATE_PHONEMES=true in .env (review audio carefully).\n`);
      results.push({ id, type, status: 'needs-review', reason: 'Phoneme requires human approval' });
      continue;
    }

    // ---- FINGERPRINT / IDEMPOTENCY CHECK ----
    const fingerprint = computeFingerprint(id, text, CONFIG.model, CONFIG.voice, CONFIG.instructionVersion);
    const existing = existingEntries[id];

    if (existing && existing.fingerprint === fingerprint) {
      if (dryRun) {
        console.log(`⏭️   [dry-run-would-skip]  ${id}  (fingerprint matches, already generated)`);
      } else {
        console.log(`⏭️   [skipped]  ${id}  (fingerprint matches existing asset)`);
      }
      results.push({ id, type, status: dryRun ? 'dry-run-would-skip' : 'skipped', entry: existing });
      continue;
    }

    // ---- DRY RUN OUTPUT ----
    if (dryRun) {
      const reason = existing ? 'fingerprint changed — would regenerate' : 'new asset — would generate';
      console.log(`🔊  [dry-run-would-generate]  ${id}  (${reason})`);
      console.log(`    text: "${text}"  type: ${type}`);
      console.log(`    cloudinary: ${toCloudinaryPublicId(id, type)}`);
      console.log();
      results.push({ id, type, status: 'dry-run-would-generate', reason });
      continue;
    }

    // ---- GENERATE ----
    const localPath = path.join(GENERATED_AUDIO_DIR, `${id.replace(/\./g, '_')}.${CONFIG.format}`);
    const publicId = toCloudinaryPublicId(id, type);

    console.log(`🔊  Generating: ${id}  ("${text}")`);

    let generatedOk = false;
    let cloudinaryUrl = '';
    let cloudinaryPublicId = '';

    try {
      await generateTTS(openai!, text, type, localPath);
      generatedOk = true;
      console.log(`    ✅  TTS generated → ${path.relative(ROOT, localPath)}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`    ❌  OpenAI TTS failed: ${msg}`);
      results.push({ id, type, status: 'failed', reason: `OpenAI TTS: ${msg}` });
      continue;
    }

    try {
      const uploadResult = await uploadToCloudinary(localPath, publicId);
      cloudinaryUrl = uploadResult.url;
      cloudinaryPublicId = uploadResult.public_id;
      console.log(`    ✅  Cloudinary uploaded → ${cloudinaryUrl}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`    ❌  Cloudinary upload failed: ${msg}`);
      console.error(`    ℹ️   Local file preserved at: ${localPath}`);
      results.push({ id, type, status: 'failed', reason: `Cloudinary upload: ${msg}` });
      continue;
    }

    if (generatedOk && cloudinaryUrl) {
      const generatedEntry: GeneratedAudioEntry = {
        id,
        url: cloudinaryUrl,
        cloudinaryPublicId,
        text,
        model: CONFIG.model,
        voice: CONFIG.voice,
        instructionVersion: CONFIG.instructionVersion,
        fingerprint,
        generatedAt: new Date().toISOString(),
        format: CONFIG.format,
      };
      newEntries[id] = generatedEntry;
      results.push({ id, type, status: 'generated', entry: generatedEntry });

      // Write manifest after each successful asset so partial runs don't lose progress
      try {
        writeGeneratedManifestTS(newEntries);
        writeGeneratedManifestJSON(newEntries);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`\n⚠️   Manifest write failed after generating ${id}!`);
        console.error(`    ${msg}`);
        console.error(`    The Cloudinary asset exists but the manifest may be inconsistent.`);
        console.error(`    Cloudinary URL: ${cloudinaryUrl}`);
        // Don't exit — continue generating other assets
      }
    }

    console.log();
  }

  // ============================================================
  // FINAL REPORT
  // ============================================================

  const generated = results.filter((r) => r.status === 'generated');
  const skipped = results.filter((r) => r.status === 'skipped' || r.status === 'dry-run-would-skip');
  const failed = results.filter((r) => r.status === 'failed');
  const needsReview = results.filter((r) => r.status === 'needs-review');
  const dryRunWouldGenerate = results.filter((r) => r.status === 'dry-run-would-generate');

  console.log('━'.repeat(60));
  console.log('📊  Summary');
  console.log('━'.repeat(60));

  if (dryRun) {
    console.log(`   Would generate:  ${dryRunWouldGenerate.length}`);
    console.log(`   Would skip:      ${skipped.length}`);
    console.log(`   Needs review:    ${needsReview.length}`);
    if (needsReview.length > 0) {
      console.log(`\n   🔍  Phonemes flagged for review (NOT auto-generated):`);
      needsReview.forEach((r) => console.log(`      • ${r.id}  —  ${r.reason}`));
    }
    console.log();
    console.log('ℹ️   Dry run complete. Run without --dry-run to generate.\n');
    process.exit(0);
  }

  console.log(`   ✅  Generated:    ${generated.length}`);
  console.log(`   ⏭️   Skipped:      ${skipped.length}`);
  console.log(`   ❌  Failed:       ${failed.length}`);
  console.log(`   🔍  Needs review: ${needsReview.length}`);

  if (needsReview.length > 0) {
    console.log(`\n   🔍  Phonemes flagged for review (NOT generated):`);
    needsReview.forEach((r) => console.log(`      • ${r.id}  —  ${r.reason}`));
    console.log(`   ℹ️   These use SpeechSynthesis fallback until manually approved.`);
  }

  if (failed.length > 0) {
    console.log(`\n   ❌  Failed assets:`);
    failed.forEach((r) => console.log(`      • ${r.id}  —  ${r.reason}`));
  }

  if (generated.length > 0) {
    console.log(`\n   ✅  Generated manifest: ${path.relative(ROOT, GENERATED_MANIFEST_TS)}`);
    console.log(`   ✅  JSON manifest:      ${path.relative(ROOT, GENERATED_MANIFEST_JSON)}`);
  }

  console.log();

  if (failed.length > 0) {
    console.error('⚠️   Some assets failed. Exiting with non-zero status.\n');
    process.exit(1);
  }

  console.log('🎉  Done!\n');
}

main().catch((err) => {
  console.error('\n💥  Unexpected error:', err);
  process.exit(1);
});
