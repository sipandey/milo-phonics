import { describe, expect, it } from 'vitest';
import { createSentryRuntimeConfig } from '../src/observability/sentryConfig';

describe('createSentryRuntimeConfig', () => {
  it('returns a conservative browser configuration when a DSN is present', () => {
    expect(
      createSentryRuntimeConfig({
        MODE: 'production',
        VITE_SENTRY_DSN: ' https://public@example.ingest.sentry.io/1 ',
      }),
    ).toEqual({
      dsn: 'https://public@example.ingest.sentry.io/1',
      environment: 'production',
      release: undefined,
      tracesSampleRate: 0.1,
    });
  });

  it('allows a bounded trace sample rate and release override', () => {
    expect(
      createSentryRuntimeConfig({
        MODE: 'staging',
        VITE_SENTRY_DSN: 'https://public@example.ingest.sentry.io/2',
        VITE_SENTRY_RELEASE: 'phonics@1.0.0',
        VITE_SENTRY_TRACES_SAMPLE_RATE: '0.25',
      }),
    ).toEqual({
      dsn: 'https://public@example.ingest.sentry.io/2',
      environment: 'staging',
      release: 'phonics@1.0.0',
      tracesSampleRate: 0.25,
    });
  });

  it('disables setup without a DSN and falls back from unsafe rates', () => {
    expect(createSentryRuntimeConfig({ MODE: 'development' })).toBeNull();
    expect(
      createSentryRuntimeConfig({
        MODE: 'production',
        VITE_SENTRY_DSN: 'https://public@example.ingest.sentry.io/3',
        VITE_SENTRY_TRACES_SAMPLE_RATE: '2',
      })?.tracesSampleRate,
    ).toBe(0.1);
  });
});
