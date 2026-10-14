import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

interface PwaIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}

interface PwaManifest {
  name: string;
  short_name: string;
  start_url: string;
  scope: string;
  display: string;
  theme_color: string;
  background_color: string;
  icons: PwaIcon[];
}

const projectRoot = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const manifestPath = join(projectRoot, 'public', 'manifest.webmanifest');
const indexPath = join(projectRoot, 'index.html');

describe('PWA install contract', () => {
  it('defines a standalone manifest with install icons', () => {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as PwaManifest;

    expect(manifest.name).toBe('Milo Phonics');
    expect(manifest.short_name).toBe('Milo');
    expect(manifest.start_url).toBe('/');
    expect(manifest.scope).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#FFD166');
    expect(manifest.background_color).toBe('#FFF8E7');

    const iconSizes = manifest.icons.map((icon) => icon.sizes);
    expect(iconSizes).toEqual(expect.arrayContaining(['192x192', '512x512']));
    expect(manifest.icons.some((icon) => icon.purpose === 'maskable')).toBe(true);

    for (const icon of manifest.icons) {
      const iconPath = join(projectRoot, 'public', icon.src.replace(/^\//, ''));
      expect(existsSync(iconPath)).toBe(true);

      const iconBytes = readFileSync(iconPath);
      expect(iconBytes.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

      const [width, height] = icon.sizes.split('x').map(Number);
      expect(iconBytes.readUInt32BE(16)).toBe(width);
      expect(iconBytes.readUInt32BE(20)).toBe(height);
    }
  });

  it('links the manifest and iOS install metadata from the app shell', () => {
    const indexHtml = readFileSync(indexPath, 'utf8');

    expect(indexHtml).toContain('<link rel="manifest" href="/manifest.webmanifest" />');
    expect(indexHtml).toContain('<link rel="apple-touch-icon" href="/icons/milo-180.png" />');
    expect(indexHtml).toContain('<meta name="apple-mobile-web-app-capable" content="yes" />');
    expect(indexHtml).toContain('<meta name="apple-mobile-web-app-title" content="Milo Phonics" />');
  });
});
