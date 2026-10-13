export interface ReleaseMetadata {
  version: string;
  commit: string;
  channel: string;
}

export type ReleaseEnvironment = Readonly<Record<string, string | undefined>>;

export function resolveReleaseChannel(environment: ReleaseEnvironment): string {
  return environment.RELEASE_CHANNEL
    ?? environment.VERCEL_ENV
    ?? (environment.CI === 'true' ? 'ci' : 'local');
}

export function createReleaseMetadata(
  version: string,
  commit: string = 'local',
  channel: string = 'local',
): ReleaseMetadata {
  return { version, commit, channel };
}
