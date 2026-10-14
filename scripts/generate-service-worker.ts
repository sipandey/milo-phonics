import { resolve } from 'node:path';
import { writeFileSync } from 'node:fs';
import {
  collectPrecacheUrls,
  createCacheName,
  createPrecacheDigest,
  createServiceWorkerSource,
  ensureDirectoryExists,
  readReleaseManifest,
} from './serviceWorker.ts';

const distDirectory = resolve('dist');
ensureDirectoryExists(distDirectory);

const releaseManifest = readReleaseManifest(resolve(distDirectory, 'release.json'));
const precacheUrls = collectPrecacheUrls(distDirectory);
if (!precacheUrls.includes('/index.html')) {
  throw new Error('The built app shell is missing from the service-worker precache list.');
}

const precacheDigest = createPrecacheDigest(distDirectory, precacheUrls);
const cacheName = createCacheName(releaseManifest, precacheDigest);
const serviceWorkerSource = createServiceWorkerSource({ cacheName, precacheUrls });
writeFileSync(resolve(distDirectory, 'sw.js'), serviceWorkerSource);

console.log(
  `Service worker generated: ${precacheUrls.length} precache URLs (${cacheName})`,
);
