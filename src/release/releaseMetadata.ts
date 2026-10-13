export interface ReleaseMetadata {
  version: string;
  commit: string;
  channel: string;
}

export function createReleaseMetadata(
  version: string,
  commit: string = 'local',
  channel: string = 'local',
): ReleaseMetadata {
  return { version, commit, channel };
}
