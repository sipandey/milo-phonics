#!/usr/bin/env python3
"""
Audio Loudness Normalization Script for Milo Phonics
Normalizes all voice audio assets across public/audio/ to peak at -1.0 dBFS,
fixing low volume on mobile devices and restoring cvc.cat.mp3.
"""

import os
import shutil
import subprocess
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_ROOT = os.path.join(ROOT, 'public', 'audio')

CATEGORIES = [
    os.path.join(AUDIO_ROOT, 'words'),
    os.path.join(AUDIO_ROOT, 'cvc'),
    os.path.join(AUDIO_ROOT, 'sentences'),
    os.path.join(AUDIO_ROOT, 'letters'),
    os.path.join(AUDIO_ROOT, 'prompts'),
    os.path.join(AUDIO_ROOT, 'praise'),
    AUDIO_ROOT,
]

def get_volume_stats(filepath):
    res = subprocess.run(
        ['ffmpeg', '-nostats', '-i', filepath, '-filter:a', 'volumedetect', '-f', 'null', '/dev/null'],
        capture_output=True, text=True
    )
    max_vol = None
    mean_vol = None
    for line in res.stderr.split('\n'):
        if 'max_volume:' in line:
            max_vol = float(line.split('max_volume:')[1].replace('dB', '').strip())
        elif 'mean_volume:' in line:
            mean_vol = float(line.split('mean_volume:')[1].replace('dB', '').strip())
    return max_vol, mean_vol

def boost_file(filepath, gain_db):
    with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as tmp:
        tmp_path = tmp.name

    res = subprocess.run(
        ['ffmpeg', '-y', '-nostats', '-i', filepath, '-filter:a', f'volume={gain_db:.1f}dB', '-b:a', '192k', tmp_path],
        capture_output=True, text=True
    )
    if res.returncode == 0:
        shutil.move(tmp_path, filepath)
        return True
    else:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        print(f"  ❌ Error boosting {filepath}: {res.stderr}")
        return False

def main():
    print("🔊 Starting Audio Loudness Normalization...")

    # Step 1: Fix cvc.cat.mp3 if silent
    cat_cvc = os.path.join(AUDIO_ROOT, 'cvc', 'cvc.cat.mp3')
    cat_word = os.path.join(AUDIO_ROOT, 'words', 'word.c-cat.mp3')
    if os.path.exists(cat_cvc) and os.path.exists(cat_word):
        max_v, mean_v = get_volume_stats(cat_cvc)
        if max_v is None or max_v < -50.0:
            print(f"  🛠️ Restoring silent cvc.cat.mp3 from word.c-cat.mp3...")
            shutil.copyfile(cat_word, cat_cvc)

    boosted_count = 0
    skipped_count = 0
    error_count = 0

    for cat_dir in CATEGORIES:
        if not os.path.exists(cat_dir):
            continue
        rel_dir = os.path.relpath(cat_dir, ROOT)
        print(f"\n📁 Scanning {rel_dir}...")

        files = [f for f in sorted(os.listdir(cat_dir)) if f.endswith('.mp3')]
        for f in files:
            # For root audio folder, only process phoneme_ and _isolation files
            if cat_dir == AUDIO_ROOT:
                if not (f.startswith('phoneme_') or f.endswith('_isolation.mp3')):
                    continue

            path = os.path.join(cat_dir, f)
            max_v, mean_v = get_volume_stats(path)

            if max_v is None:
                print(f"  ⚠️ Could not read {f}")
                error_count += 1
                continue

            # Target max peak: -1.0 dBFS
            if max_v < -1.5:
                gain_db = -1.0 - max_v
                success = boost_file(path, gain_db)
                if success:
                    print(f"  ⬆️ {f}: {max_v:.1f} dB -> -1.0 dB (boosted +{gain_db:.1f} dB)")
                    boosted_count += 1
                else:
                    error_count += 1
            else:
                skipped_count += 1

    print("\n✅ Normalization Complete!")
    print(f"   Boosted: {boosted_count} files")
    print(f"   Already optimal: {skipped_count} files")
    print(f"   Errors: {error_count} files")

if __name__ == '__main__':
    main()
