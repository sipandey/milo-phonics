export interface SentryRuntimeEnvironment {
  readonly MODE: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_SENTRY_RELEASE?: string;
  readonly VITE_SENTRY_TRACES_SAMPLE_RATE?: string;
}

export interface SentryRuntimeConfig {
  readonly dsn: string;
  readonly environment: string;
  readonly release: string | undefined;
  readonly tracesSampleRate: number;
}

const DEFAULT_TRACES_SAMPLE_RATE = 0.1;

function parseTraceSampleRate(value: string | undefined): number {
  const parsed = Number(value ?? DEFAULT_TRACES_SAMPLE_RATE);

  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1
    ? parsed
    : DEFAULT_TRACES_SAMPLE_RATE;
}

export function createSentryRuntimeConfig(
  environment: SentryRuntimeEnvironment,
): SentryRuntimeConfig | null {
  const dsn = environment.VITE_SENTRY_DSN?.trim();

  if (!dsn) {
    return null;
  }

  const release = environment.VITE_SENTRY_RELEASE?.trim();

  return {
    dsn,
    environment: environment.MODE,
    release: release || undefined,
    tracesSampleRate: parseTraceSampleRate(environment.VITE_SENTRY_TRACES_SAMPLE_RATE),
  };
}
