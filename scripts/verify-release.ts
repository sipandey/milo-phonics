import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface PackageManifest {
  version: string;
}

interface ReleaseManifest {
  version: string;
  commit: string;
  channel: string;
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8')) as unknown;
}

function isReleaseManifest(value: unknown): value is ReleaseManifest {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.version === 'string'
    && typeof record.commit === 'string'
    && typeof record.channel === 'string'
  );
}

const packageManifest = readJson(resolve('package.json')) as PackageManifest;
const releasePath = resolve('dist/release.json');
const releaseManifest = readJson(releasePath);

if (!isReleaseManifest(releaseManifest)) {
  throw new Error(`Invalid release metadata at ${releasePath}`);
}

if (releaseManifest.version !== packageManifest.version) {
  throw new Error(
    `Release version ${releaseManifest.version} does not match package version ${packageManifest.version}`,
  );
}

console.log(`Release metadata verified: ${releaseManifest.version} (${releaseManifest.commit}, ${releaseManifest.channel})`);
