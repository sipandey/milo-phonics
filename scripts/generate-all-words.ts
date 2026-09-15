import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { getAllLetters } from '../src/data/lettersData.js';

const ROOT = process.cwd();
const WORDS_DIR = path.join(ROOT, 'public', 'audio', 'words');

if (!fs.existsSync(WORDS_DIR)) {
  fs.mkdirSync(WORDS_DIR, { recursive: true });
}

const openai = new OpenAI();

async function generateAllWords() {
  const letters = getAllLetters();
  const objects = letters.flatMap(l => l.objects);
  console.log(`Found ${objects.length} objects across ${letters.length} letters.`);

  let generatedCount = 0;
  let skippedCount = 0;

  for (const obj of objects) {
    const filename = `${obj.wordAudioId}.mp3`;
    const filePath = path.join(WORDS_DIR, filename);

    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
      skippedCount++;
      continue;
    }

    console.log(`Generating [${obj.wordAudioId}] "${obj.name}" (voice: coral, speed: 0.70)...`);
    try {
      const response = await openai.audio.speech.create({
        model: 'gpt-4o-mini-tts',
        voice: 'coral',
        input: obj.name,
        speed: 0.70,
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(filePath, buffer);
      generatedCount++;
      console.log(`  ✓ Saved ${filename} (${buffer.byteLength} bytes)`);
    } catch (err: unknown) {
      console.error(`  ❌ Failed to generate ${obj.wordAudioId}:`, (err as Error).message);
    }
  }

  console.log(`\nDone! Generated: ${generatedCount}, Skipped: ${skippedCount}`);
}

generateAllWords().catch(console.error);
