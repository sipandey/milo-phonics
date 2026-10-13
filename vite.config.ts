import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { createReleaseMetadata, resolveReleaseChannel } from './src/release/releaseMetadata';

interface PackageManifest {
  version: string;
}

const packageManifest = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as PackageManifest;

const releaseMetadata = createReleaseMetadata(
  packageManifest.version,
  process.env.RELEASE_COMMIT ?? process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? 'local',
  resolveReleaseChannel(process.env),
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

const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;
const shouldUploadSentrySourceMaps = Boolean(sentryAuthToken);
const sentryBuildPlugin = shouldUploadSentrySourceMaps
  ? sentryVitePlugin({
      org: process.env.SENTRY_ORG ?? 'personal-df4',
      project: process.env.SENTRY_PROJECT ?? 'milo-phonics',
      authToken: sentryAuthToken,
      release: { name: releaseMetadata.version },
      sourcemaps: { filesToDeleteAfterUpload: ['dist/**/*.js.map'] },
      telemetry: false,
    })
  : null;

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.VITE_SENTRY_RELEASE': JSON.stringify(
      process.env.VITE_SENTRY_RELEASE ?? releaseMetadata.version,
    ),
  },
  plugins: [
    react(),
    releaseMetadataPlugin,
    ...(sentryBuildPlugin ? [sentryBuildPlugin] : []),
  ],
  build: {
    sourcemap: shouldUploadSentrySourceMaps ? 'hidden' : false,
  },
  server: {
    port: 3000,
    open: false,
    host: true,
  },
});
