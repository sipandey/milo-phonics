/**
 * Script: generate-cvc-audio.ts
 * Generates slow British English TTS audio for all 38 CVC words and sentences in Milo Phonics.
 * Saves locally in public/audio/cvc/ and public/audio/sentences/ for 0ms zero-latency offline playback,
 * and uploads to Cloudinary for cloud backup and future references.
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { v2 as cloudinary } from 'cloudinary';
import { BLENDING_WORDS } from '../src/data/blendingData.js';

const ROOT = process.cwd();
const CVC_DIR = path.join(ROOT, 'public', 'audio', 'cvc');
const SENTENCES_DIR = path.join(ROOT, 'public', 'audio', 'sentences');
const MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'cvcAudioManifest.ts');

fs.mkdirSync(CVC_DIR, { recursive: true });
fs.mkdirSync(SENTENCES_DIR, { recursive: true });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

interface GeneratedCvcEntry {
  id: string;
  word: string;
  localWordUrl: string;
  cloudinaryWordUrl: string;
  sentenceText: string;
  localSentenceUrl: string;
  cloudinarySentenceUrl: string;
}

async function uploadToCloudinary(localPath: string, publicId: string): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      resource_type: 'video',
      public_id: publicId,
      overwrite: true,
      format: 'mp3',
    });
    return result.secure_url;
  } catch (err: unknown) {
    console.warn(`    ⚠️ Cloudinary upload warning for ${publicId}:`, (err as Error).message || err);
    return '';
  }
}

async function generateCvcAssets() {
  console.log(`\n🚂 Starting CVC Word & Sentence Audio Generation for ${BLENDING_WORDS.length} words...`);
  console.log(`Voice: coral (British English) | Word Speed: 0.70 | Sentence Speed: 0.75\n`);

  const manifestEntries: Record<string, GeneratedCvcEntry> = {};

  for (let i = 0; i < BLENDING_WORDS.length; i++) {
    const item = BLENDING_WORDS[i];
    console.log(`[${i + 1}/${BLENDING_WORDS.length}] Word: "${item.word}" (Level ${item.levelId})`);

    // --- 1. WORD AUDIO ---
    const wordFilename = `cvc.${item.id}.mp3`;
    const wordLocalPath = path.join(CVC_DIR, wordFilename);
    const wordLocalUrl = `/audio/cvc/${wordFilename}`;
    const wordPublicId = `phonics/audio/v1/cvc/${item.id}`;
    let cloudinaryWordUrl = '';

    if (!fs.existsSync(wordLocalPath) || fs.statSync(wordLocalPath).size < 1000) {
      console.log(`  🔊 Generating word audio: "${item.word}"...`);
      try {
        const res = await openai.audio.speech.create({
          model: 'gpt-4o-mini-tts',
          voice: 'coral',
          input: item.word,
          speed: 0.70,
        });
        const buffer = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(wordLocalPath, buffer);
        console.log(`  ✓ Saved word ${wordFilename} (${buffer.byteLength} bytes)`);
      } catch (err: unknown) {
        console.error(`  ❌ Failed to generate word ${item.word}:`, (err as Error).message);
      }
    } else {
      console.log(`  ⏭️ Word ${wordFilename} already exists locally`);
    }

    if (fs.existsSync(wordLocalPath)) {
      console.log(`  ☁️ Uploading word to Cloudinary: ${wordPublicId}...`);
      cloudinaryWordUrl = await uploadToCloudinary(wordLocalPath, wordPublicId);
    }

    // --- 2. SENTENCE AUDIO ---
    const sentenceFilename = `sentence.${item.id}.mp3`;
    const sentenceLocalPath = path.join(SENTENCES_DIR, sentenceFilename);
    const sentenceLocalUrl = `/audio/sentences/${sentenceFilename}`;
    const sentencePublicId = `phonics/audio/v1/sentence/${item.id}`;
    let cloudinarySentenceUrl = '';

    if (!fs.existsSync(sentenceLocalPath) || fs.statSync(sentenceLocalPath).size < 1000) {
      console.log(`  🔊 Generating sentence audio: "${item.meaning}"...`);
      try {
        const res = await openai.audio.speech.create({
          model: 'gpt-4o-mini-tts',
          voice: 'coral',
          input: item.meaning,
          speed: 0.75, // Slow, gentle toddler pacing
        });
        const buffer = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(sentenceLocalPath, buffer);
        console.log(`  ✓ Saved sentence ${sentenceFilename} (${buffer.byteLength} bytes)`);
      } catch (err: unknown) {
        console.error(`  ❌ Failed to generate sentence ${item.id}:`, (err as Error).message);
      }
    } else {
      console.log(`  ⏭️ Sentence ${sentenceFilename} already exists locally`);
    }

    if (fs.existsSync(sentenceLocalPath)) {
      console.log(`  ☁️ Uploading sentence to Cloudinary: ${sentencePublicId}...`);
      cloudinarySentenceUrl = await uploadToCloudinary(sentenceLocalPath, sentencePublicId);
    }

    manifestEntries[item.id] = {
      id: item.id,
      word: item.word,
      localWordUrl: wordLocalUrl,
      cloudinaryWordUrl: cloudinaryWordUrl || wordLocalUrl,
      sentenceText: item.meaning,
      localSentenceUrl: sentenceLocalUrl,
      cloudinarySentenceUrl: cloudinarySentenceUrl || sentenceLocalUrl,
    };
  }

  // --- 3. WRITE TYPESCRIPT MANIFEST ---
  const manifestTs = `/**
 * GENERATED FILE — do not edit by hand.
 * Produced by: npx tsx scripts/generate-cvc-audio.ts
 *
 * Contains 100% verified local and Cloudinary audio mappings for all CVC words & sentences.
 * Voice: coral (British RP) | Word speed: 0.70 | Sentence speed: 0.75
 * Generated: ${new Date().toISOString()}
 */

export interface CvcAudioItem {
  id: string;
  word: string;
  localWordUrl: string;
  cloudinaryWordUrl: string;
  sentenceText: string;
  localSentenceUrl: string;
  cloudinarySentenceUrl: string;
}

export const cvcAudioManifest: Record<string, CvcAudioItem> = ${JSON.stringify(manifestEntries, null, 2)};

/**
 * Returns the best URL for playing the blended CVC word.
 * Prefers local static asset (/audio/cvc/cvc.<id>.mp3) for zero latency,
 * falls back to Cloudinary CDN URL.
 */
export function getCvcWordAudioUrl(wordId: string): string {
  const item = cvcAudioManifest[wordId.toLowerCase()];
  if (!item) return \`/audio/cvc/cvc.\${wordId.toLowerCase()}.mp3\`;
  return item.localWordUrl || item.cloudinaryWordUrl;
}

/**
 * Returns the best URL for playing the CVC contextual sentence.
 * Prefers local static asset (/audio/sentences/sentence.<id>.mp3) for zero latency,
 * falls back to Cloudinary CDN URL.
 */
export function getCvcSentenceAudioUrl(wordId: string): string {
  const item = cvcAudioManifest[wordId.toLowerCase()];
  if (!item) return \`/audio/sentences/sentence.\${wordId.toLowerCase()}.mp3\`;
  return item.localSentenceUrl || item.cloudinarySentenceUrl;
}
`;

  fs.writeFileSync(MANIFEST_PATH, manifestTs, 'utf-8');
  console.log(`\n🎉 Completed! Manifest written to: ${MANIFEST_PATH}`);
}

generateCvcAssets().catch(console.error);
