import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { createReleaseMetadata } from './src/release/releaseMetadata';

interface PackageManifest {
  version: string;
}

const packageManifest = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as PackageManifest;

const releaseMetadata = createReleaseMetadata(
  packageManifest.version,
  process.env.RELEASE_COMMIT ?? process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? 'local',
  process.env.RELEASE_CHANNEL ?? (process.env.CI === 'true' ? 'ci' : 'local'),
);

const releaseMetadataPlugin: Plugin = {
  name: 'emit-release-metadata',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'release.json',
      source: `${JSON.stringify(releaseMetadata, null, 2)}\n`,
    });
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), releaseMetadataPlugin],
  server: {
    port: 3000,
    open: false,
    host: true,
  },
});
