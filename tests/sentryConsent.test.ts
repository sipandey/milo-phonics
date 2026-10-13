import { describe, expect, it } from 'vitest';
import {
  getSentryConsent,
  setSentryConsent,
  SENTRY_CONSENT_STORAGE_KEY,
  type SentryConsentStorage,
} from '../src/observability/sentryConsent';

function createStorage(initialValue?: string): SentryConsentStorage {
  let value = initialValue;

  return {
    getItem: () => value ?? null,
    setItem: (_key, nextValue) => {
      value = nextValue;
    },
  };
}

describe('Sentry consent storage', () => {
  it('defaults to denied when no decision is stored', () => {
    expect(getSentryConsent(createStorage())).toBe(false);
  });

  it('persists and reads an explicit parent decision', () => {
    const storage = createStorage();

    expect(setSentryConsent(true, storage)).toBe(true);
    expect(storage.getItem(SENTRY_CONSENT_STORAGE_KEY)).toBe('granted');
    expect(getSentryConsent(storage)).toBe(true);

    expect(setSentryConsent(false, storage)).toBe(true);
    expect(storage.getItem(SENTRY_CONSENT_STORAGE_KEY)).toBe('denied');
    expect(getSentryConsent(storage)).toBe(false);
  });

  it('fails closed when storage is unavailable or contains an unknown value', () => {
    const unavailableStorage: SentryConsentStorage = {
      getItem: () => {
        throw new Error('private browsing storage unavailable');
      },
      setItem: () => {
        throw new Error('private browsing storage unavailable');
      },
    };

    expect(getSentryConsent(unavailableStorage)).toBe(false);
    expect(setSentryConsent(true, unavailableStorage)).toBe(false);
    expect(getSentryConsent(createStorage('unknown'))).toBe(false);
  });
});
